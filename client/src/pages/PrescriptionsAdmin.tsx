import { useState } from "react";
import { toast } from "sonner";
import { TherapistLayout } from "@/components/templates/TherapistLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PRESCRIPTION_KB,
  PRESCRIPTION_CATEGORIES,
  PRESCRIPTION_DIFFICULTY,
  type PrescriptionCategory,
} from "@shared/prescriptionKB";
import { ChipToggle } from "@/components/atoms/ChipToggle";
import { StatusPill } from "@/components/atoms/StatusPill";
import { Plus, Search, Pencil, Video } from "lucide-react";

export default function PrescriptionsAdmin() {
  const [filter, setFilter] = useState<PrescriptionCategory | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = PRESCRIPTION_KB.filter((p) => {
    if (filter !== "all" && p.category !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.nameEn?.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)
    );
  });

  return (
    <TherapistLayout activeKey="report">
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">處方知識庫</h1>
            <p className="text-sm text-muted-foreground">
              管理所有可開立的訓練動作。共 {PRESCRIPTION_KB.length} 個動作。
            </p>
          </div>
          <Button
            onClick={() => toast.info("新增處方", { description: "Week 5 Day 4 接完整 CRUD" })}
            className="gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white"
          >
            <Plus className="w-4 h-4" />
            新增處方
          </Button>
        </header>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋..."
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <ChipToggle
              selected={filter === "all"}
              onToggle={() => setFilter("all")}
              size="sm"
            >
              全部
            </ChipToggle>
            {(
              Object.keys(PRESCRIPTION_CATEGORIES) as PrescriptionCategory[]
            ).map((cat) => (
              <ChipToggle
                key={cat}
                selected={filter === cat}
                onToggle={() => setFilter(cat)}
                size="sm"
              >
                {PRESCRIPTION_CATEGORIES[cat].label}
              </ChipToggle>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border bg-card overflow-hidden"
            >
              <div className="aspect-video bg-gradient-to-br from-bg-subtle to-muted flex items-center justify-center relative">
                <span className="text-6xl" aria-hidden>
                  {p.thumbnailEmoji}
                </span>
                {!p.videoUrl && (
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-xs bg-card/80 text-muted-foreground px-2 py-0.5 rounded">
                    <Video className="w-3 h-3" />
                    無影片
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display font-semibold">{p.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {p.nameEn}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center rounded-full bg-brand-accent/10 text-brand-accent px-2 py-0.5 text-xs">
                    {p.tag}
                  </span>
                  <StatusPill
                    status={
                      p.difficulty === "beginner"
                        ? "good"
                        : p.difficulty === "intermediate"
                          ? "warn"
                          : "danger"
                    }
                    size="sm"
                  >
                    {PRESCRIPTION_DIFFICULTY[p.difficulty]}
                  </StatusPill>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {p.defaultSets} 組 × {p.defaultReps}
                  </span>
                  <button
                    type="button"
                    onClick={() => toast.info(`編輯 ${p.name}`, { description: "Week 5 Day 4 接完整 CRUD" })}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    編輯
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            沒有符合條件的處方
          </p>
        )}
      </div>
    </TherapistLayout>
  );
}

// Avoid unused import warning if Lucide tree-shakes oddly
void cn;
