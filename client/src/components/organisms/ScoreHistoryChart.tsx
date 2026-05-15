import { cn } from "@/lib/utils";

export type ScoreHistoryPoint = {
  date: string;
  value: number;
  label?: string;
};

export type ScoreHistoryChartProps = {
  points: readonly ScoreHistoryPoint[];
  /** Y-axis max, default 100 */
  max?: number;
  /** Y-axis min, default 0 */
  min?: number;
  /** Color token */
  color?: "primary" | "accent" | "good" | "warn" | "danger";
  className?: string;
};

const STROKE_MAP = {
  primary: "stroke-brand-primary",
  accent: "stroke-brand-accent",
  good: "stroke-status-good",
  warn: "stroke-status-warn",
  danger: "stroke-status-danger",
} as const;

const FILL_MAP = {
  primary: "fill-brand-primary",
  accent: "fill-brand-accent",
  good: "fill-status-good",
  warn: "fill-status-warn",
  danger: "fill-status-danger",
} as const;

/**
 * Simple SVG line chart for evaluation score trends. Pure SVG (no chart
 * lib) so it ships with no extra deps and stays small. Pads left/right
 * with 12% margins; y-axis has 3 horizontal guide lines.
 */
export function ScoreHistoryChart({
  points,
  max = 100,
  min = 0,
  color = "primary",
  className,
}: ScoreHistoryChartProps) {
  if (points.length === 0) return null;

  const W = 600;
  const H = 220;
  const padX = 40;
  const padY = 24;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const xAt = (i: number) =>
    points.length <= 1
      ? padX + innerW / 2
      : padX + (i / (points.length - 1)) * innerW;
  const yAt = (v: number) =>
    padY + (1 - (v - min) / (max - min)) * innerH;

  const polyline = points.map((p, i) => `${xAt(i)},${yAt(p.value)}`).join(" ");

  // Build area path for soft fill
  const areaPath =
    `M ${xAt(0)},${H - padY}` +
    points.map((p, i) => ` L ${xAt(i)},${yAt(p.value)}`).join("") +
    ` L ${xAt(points.length - 1)},${H - padY} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("w-full h-auto", className)}
      role="img"
      aria-label="Score history chart"
    >
      {/* Y-axis gridlines */}
      {[0, 25, 50, 75, 100].map((y) => (
        <g key={y}>
          <line
            x1={padX}
            x2={W - padX}
            y1={yAt(y)}
            y2={yAt(y)}
            className="stroke-muted"
            strokeWidth="1"
            strokeDasharray={y === 0 ? "" : "2 3"}
          />
          <text
            x={padX - 6}
            y={yAt(y) + 3}
            textAnchor="end"
            className="text-[10px] fill-muted-foreground tabular-nums"
          >
            {y}
          </text>
        </g>
      ))}

      {/* Soft area fill */}
      <path
        d={areaPath}
        className={cn(FILL_MAP[color])}
        opacity="0.08"
      />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        className={cn(STROKE_MAP[color])}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Data points + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={xAt(i)}
            cy={yAt(p.value)}
            r="4"
            className={cn(FILL_MAP[color])}
          />
          <circle
            cx={xAt(i)}
            cy={yAt(p.value)}
            r="2"
            className="fill-card"
          />
          <text
            x={xAt(i)}
            y={yAt(p.value) - 10}
            textAnchor="middle"
            className="text-[11px] font-semibold fill-foreground tabular-nums"
          >
            {p.value}
          </text>
          <text
            x={xAt(i)}
            y={H - padY + 16}
            textAnchor="middle"
            className="text-[10px] fill-muted-foreground tabular-nums"
          >
            {p.date}
          </text>
        </g>
      ))}
    </svg>
  );
}
