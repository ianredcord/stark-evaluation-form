import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Download, MoreVertical } from "lucide-react";

export type AssessmentHeaderTab = {
  key: string;
  label: string;
};

export type AssessmentHeaderProps = {
  title: string;
  tagLabel?: string;
  autosaveAt?: string;
  tabs: readonly AssessmentHeaderTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  onBack?: () => void;
  onImport?: () => void;
};

export function AssessmentHeader({
  title,
  tagLabel = "治療師工作頁面",
  autosaveAt,
  tabs,
  activeTab,
  onTabChange,
  onBack,
  onImport,
}: AssessmentHeaderProps) {
  return (
    <header className="bg-card border-b">
      <div className="flex items-center justify-between gap-4 px-6 pt-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            返回客戶列表
          </button>
        </div>
        <div className="flex items-center gap-3">
          {autosaveAt && (
            <span className="inline-flex items-center gap-1.5 text-xs text-status-good">
              <CheckCircle2 className="w-3.5 h-3.5" />
              已自動儲存 {autosaveAt}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            匯入資料
          </Button>
          <button className="p-1.5 rounded-md hover:bg-muted" aria-label="More">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 px-6 pt-2">
        <div className="flex items-baseline gap-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {title}
          </h1>
          {tagLabel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-accent/10 text-brand-accent">
              {tagLabel}
            </span>
          )}
        </div>
      </div>

      <nav className="px-6 mt-4 flex items-center gap-1 border-b -mb-px overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                active
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
