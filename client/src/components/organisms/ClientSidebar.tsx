import { cn } from "@/lib/utils";
import { Pencil, Check, Hourglass } from "lucide-react";

export type ClientSidebarProgressItem = {
  key: string;
  label: string;
  date: string;
  done: boolean;
  current?: boolean;
};

export type ClientSidebarProps = {
  client: {
    initial: string;
    name: string;
    age: number;
    gender: string;
    height: number;
    weight: number;
  };
  complaint: string;
  goals: string;
  progress: readonly ClientSidebarProgressItem[];
};

export function ClientSidebar({
  client,
  complaint,
  goals,
  progress,
}: ClientSidebarProps) {
  const completed = progress.filter((p) => p.done).length;
  const filling = progress.filter((p) => p.current).length;
  const pct = Math.round((completed / progress.length) * 100);

  return (
    <aside className="w-64 shrink-0 border-r bg-card">
      <div className="p-5 space-y-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-client-warm text-brand-primary font-display text-xl font-bold">
            {client.initial}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-display text-base font-semibold truncate">
                {client.name}
              </p>
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {client.age} 歲 · {client.gender}
            </p>
          </div>
        </div>

        {/* Height / weight */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-bg-subtle p-2.5">
            <p className="text-xs text-muted-foreground">身高</p>
            <p className="font-display text-sm font-semibold tabular-nums">
              {client.height} cm
            </p>
          </div>
          <div className="rounded-md bg-bg-subtle p-2.5">
            <p className="text-xs text-muted-foreground">體重</p>
            <p className="font-display text-sm font-semibold tabular-nums">
              {client.weight} kg
            </p>
          </div>
        </div>

        {/* Complaint */}
        <div className="space-y-1">
          <p className="font-display text-sm font-semibold">主訴</p>
          <p className="text-xs text-foreground leading-relaxed">{complaint}</p>
        </div>

        {/* Goals */}
        <div className="space-y-1">
          <p className="font-display text-sm font-semibold">目標</p>
          <p className="text-xs text-foreground leading-relaxed">{goals}</p>
        </div>

        {/* Progress */}
        <div className="space-y-2 pt-2">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-sm font-semibold">評估進度</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {completed}/{progress.length} 完成{" "}
              {filling > 0 && (
                <span className="text-status-warn">+ {filling} 填寫中</span>
              )}
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-bg-subtle overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">{pct}%</p>

          <ul className="space-y-1.5 pt-2">
            {progress.map((item) => (
              <li
                key={item.key}
                className={cn(
                  "flex items-center justify-between gap-2 text-xs rounded-md px-2 py-1.5",
                  item.current && "bg-brand-primary text-white"
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {item.done ? (
                    <Check className="w-3.5 h-3.5 text-status-good shrink-0" />
                  ) : item.current ? (
                    <Hourglass className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className={cn(
                    "tabular-nums shrink-0",
                    item.current ? "text-white/70" : "text-muted-foreground"
                  )}
                >
                  {item.date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
