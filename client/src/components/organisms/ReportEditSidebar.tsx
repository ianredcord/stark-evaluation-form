import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, AlertTriangle, CalendarDays, RefreshCw } from "lucide-react";

export type ReportEditSidebarProps = {
  plainExplanation: string;
  onPlainExplanationChange?: (v: string) => void;
  risk: {
    score: number;
    label: string;
    tone: "good" | "warn" | "danger";
    note: string;
  };
  recommendedPlan: readonly string[];
  reassessDate: string;
  reassessHint: string;
  notes: string;
  onNotesChange?: (v: string) => void;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  onSaveDraft?: () => void;
  onAssignPlan?: () => void;
  onGenerateReport?: () => void;
  onRefreshPreview?: () => void;
};

const TONE_RING = {
  good: "stroke-status-good",
  warn: "stroke-status-warn",
  danger: "stroke-status-danger",
} as const;

const TONE_TEXT = {
  good: "text-status-good",
  warn: "text-status-warn",
  danger: "text-status-danger",
} as const;

export function ReportEditSidebar({
  plainExplanation,
  onPlainExplanationChange,
  risk,
  recommendedPlan,
  reassessDate,
  reassessHint,
  notes,
  onNotesChange,
  lastUpdatedBy,
  lastUpdatedAt,
  onSaveDraft,
  onAssignPlan,
  onGenerateReport,
  onRefreshPreview,
}: ReportEditSidebarProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - risk.score / 100);

  return (
    <aside className="w-80 shrink-0 border-l bg-card flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-semibold">客戶報告摘要預覽</h2>
        <button
          onClick={onRefreshPreview}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          重新整理預覽
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Plain explanation */}
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">
              白話說明{" "}
              <span className="text-xs text-muted-foreground">(給客戶)</span>
            </h3>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <textarea
            value={plainExplanation}
            onChange={(e) => onPlainExplanationChange?.(e.target.value)}
            className="w-full text-xs rounded-md border bg-background p-2.5 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            rows={5}
          />
        </section>

        {/* Risk level */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">風險等級</h3>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="flex items-start gap-3">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  fill="none"
                  strokeWidth="5"
                  className="stroke-muted"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  fill="none"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className={TONE_RING[risk.tone]}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold tabular-nums">
                {risk.score}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-semibold",
                  TONE_TEXT[risk.tone]
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {risk.label}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {risk.note}
              </p>
            </div>
          </div>
        </section>

        {/* Recommended plan */}
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">建議方案</h3>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <ul className="space-y-1">
            {recommendedPlan.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs">
                <span className="text-status-good mt-0.5 shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Reassess */}
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">複評時間</h3>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 rounded-md bg-bg-subtle p-2.5">
            <CalendarDays className="w-4 h-4 text-brand-primary shrink-0" />
            <span className="font-display text-sm font-semibold tabular-nums">
              {reassessDate}
            </span>
            <span className="text-xs text-muted-foreground">
              ({reassessHint})
            </span>
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">
              備註 <span className="text-xs text-muted-foreground">(選填)</span>
            </h3>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange?.(e.target.value)}
            rows={3}
            className="w-full text-xs rounded-md border bg-background p-2.5 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </section>
      </div>

      {/* Sticky actions */}
      <div className="p-4 border-t space-y-2 bg-card">
        <Button variant="outline" className="w-full" onClick={onSaveDraft}>
          儲存草稿
        </Button>
        <Button
          className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white"
          onClick={onAssignPlan}
        >
          指派治療計畫
        </Button>
        <Button
          className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white"
          onClick={onGenerateReport}
        >
          產生客戶報告
        </Button>
        {lastUpdatedBy && lastUpdatedAt && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            最後更新:{lastUpdatedBy} {lastUpdatedAt}
          </p>
        )}
      </div>
    </aside>
  );
}
