import { cn } from "@/lib/utils";

const VALUE_TONE_MAP = {
  good: "bg-status-good-bg text-status-good",
  warn: "bg-status-warn-bg text-status-warn",
  danger: "bg-status-danger-bg text-status-danger",
  neutral: "bg-muted text-foreground",
} as const;

export type KeyFindingRowProps = {
  label: string;
  value: React.ReactNode;
  tone?: keyof typeof VALUE_TONE_MAP;
  hint?: React.ReactNode;
  className?: string;
};

/**
 * Inline label + value-badge row.
 * Used in mockup v3 section ③ "posture key findings" right column.
 */
export function KeyFindingRow({
  label,
  value,
  tone = "neutral",
  hint,
  className,
}: KeyFindingRowProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3 py-1.5", className)}>
      <div className="min-w-0 flex flex-col">
        <span className="font-body text-sm text-foreground">{label}</span>
        {hint && (
          <span className="font-body text-xs text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2.5 py-1 font-body text-sm font-medium tabular-nums shrink-0",
          VALUE_TONE_MAP[tone]
        )}
      >
        {value}
      </span>
    </div>
  );
}
