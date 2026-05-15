// 整體失衡風險指數 — 環形進度條(0-100)

interface RiskRingProps {
  value: number | null;
  size?: number;
  strokeWidth?: number;
}

export function RiskRing({ value, size = 180, strokeWidth = 14 }: RiskRingProps) {
  const safeValue = value ?? 0;
  const clamped = Math.min(100, Math.max(0, safeValue));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70 ? "#ef4444" : clamped >= 40 ? "#f59e0b" : "#22c55e";
  const label =
    clamped >= 70 ? "危險" : clamped >= 40 ? "警惕" : "良好";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-stark-text leading-none">
          {value !== null ? clamped : "—"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">/ 100</div>
        <div
          className="mt-2 px-3 py-0.5 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
