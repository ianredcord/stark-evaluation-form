import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  MapPin,
  PersonStanding,
  Activity as ActivityIcon,
  Scale,
  Sparkles,
  HelpCircle,
  Phone,
  Download,
} from "lucide-react";

const SIDEBAR_NAV = [
  { key: "overview", label: "總覽", icon: Home },
  { key: "body-map", label: "身體地圖", icon: MapPin },
  { key: "posture", label: "姿勢分析", icon: PersonStanding },
  { key: "movement", label: "動作能力", icon: ActivityIcon },
  { key: "composition", label: "體組成", icon: Scale },
  { key: "plan", label: "改善方案", icon: Sparkles },
] as const;

export type ClientReportLayoutProps = {
  shareCode?: string;
  onDownloadPdf?: () => void;
  children: React.ReactNode;
};

export function ClientReportLayout({
  shareCode,
  onDownloadPdf,
  children,
}: ClientReportLayoutProps) {
  return (
    <div className="flex min-h-screen bg-client-warm text-foreground font-body">
      <aside className="w-48 shrink-0 bg-brand-primary text-white flex flex-col sticky top-0 h-screen">
        <div className="px-5 pt-5 pb-6">
          <div className="inline-flex items-center gap-2">
            <span className="text-brand-accent text-xl">✦</span>
            <span className="font-display text-xl font-bold tracking-wide">
              STARK
            </span>
          </div>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {SIDEBAR_NAV.map((item, i) => {
            const Icon = item.icon;
            const active = i === 0;
            return (
              <a
                key={item.key}
                href={`#${item.key}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="px-2 pb-3 space-y-0.5 border-t border-white/10 pt-3">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <HelpCircle className="w-4 h-4" />
            <span>需要協助?</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <Phone className="w-4 h-4" />
            <span>聯絡我們</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="flex items-center justify-end gap-3 px-8 pt-5">
          {shareCode && (
            <span className="text-xs text-muted-foreground tabular-nums">
              連結代碼 {shareCode}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadPdf}
            className="gap-1.5 bg-card"
          >
            <Download className="w-4 h-4" />
            下載 PDF
          </Button>
        </header>
        <div className="px-8 pb-10 pt-2">{children}</div>
      </main>
    </div>
  );
}
