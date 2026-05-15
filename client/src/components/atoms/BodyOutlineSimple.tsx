import { cn } from "@/lib/utils";

const VIEW_BOX_W = 100;
const VIEW_BOX_H = 240;

const SIZE_MAP = {
  sm: { w: 60, h: 144 },
  md: { w: 90, h: 216 },
  lg: { w: 140, h: 336 },
} as const;

export type BodyHotspot = {
  /** Normalized x position (0-1) relative to viewBox width 100 */
  x: number;
  /** Normalized y position (0-1) relative to viewBox height 240 */
  y: number;
  /** Color token */
  color?: "good" | "warn" | "danger" | "primary";
  /** Optional radius in viewBox units (default 4) */
  r?: number;
};

export type BodyOutlineSimpleProps = {
  view?: "front" | "back";
  size?: keyof typeof SIZE_MAP;
  hotspots?: readonly BodyHotspot[];
  className?: string;
};

const HOTSPOT_COLOR = {
  good: "fill-status-good",
  warn: "fill-status-warn",
  danger: "fill-status-danger",
  primary: "fill-brand-primary",
} as const;

/**
 * Anatomically-proportioned human silhouette in a 100x240 viewBox.
 * Front view shows pec / quad / calf hints.
 * Back view shows traps, lats, glute, hamstring hints + dashed spine.
 * Overlay risk markers via `hotspots` (normalized 0-1 coords).
 */
export function BodyOutlineSimple({
  view = "front",
  size = "md",
  hotspots = [],
  className,
}: BodyOutlineSimpleProps) {
  const { w, h } = SIZE_MAP[size];

  // Shared full-body silhouette outline (closed path, no fill).
  // Symmetric around x=50. Proportions follow ~8-head canon.
  const silhouette = `
    M 50 5
    C 41 5  35 11  35 20
    C 35 27  40 33  44 36
    L 44 41
    C 38 42  32 44  28 48
    C 22 53  20 60  19 70
    C 17 88  16 102 18 116
    C 18 122 17 128 16 134
    L 14 168
    C 14 174 16 178 22 178
    C 26 178 28 174 28 168
    L 30 138
    C 31 134 33 134 34 136
    L 36 146
    C 37 154 37 162 36 170
    L 33 222
    C 33 228 35 232 40 232
    L 47 232
    C 49 232 50 230 50 228
    L 50 168
    L 50 228
    C 50 230 51 232 53 232
    L 60 232
    C 65 232 67 228 67 222
    L 64 170
    C 63 162 63 154 64 146
    L 66 136
    C 67 134 69 134 70 138
    L 72 168
    C 72 174 74 178 78 178
    C 84 178 86 174 86 168
    L 84 134
    C 83 128 82 122 82 116
    C 84 102 83 88 81 70
    C 80 60 78 53 72 48
    C 68 44 62 42 56 41
    L 56 36
    C 60 33 65 27 65 20
    C 65 11 59 5 50 5
    Z
  `;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${VIEW_BOX_W} ${VIEW_BOX_H}`}
      className={cn("text-muted-foreground", className)}
      aria-label={`Body outline (${view} view)`}
    >
      {/* Main silhouette */}
      <path
        d={silhouette}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inner anatomy hints */}
      {view === "front" ? (
        <g opacity="0.45">
          {/* Collarbone */}
          <path
            d="M 36 46 Q 50 52 64 46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Sternum / centerline upper torso */}
          <line x1="50" y1="52" x2="50" y2="100" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1.5 2" />
          {/* Pec separation hint */}
          <path d="M 42 56 Q 38 70 38 80" fill="none" stroke="currentColor" strokeWidth="0.7" />
          <path d="M 58 56 Q 62 70 62 80" fill="none" stroke="currentColor" strokeWidth="0.7" />
          {/* Waist / ab line */}
          <line x1="38" y1="108" x2="62" y2="108" stroke="currentColor" strokeWidth="0.7" />
          {/* Quad hint */}
          <path d="M 38 150 Q 41 175 41 200" fill="none" stroke="currentColor" strokeWidth="0.7" />
          <path d="M 62 150 Q 59 175 59 200" fill="none" stroke="currentColor" strokeWidth="0.7" />
        </g>
      ) : (
        <g opacity="0.45">
          {/* Trapezius — diamond between shoulders */}
          <path
            d="M 36 44 Q 50 52 64 44 Q 56 60 50 68 Q 44 60 36 44 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          {/* Spine dashed */}
          <line
            x1="50"
            y1="48"
            x2="50"
            y2="138"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeDasharray="2 2"
          />
          {/* Lats (sweeping curves from armpit to lower back) */}
          <path d="M 32 60 Q 36 95 44 118" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <path d="M 68 60 Q 64 95 56 118" fill="none" stroke="currentColor" strokeWidth="0.8" />
          {/* Glute crease */}
          <path d="M 36 138 Q 50 148 64 138" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <line x1="50" y1="138" x2="50" y2="160" stroke="currentColor" strokeWidth="0.7" />
          {/* Hamstring / calf hint */}
          <path d="M 40 168 Q 43 195 42 215" fill="none" stroke="currentColor" strokeWidth="0.7" />
          <path d="M 60 168 Q 57 195 58 215" fill="none" stroke="currentColor" strokeWidth="0.7" />
        </g>
      )}

      {/* Hotspots */}
      {hotspots.map((hp, i) => (
        <circle
          key={i}
          cx={hp.x * VIEW_BOX_W}
          cy={hp.y * VIEW_BOX_H}
          r={hp.r ?? 4}
          className={HOTSPOT_COLOR[hp.color ?? "warn"]}
          opacity="0.9"
        />
      ))}
    </svg>
  );
}
