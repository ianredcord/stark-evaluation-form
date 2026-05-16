/**
 * Runtime database migrator.
 *
 * Runs before the server starts (chained in package.json `start` script).
 * Replaces the previously attempted Railway preDeployCommand which caused
 * deploy crashes.
 *
 * Uses drizzle-orm's built-in mysql2 migrator (not drizzle-kit CLI) so we
 * only need runtime deps. Migration files live in ./drizzle/ and are
 * tracked in the __drizzle_migrations table inside MySQL.
 *
 * Behavior:
 *  - If DATABASE_URL is empty / unset, skip silently (local dev tools).
 *  - On migration failure, exit non-zero so the chained start command
 *    aborts and Railway keeps the previous deployment alive (no traffic
 *    switch to a half-migrated container).
 *  - On success, log applied count and exit zero so server starts.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[migrate] DATABASE_URL not set, skipping migration.");
    return;
  }

  // Migration files are checked into drizzle/ at the repo root. After
  // esbuild bundles this script to dist/migrate.js, drizzle/ is still
  // copied alongside in the Railway image (Nixpacks ships the whole
  // repo). Resolve relative to current working directory which Railway
  // sets to the repo root before running `pnpm start`.
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");
  console.log(`[migrate] using migrations folder: ${migrationsFolder}`);

  const connection = await mysql.createConnection(url);
  try {
    const db = drizzle(connection);
    const t0 = Date.now();
    await migrate(db, { migrationsFolder });
    console.log(`[migrate] done in ${Date.now() - t0}ms`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("[migrate] FAILED:", err);
  process.exit(1);
});
