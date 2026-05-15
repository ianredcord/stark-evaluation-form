import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  MoreVertical,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { AutosaveStatus } from "@/lib/useAutosave";

export type AssessmentHeaderTab = {
  key: string;
  label: string;
};

export type AssessmentHeaderProps = {
  title: string;
  tagLabel?: string;
  autosaveAt?: string;
  autosaveStatus?: AutosaveStatus;
  tabs: readonly AssessmentHeaderTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  onBack?: () => void;
  onImport?: () => void;
};

function AutosaveBadge({
  status,
  at,
}: {
  status: AutosaveStatus;
  at?: string;
}) {
  if (status === "saving")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        儲存中...
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        有未儲存變更
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-status-danger">
        <AlertCircle className="w-3.5 h-3.5" />
        儲存失敗
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-status-good">
      <CheckCircle2 className="w-3.5 h-3.5" />
      已自動儲存{at && ` ${at}`}
    </span>
  );
}

export function AssessmentHeader({
  title,
  tagLabel = "治療師工作頁面",
  autosaveAt,
  autosaveStatus = "saved",
  tabs,
  activeTab,
  onTabChange,
  onBack,
  onImport,
}: AssessmentHeaderProps) {
  return (
    <header className="bg-card border-b">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回客戶列表</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <AutosaveBadge status={autosaveStatus} at={autosaveAt} />
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">匯入資料</span>
          </Button>
          <button className="p-1.5 rounded-md hover:bg-muted" aria-label="More">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 px-4 sm:px-6 pt-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {title}
          </h1>
          {tagLabel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-accent/10 text-brand-accent">
              {tagLabel}
            </span>
          )}
        </div>
      </div>

      <nav className="px-4 sm:px-6 mt-4 flex items-center gap-1 border-b -mb-px overflow-x-auto">
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
