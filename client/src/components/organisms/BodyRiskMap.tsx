import { cn } from "@/lib/utils";
import { BodyOutlineSimple, type BodyHotspot } from "@/components/atoms/BodyOutlineSimple";

export type BodyRiskLegendItem = {
  label: string;
  hint: string;
  tone: "good" | "warn" | "danger";
};

export type BodyRiskMapProps = {
  hotspotsFront: readonly BodyHotspot[];
  hotspotsBack: readonly BodyHotspot[];
  legend: readonly BodyRiskLegendItem[];
};

const DOT_COLOR = {
  good: "bg-status-good",
  warn: "bg-status-warn",
  danger: "bg-status-danger",
} as const;

export function BodyRiskMap({
  hotspotsFront,
  hotspotsBack,
  legend,
}: BodyRiskMapProps) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
        <span aria-hidden>🩻</span>
        身體風險地圖
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 items-start">
        <div className="flex justify-center gap-6">
          <BodyOutlineSimple size="lg" view="front" hotspots={hotspotsFront} />
          <BodyOutlineSimple size="lg" view="back" hotspots={hotspotsBack} />
        </div>
        <div className="space-y-2">
          {legend.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0", DOT_COLOR[item.tone])} />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.hint}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-good" />
              低風險
            </span>
            <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-status-good via-status-warn to-status-danger" />
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-danger" />
              高風險
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
