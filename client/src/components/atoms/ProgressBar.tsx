import { cn } from "@/lib/utils";

const COLOR_MAP = {
  primary: "bg-brand-primary",
  accent: "bg-brand-accent",
  good: "bg-status-good",
  warn: "bg-status-warn",
  danger: "bg-status-danger",
} as const;

const SIZE_MAP = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
} as const;

export type ProgressBarProps = {
  value: number;
  max?: number;
  size?: keyof typeof SIZE_MAP;
  color?: keyof typeof COLOR_MAP;
  segments?: number;
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  color = "primary",
  segments,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const pct = (clamped / max) * 100;

  if (segments && segments > 1) {
    const filled = Math.round((clamped / max) * segments);
    return (
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn("flex gap-1", className)}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 rounded-full",
              SIZE_MAP[size],
              i < filled ? COLOR_MAP[color] : "bg-muted"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "w-full overflow-hidden rounded-full bg-muted",
        SIZE_MAP[size],
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", COLOR_MAP[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
