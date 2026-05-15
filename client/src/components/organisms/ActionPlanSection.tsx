import { ActionRecommendationCard } from "@/components/molecules/ActionRecommendationCard";
import { WeekPlanCard } from "@/components/molecules/WeekPlanCard";
import { Button } from "@/components/ui/button";
import { Dumbbell, HandHeart, CalendarCheck, ArrowRight } from "lucide-react";

export type ActionPlanSectionProps = {
  recommendations: ReadonlyArray<{
    icon: "training" | "therapy" | "reassess";
    title: string;
    description: string;
    ctaLabel: string;
  }>;
  weekPlan: ReadonlyArray<{
    n: number;
    weekLabel: string;
    phase: string;
    items: readonly string[];
  }>;
  onViewPlan?: () => void;
};

const ICON_MAP = {
  training: <Dumbbell />,
  therapy: <HandHeart />,
  reassess: <CalendarCheck />,
};
const ICON_BG: Record<string, "primary" | "good" | "violet"> = {
  training: "primary",
  therapy: "good",
  reassess: "violet",
};
const PLAN_TONES = ["primary", "good", "warn", "muted"] as const;

export function ActionPlanSection({
  recommendations,
  weekPlan,
  onViewPlan,
}: ActionPlanSectionProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5">
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          改善建議與下一步
        </h2>
        <div className="space-y-3">
          {recommendations.map((r, i) => (
            <ActionRecommendationCard
              key={i}
              icon={ICON_MAP[r.icon]}
              iconBg={ICON_BG[r.icon]}
              title={r.title}
              description={r.description}
              ctaLabel={r.ctaLabel}
              onCtaClick={() => {}}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            4 週改善路線圖
          </h2>
          <Button
            size="sm"
            onClick={onViewPlan}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white gap-1"
          >
            查看我的改善計畫
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {weekPlan.map((wp, i) => (
            <WeekPlanCard
              key={wp.n}
              n={wp.n}
              weekLabel={wp.weekLabel}
              phase={wp.phase}
              items={wp.items}
              tone={PLAN_TONES[i] ?? "muted"}
              current={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
