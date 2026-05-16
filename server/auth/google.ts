import { Google, generateState, generateCodeVerifier, decodeIdToken } from "arctic";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";

const STATE_COOKIE = "google_oauth_state";
const VERIFIER_COOKIE = "google_oauth_verifier";
const TEN_MINUTES_MS = 10 * 60 * 1000;

type GoogleIdTokenClaims = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
};

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return new Google(clientId, clientSecret, redirectUri);
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

export function registerGoogleAuthRoutes(app: Express) {
  // Step 1: redirect user to Google's authorize URL
  app.get("/api/auth/google", async (req: Request, res: Response) => {
    const google = getGoogleClient();
    if (!google) {
      res.status(503).json({
        error:
          "Google OAuth not configured. Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI.",
      });
      return;
    }

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    const cookieOptions = {
      ...getSessionCookieOptions(req),
      maxAge: TEN_MINUTES_MS,
    };
    res.cookie(STATE_COOKIE, state, cookieOptions);
    res.cookie(VERIFIER_COOKIE, codeVerifier, cookieOptions);

    res.redirect(302, url.toString());
  });

  // Step 2: callback — validate state + exchange code + upsert + session cookie
  app.get(
    "/api/auth/google/callback",
    async (req: Request, res: Response) => {
      const google = getGoogleClient();
      if (!google) {
        res.status(503).send("Google OAuth not configured");
        return;
      }

      const code = getQueryParam(req, "code");
      const state = getQueryParam(req, "state");
      const cookies = parseCookies(req.headers.cookie);
      const storedState = cookies[STATE_COOKIE];
      const codeVerifier = cookies[VERIFIER_COOKIE];

      if (!code || !state || !storedState || !codeVerifier) {
        res.status(400).send("Missing OAuth parameters");
        return;
      }
      if (state !== storedState) {
        res.status(400).send("OAuth state mismatch");
        return;
      }

      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(STATE_COOKIE, cookieOptions);
      res.clearCookie(VERIFIER_COOKIE, cookieOptions);

      try {
        const tokens = await google.validateAuthorizationCode(
          code,
          codeVerifier
        );
        const idToken = tokens.idToken();
        const claims = decodeIdToken(idToken) as GoogleIdTokenClaims;

        if (!claims.sub) {
          res.status(400).send("Google id_token missing sub claim");
          return;
        }

        const openId = `google:${claims.sub}`;

        await db.upsertUser({
          openId,
          name: claims.name ?? null,
          email: claims.email ?? null,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, {
          name: claims.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        res.redirect(302, "/clients");
      } catch (error) {
        console.error("[Google OAuth] Callback failed", error);
        res.status(500).send("Google OAuth callback failed");
      }
    }
  );
}
