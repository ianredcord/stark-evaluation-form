import { cn } from "@/lib/utils";
import { useCountUp } from "@/lib/motion";

const SIZE_MAP = {
  sm: { dim: 48, stroke: 4, font: "text-sm" },
  md: { dim: 96, stroke: 6, font: "text-2xl" },
  lg: { dim: 160, stroke: 10, font: "text-5xl" },
  xl: { dim: 220, stroke: 14, font: "text-6xl" },
} as const;

const COLOR_MAP = {
  primary: "text-brand-primary",
  accent: "text-brand-accent",
  good: "text-status-good",
  warn: "text-status-warn",
  danger: "text-status-danger",
} as const;

export type ScoreRingProps = {
  value: number;
  max?: number;
  size?: keyof typeof SIZE_MAP;
  color?: keyof typeof COLOR_MAP;
  showValue?: boolean;
  label?: string;
  animate?: boolean;
  className?: string;
};

export function ScoreRing({
  value,
  max = 100,
  size = "md",
  color = "primary",
  showValue = true,
  label,
  animate = true,
  className,
}: ScoreRingProps) {
  const { dim, stroke, font } = SIZE_MAP[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(value, max));
  const animatedValue = useCountUp(animate ? clamped : clamped, animate ? 1100 : 0);
  const displayValue = animate ? animatedValue : clamped;
  const offset = circumference * (1 - displayValue / max);

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          className={cn("-rotate-90", COLOR_MAP[color])}
          aria-hidden="true"
        >
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-muted"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            stroke="currentColor"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
        </svg>
        {showValue && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center font-display font-bold tabular-nums",
              font,
              COLOR_MAP[color]
            )}
          >
            {displayValue}
          </div>
        )}
      </div>
      {label && (
        <span className="font-body text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
