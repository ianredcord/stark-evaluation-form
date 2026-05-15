import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight } from "lucide-react";

export type PrescriptionItem = {
  name: string;
  nameEn?: string;
  sets: string;
  tag: string;
  thumbnailEmoji?: string;
};

export type PrescriptionSectionProps = {
  intro?: string;
  prescriptions: readonly PrescriptionItem[];
  onViewAll?: () => void;
};

export function PrescriptionSection({
  intro,
  prescriptions,
  onViewAll,
}: PrescriptionSectionProps) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-foreground">
        教練給你的處方建議
      </h2>
      {intro && <p className="text-sm text-muted-foreground">{intro}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {prescriptions.map((p, i) => (
          <div
            key={i}
            className="rounded-lg border bg-bg-page overflow-hidden group"
          >
            <div className="aspect-video bg-gradient-to-br from-bg-subtle to-muted relative flex items-center justify-center">
              <span className="text-5xl" aria-hidden>
                {p.thumbnailEmoji ?? "🏋️"}
              </span>
              <button
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-black/0 group-hover:bg-black/20 transition-colors"
                )}
                aria-label={`Play ${p.name}`}
              >
                <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-white/90 text-brand-primary shadow opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </span>
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-display text-sm font-semibold">{p.name}</p>
                {p.nameEn && (
                  <p className="text-xs text-muted-foreground">{p.nameEn}</p>
                )}
              </div>
              <p className="text-xs text-foreground tabular-nums">{p.sets}</p>
              <span className="inline-flex items-center rounded-full bg-brand-accent/10 text-brand-accent px-2 py-0.5 text-xs font-medium">
                {p.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        onClick={onViewAll}
        className="w-full text-brand-primary hover:text-brand-primary-dark gap-1"
      >
        查看完整處方清單
        <ChevronRight className="w-4 h-4" />
      </Button>
    </section>
  );
}
