import { cn } from "@/lib/utils";
import { ScoreRing, type ScoreRingProps } from "@/components/atoms/ScoreRing";
import { StatusPill } from "@/components/atoms/StatusPill";

export type ScoreCardProps = {
  value: number;
  max?: number;
  title: string;
  subtitle?: React.ReactNode;
  trend?: { delta: number; label?: string };
  status?: { label: string; tone: "good" | "warn" | "danger" | "neutral" };
  ringSize?: ScoreRingProps["size"];
  ringColor?: ScoreRingProps["color"];
  className?: string;
};

export function ScoreCard({
  value,
  max = 100,
  title,
  subtitle,
  trend,
  status,
  ringSize = "lg",
  ringColor = "primary",
  className,
}: ScoreCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-5 rounded-lg border bg-card p-5",
        className
      )}
    >
      <ScoreRing value={value} max={max} size={ringSize} color={ringColor} />
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {title}
          </h3>
          {status && (
            <StatusPill status={status.tone} size="sm">
              {status.label}
            </StatusPill>
          )}
        </div>
        {subtitle && (
          <p className="font-body text-sm text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <p
            className={cn(
              "font-body text-xs tabular-nums",
              trend.delta > 0
                ? "text-status-good"
                : trend.delta < 0
                  ? "text-status-danger"
                  : "text-muted-foreground"
            )}
          >
            {trend.delta > 0 ? "▲" : trend.delta < 0 ? "▼" : "—"}{" "}
            {trend.delta > 0 ? `+${trend.delta}` : trend.delta}{" "}
            {trend.label ?? "與上次相比"}
          </p>
        )}
      </div>
    </div>
  );
}
