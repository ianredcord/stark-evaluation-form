import { PriorityFindingCard } from "@/components/molecules/PriorityFindingCard";
import { AlertTriangle, Target, Activity } from "lucide-react";

export type PriorityFindingsListProps = {
  findings: ReadonlyArray<{
    title: string;
    description: string;
  }>;
  goodNews?: string;
};

const ICONS = [<AlertTriangle key="0" />, <Activity key="1" />, <Target key="2" />];
const TONES = ["warn", "danger", "primary"] as const;
const ICON_BG = ["warn", "danger", "primary"] as const;

export function PriorityFindingsList({
  findings,
  goodNews,
}: PriorityFindingsListProps) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
        <span aria-hidden>🎯</span>
        本次三大重點
      </h2>
      <div className="space-y-2">
        {findings.slice(0, 3).map((f, i) => (
          <PriorityFindingCard
            key={i}
            n={i + 1}
            title={f.title}
            description={f.description}
            icon={ICONS[i]}
            iconBg={ICON_BG[i]}
            tone={TONES[i]}
            className="!bg-bg-page !border-0"
          />
        ))}
      </div>
      {goodNews && (
        <div className="flex items-start gap-2 rounded-md bg-status-good-bg text-status-good p-3 text-sm">
          <span aria-hidden>★</span>
          <p>
            <span className="font-semibold">好消息:</span>
            {goodNews}
          </p>
        </div>
      )}
    </section>
  );
}
