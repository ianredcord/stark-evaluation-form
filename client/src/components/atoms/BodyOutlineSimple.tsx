import { cn } from "@/lib/utils";

const SIZE_MAP = {
  sm: { w: 60, h: 140 },
  md: { w: 90, h: 200 },
  lg: { w: 140, h: 300 },
} as const;

export type BodyHotspot = {
  /** Normalized x position (0-1) relative to viewBox width 100 */
  x: number;
  /** Normalized y position (0-1) relative to viewBox height 220 */
  y: number;
  /** Color token */
  color?: "good" | "warn" | "danger" | "primary";
  /** Optional radius in viewBox units (default 4) */
  r?: number;
};

export type BodyOutlineSimpleProps = {
  view?: "front" | "back";
  size?: keyof typeof SIZE_MAP;
  hotspots?: BodyHotspot[];
  className?: string;
};

const HOTSPOT_COLOR = {
  good: "fill-status-good",
  warn: "fill-status-warn",
  danger: "fill-status-danger",
  primary: "fill-brand-primary",
} as const;

/**
 * Minimal front/back-view human silhouette in a 100x220 viewBox.
 * Use `hotspots` to overlay risk markers (normalized 0-1 coords).
 */
export function BodyOutlineSimple({
  view = "front",
  size = "md",
  hotspots = [],
  className,
}: BodyOutlineSimpleProps) {
  const { w, h } = SIZE_MAP[size];

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 220"
      className={cn("text-muted-foreground", className)}
      aria-label={`Body outline (${view} view)`}
    >
      {/* Head */}
      <circle cx="50" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Neck */}
      <line x1="50" y1="33" x2="50" y2="40" stroke="currentColor" strokeWidth="1.5" />
      {/* Torso */}
      <path
        d="M30 42 Q30 38 40 38 L60 38 Q70 38 70 42 L72 100 Q72 120 60 130 L40 130 Q28 120 28 100 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Arms */}
      <path
        d="M30 45 Q18 55 16 90 Q14 120 20 145"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M70 45 Q82 55 84 90 Q86 120 80 145"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Hands */}
      <circle cx="20" cy="146" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="80" cy="146" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Legs */}
      <path
        d="M42 130 Q40 160 38 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M58 130 Q60 160 62 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Feet */}
      <line x1="32" y1="210" x2="44" y2="210" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="210" x2="68" y2="210" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Spine line (back view only) */}
      {view === "back" && (
        <line
          x1="50"
          y1="42"
          x2="50"
          y2="128"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.5"
        />
      )}

      {/* Hotspots */}
      {hotspots.map((h, i) => (
        <circle
          key={i}
          cx={h.x * 100}
          cy={h.y * 220}
          r={h.r ?? 4}
          className={HOTSPOT_COLOR[h.color ?? "warn"]}
          opacity="0.85"
        />
      ))}
    </svg>
  );
}
