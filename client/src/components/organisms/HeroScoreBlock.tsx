import { ScoreRing } from "@/components/atoms/ScoreRing";
import { StatusPill } from "@/components/atoms/StatusPill";
import { SubScoreCard } from "@/components/molecules/SubScoreCard";
import { Bone, Activity, Brain, Scale, TrendingUp } from "lucide-react";

export type HeroScoreBlockProps = {
  clientName: string;
  evaluationDate: string;
  lastScore: number;
  currentScore: number;
  state: { label: string; tone: "good" | "warn" | "danger" | "neutral" };
  encouragement: string;
  subScores: {
    posture: { value: number; last: number; tone: "good" | "warn" | "danger" | "neutral"; toneLabel: string };
    movement: { value: number; last: number; tone: "good" | "warn" | "danger" | "neutral"; toneLabel: string };
    neuromuscular: { value: number; last: number; tone: "good" | "warn" | "danger" | "neutral"; toneLabel: string };
    composition: { value: number; last: number; tone: "good" | "warn" | "danger" | "neutral"; toneLabel: string };
  };
};

export function HeroScoreBlock({
  clientName,
  evaluationDate,
  lastScore,
  currentScore,
  state,
  encouragement,
  subScores,
}: HeroScoreBlockProps) {
  const delta = currentScore - lastScore;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Hi {clientName},這是你的整合諮詢報告
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground tabular-nums">
          <span>評估日期:{evaluationDate}</span>
          <span>
            上次 {lastScore} → 這次{" "}
            <span className="text-status-good font-semibold">{currentScore}</span>{" "}
            {delta > 0 && <span className="text-status-good">↑</span>}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_2fr] gap-4">
        {/* Big score */}
        <div className="flex items-center gap-5 rounded-xl border bg-card p-5">
          <ScoreRing
            value={currentScore}
            size="xl"
            color="primary"
            label="整體身體功能分數"
          />
          <StatusPill status={state.tone} size="md">
            {state.label}
          </StatusPill>
        </div>

        {/* Encouragement */}
        <div className="rounded-xl border bg-card p-5 flex flex-col justify-center gap-2">
          <h2 className="font-display text-lg font-semibold text-foreground">
            整體狀態:{state.label}!
          </h2>
          <p className="text-sm text-foreground leading-relaxed">
            {encouragement}
          </p>
          {delta !== 0 && (
            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-status-good">
              <TrendingUp className="w-4 h-4" />
              與上次相比 整體分數{delta > 0 ? "提升" : "下降"}{" "}
              <span className="font-bold tabular-nums">
                {delta > 0 ? `+${delta}` : delta}
              </span>{" "}
              分!
            </div>
          )}
        </div>

        {/* 4 sub-score grid */}
        <div className="grid grid-cols-2 gap-3">
          <SubScoreCard
            label="姿勢結構"
            value={subScores.posture.value}
            icon={<Bone />}
            iconBg="primary"
            status={{ label: subScores.posture.toneLabel, tone: subScores.posture.tone }}
            trend={subScores.posture.value - subScores.posture.last}
          />
          <SubScoreCard
            label="動作功能"
            value={subScores.movement.value}
            icon={<Activity />}
            iconBg="good"
            status={{ label: subScores.movement.toneLabel, tone: subScores.movement.tone }}
            trend={subScores.movement.value - subScores.movement.last}
          />
          <SubScoreCard
            label="神經肌肉控制"
            value={subScores.neuromuscular.value}
            icon={<Brain />}
            iconBg="violet"
            status={{ label: subScores.neuromuscular.toneLabel, tone: subScores.neuromuscular.tone }}
            trend={subScores.neuromuscular.value - subScores.neuromuscular.last}
          />
          <SubScoreCard
            label="體組成"
            value={subScores.composition.value}
            icon={<Scale />}
            iconBg="warm"
            status={{ label: subScores.composition.toneLabel, tone: subScores.composition.tone }}
            trend={subScores.composition.value - subScores.composition.last}
          />
        </div>
      </div>
    </section>
  );
}
