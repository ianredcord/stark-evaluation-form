import { SystemImportCard } from "@/components/molecules/SystemImportCard";

export type DataSourcesRowProps = {
  sources: ReadonlyArray<{
    systemName: string;
    systemKind: string;
    state: "imported" | "pending" | "unavailable";
    accent: "primary" | "accent" | "violet" | "warm" | "good" | "warn";
  }>;
  completedAt: string;
};

export function DataSourcesRow({ sources, completedAt }: DataSourcesRowProps) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-foreground">
        資料整合來源
      </h2>
      <p className="text-sm text-muted-foreground">
        本報告由以下四大系統綜合分析而成
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sources.map((s) => (
          <SystemImportCard
            key={s.systemName}
            systemName={s.systemName}
            systemKind={s.systemKind}
            state={s.state}
            accent={s.accent}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">
        ✓ 整合分析完成:{completedAt}
      </p>
    </section>
  );
}
