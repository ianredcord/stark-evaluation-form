import { cn } from "@/lib/utils";
import { IconBadge } from "@/components/atoms/IconBadge";
import { StatusPill } from "@/components/atoms/StatusPill";

export type SubScoreCardProps = {
  label: string;
  value: number;
  max?: number;
  icon?: React.ReactNode;
  iconBg?: "primary" | "accent" | "warm" | "violet" | "good" | "warn" | "danger" | "muted";
  status?: { label: string; tone: "good" | "warn" | "danger" | "neutral" };
  trend?: number;
  className?: string;
};

export function SubScoreCard({
  label,
  value,
  max = 100,
  icon,
  iconBg = "primary",
  status,
  trend,
  className,
}: SubScoreCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {icon && <IconBadge icon={icon} bg={iconBg} size="md" />}
        {status && (
          <StatusPill status={status.tone} size="sm">
            {status.label}
          </StatusPill>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        <span className="font-body text-xs text-muted-foreground">/ {max}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-sm text-foreground">{label}</span>
        {typeof trend === "number" && trend !== 0 && (
          <span
            className={cn(
              "font-body text-xs tabular-nums",
              trend > 0 ? "text-status-good" : "text-status-danger"
            )}
          >
            {trend > 0 ? `▲ +${trend}` : `▼ ${trend}`}
          </span>
        )}
      </div>
    </div>
  );
}
