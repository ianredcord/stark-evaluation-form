import { Button } from "@/components/ui/button";
import { LogIn, ShieldCheck } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-client-warm p-4">
      <div className="w-full max-w-sm bg-card rounded-xl border shadow-sm p-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-brand-accent text-2xl">✦</span>
            <span className="font-display text-2xl font-bold text-brand-primary tracking-wide">
              STARK
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            運動科學評估系統
          </p>
        </div>

        <div className="rounded-md bg-status-warn-bg text-status-warn p-3 text-xs flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">目前處於開發模式</p>
            <p className="opacity-90">
              所有訪客自動以治療師「林昱辰」身份進入。
              Production OAuth 將在 Phase 2 接入 Google Workspace。
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            disabled
            className="w-full gap-2 bg-white text-foreground border hover:bg-muted"
            variant="outline"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09a6.987 6.987 0 0 1 0-4.18V7.07H2.18a11.001 11.001 0 0 0 0 9.86l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            使用 Google 登入(Phase 2)
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            className="w-full gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white"
          >
            <LogIn className="w-4 h-4" />
            以治療師身份進入(Dev)
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          客戶端報告請使用治療師提供的連結進入,
          <br />
          不需要在此登入。
        </p>
      </div>
    </div>
  );
}
