import { Button } from "@/components/ui/button";
import { LogIn, ShieldCheck } from "lucide-react";

const GOOGLE_AUTH_URL = "/api/auth/google";
const LINE_AUTH_URL = "/api/auth/line";

function GoogleLogo() {
  return (
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
  );
}

function LineLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
      <path
        fill="#06C755"
        d="M19.365 9.89c.5 0 .906.406.906.906 0 .5-.406.906-.906.906h-2.523v1.617h2.523c.5 0 .906.406.906.906 0 .5-.406.906-.906.906h-3.43c-.5 0-.906-.406-.906-.906v-6.86c0-.5.406-.906.906-.906h3.43c.5 0 .906.406.906.906 0 .5-.406.906-.906.906h-2.523v1.617h2.523zm-5.957 5.235c0 .39-.25.738-.625.86-.094.03-.188.046-.281.046-.297 0-.578-.14-.766-.39l-3.516-4.778v4.262c0 .5-.406.906-.906.906-.5 0-.906-.406-.906-.906V8.265c0-.39.25-.737.625-.859.094-.03.188-.046.281-.046.297 0 .578.14.766.39l3.516 4.777V8.266c0-.5.406-.906.906-.906.5 0 .906.406.906.906v6.86zM5.547 16.03c-.5 0-.906-.406-.906-.906V8.265c0-.5.406-.906.906-.906.5 0 .906.406.906.906v6.86c0 .5-.406.906-.906.906zM24 10.314C24 4.793 18.514.297 11.776.297 5.04.297-.448 4.792-.448 10.314c0 4.943 4.354 9.083 10.236 9.876.4.086.94.262 1.078.604.124.31.082.798.04 1.114l-.174 1.05c-.054.31-.247 1.213 1.06.661 1.308-.55 7.06-4.157 9.62-7.114h.001c1.769-1.939 2.617-3.91 2.617-6.09zM11.776 2.027c5.823 0 10.564 3.776 10.564 8.42 0 5.211-5.428 9.398-9.16 11.014-.158.068-.346.123-.346-.196l.005-1.04c0-.347.083-.7.197-.967.114-.272.297-.477.514-.574.83-.366 5.428-2.5 7.6-4.788.81-.86 1.49-1.928 1.49-3.45 0-3.768-3.79-6.823-8.864-6.823-5.075 0-8.864 3.055-8.864 6.823 0 3.768 3.789 6.823 8.864 6.823.276 0 .547-.014.815-.039l.022-.002a.85.85 0 0 1 .763.473c.142.273.143.601.005.886-.215.443-.535.825-.952 1.137-1.04.78-3.65 2.158-4.182 2.41C7.86 21.4 2.953 17.213 2.953 12.002c0-4.644 4.74-8.42 10.564-8.42z"
      />
    </svg>
  );
}

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
          <p className="text-sm text-muted-foreground">運動科學評估系統</p>
        </div>

        <div className="rounded-md bg-status-warn-bg text-status-warn p-3 text-xs flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">目前處於開發模式</p>
            <p className="opacity-90">
              所有訪客自動以治療師「林昱辰」身份進入。
              <br />
              Google / LINE 登入待 Phase 2 接入 credentials。
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
            disabled
            className="w-full gap-2 bg-white text-foreground border hover:bg-muted"
            variant="outline"
          >
            <GoogleLogo />
            使用 Google 登入
            <span className="ml-auto text-[10px] text-muted-foreground">
              即將上線
            </span>
          </Button>

          <Button
            onClick={() => (window.location.href = LINE_AUTH_URL)}
            disabled
            className="w-full gap-2 bg-[#06C755] hover:bg-[#05a847] text-white border-0"
          >
            <LineLogo />
            使用 LINE 登入
            <span className="ml-auto text-[10px] text-white/80">即將上線</span>
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                目前可用
              </span>
            </div>
          </div>

          <Button
            onClick={() => (window.location.href = "/clients")}
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
