import { Check } from "lucide-react";

export type YourStrengthsBannerProps = {
  strengths: readonly { label: string; hint?: string }[];
  closing?: string;
};

export function YourStrengthsBanner({
  strengths,
  closing,
}: YourStrengthsBannerProps) {
  return (
    <section className="rounded-xl bg-status-good-bg border border-status-good/30 p-5">
      <h2 className="font-display text-lg font-semibold text-foreground mb-3">
        你的優勢
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
        {strengths.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-status-good shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              {s.hint && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  ({s.hint})
                </p>
              )}
            </div>
          </div>
        ))}
        {closing && (
          <p className="text-sm text-muted-foreground md:text-right md:self-center">
            {closing}
          </p>
        )}
      </div>
    </section>
  );
}
