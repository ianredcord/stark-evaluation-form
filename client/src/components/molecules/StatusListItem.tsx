import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { StatusPill } from "@/components/atoms/StatusPill";

export type StatusListItemProps = {
  label: string;
  value?: number;
  max?: number;
  status: "good" | "warn" | "danger" | "neutral";
  statusLabel?: string;
  hint?: React.ReactNode;
  showBar?: boolean;
  className?: string;
};

const STATUS_TO_COLOR = {
  good: "good",
  warn: "warn",
  danger: "danger",
  neutral: "primary",
} as const;

const DEFAULT_STATUS_LABEL = {
  good: "正常",
  warn: "注意",
  danger: "嚴重",
  neutral: "待評估",
};

export function StatusListItem({
  label,
  value,
  max = 100,
  status,
  statusLabel,
  hint,
  showBar = true,
  className,
}: StatusListItemProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 py-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-body text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          {typeof value === "number" && (
            <span className="font-body text-sm font-medium tabular-nums text-foreground">
              {value}
              <span className="text-muted-foreground">/{max}</span>
            </span>
          )}
          <StatusPill status={status} size="sm">
            {statusLabel ?? DEFAULT_STATUS_LABEL[status]}
          </StatusPill>
        </div>
      </div>
      {showBar && typeof value === "number" && (
        <ProgressBar
          value={value}
          max={max}
          size="sm"
          color={STATUS_TO_COLOR[status]}
        />
      )}
      {hint && (
        <p className="font-body text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
