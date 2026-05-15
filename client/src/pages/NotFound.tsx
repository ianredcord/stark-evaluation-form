import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-client-warm p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex w-20 h-20 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <p className="font-display text-6xl font-bold text-brand-primary tabular-nums">
            404
          </p>
          <h1 className="font-display text-2xl font-semibold">
            找不到這個頁面
          </h1>
          <p className="text-sm text-muted-foreground">
            這個網址可能已經失效,或被治療師回收了。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            上一頁
          </Button>
          <Button
            onClick={() => setLocation("/")}
            className="gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white"
          >
            <Home className="w-4 h-4" />
            回首頁
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          如果是客戶報告連結失效,請聯絡你的治療師重新發送。
        </p>
      </div>
    </div>
  );
}
