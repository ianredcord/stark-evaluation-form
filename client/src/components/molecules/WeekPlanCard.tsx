import { cn } from "@/lib/utils";
import { SectionNumber } from "@/components/atoms/SectionNumber";

export type WeekPlanCardProps = {
  weekLabel: string;
  phase: string;
  items: string[];
  n: number | string;
  tone?: "primary" | "accent" | "good" | "warn" | "danger" | "muted";
  current?: boolean;
  className?: string;
};

const TONE_TINT = {
  primary: "bg-client-warm",
  accent: "bg-status-good-bg",
  good: "bg-status-good-bg",
  warn: "bg-status-warn-bg",
  danger: "bg-status-danger-bg",
  muted: "bg-muted",
} as const;

export function WeekPlanCard({
  weekLabel,
  phase,
  items,
  n,
  tone = "primary",
  current,
  className,
}: WeekPlanCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 transition-shadow",
        TONE_TINT[tone],
        current && "ring-2 ring-brand-primary shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <SectionNumber n={n} color={tone} size="sm" />
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-foreground">
            {weekLabel}
          </p>
          <p className="font-body text-xs text-muted-foreground">{phase}</p>
        </div>
      </div>
      <ul className="space-y-1 ml-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-1.5 font-body text-xs text-foreground"
          >
            <span className="text-status-good shrink-0 mt-0.5" aria-hidden>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
