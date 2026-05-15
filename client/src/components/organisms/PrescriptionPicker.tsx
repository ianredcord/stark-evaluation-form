import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PRESCRIPTION_KB,
  PRESCRIPTION_CATEGORIES,
  PRESCRIPTION_DIFFICULTY,
  type Prescription,
  type PrescriptionCategory,
  type PrescriptionSelection,
} from "@shared/prescriptionKB";
import { ChipToggle } from "@/components/atoms/ChipToggle";
import { Search, Check, Plus, Minus } from "lucide-react";

export type PrescriptionPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: readonly PrescriptionSelection[];
  onConfirm: (next: PrescriptionSelection[]) => void;
};

export function PrescriptionPicker({
  open,
  onOpenChange,
  selected,
  onConfirm,
}: PrescriptionPickerProps) {
  const [filter, setFilter] = useState<PrescriptionCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<PrescriptionSelection[]>([...selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRESCRIPTION_KB.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.nameEn?.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const isSelected = (id: string) => draft.some((d) => d.prescriptionId === id);

  const toggle = (p: Prescription) => {
    setDraft((cur) => {
      const i = cur.findIndex((d) => d.prescriptionId === p.id);
      if (i >= 0) return cur.filter((_, idx) => idx !== i);
      return [
        ...cur,
        {
          prescriptionId: p.id,
          sets: p.defaultSets,
          reps: p.defaultReps,
        },
      ];
    });
  };

  const updateSets = (id: string, delta: number) => {
    setDraft((cur) =>
      cur.map((d) =>
        d.prescriptionId === id
          ? { ...d, sets: Math.max(1, Math.min(8, d.sets + delta)) }
          : d
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl w-[92vw] max-h-[88vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <DialogTitle className="font-display">開立處方</DialogTitle>
          <DialogDescription>
            從處方知識庫挑選動作,系統會自動套用建議組次數,你也可以微調。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Library */}
          <div className="flex-1 min-w-0 flex flex-col border-r">
            <div className="px-6 py-3 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜尋動作名稱、英文、標籤..."
                  className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
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
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  沒有符合條件的處方
                </p>
              )}
              {filtered.map((p) => {
                const sel = isSelected(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                      sel
                        ? "bg-brand-primary/5 border-brand-primary"
                        : "bg-card hover:bg-muted"
                    )}
                  >
                    <span className="text-3xl shrink-0">
                      {p.thumbnailEmoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="font-display font-semibold text-sm">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.nameEn}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {p.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-brand-accent/10 text-brand-accent px-2 py-0.5 text-xs">
                          {p.tag}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-muted text-foreground px-2 py-0.5 text-xs">
                          {PRESCRIPTION_DIFFICULTY[p.difficulty]}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                        sel
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "border-muted-foreground/40"
                      )}
                      aria-hidden
                    >
                      {sel && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected list */}
          <div className="lg:w-80 shrink-0 flex flex-col bg-bg-page">
            <div className="px-5 py-3 border-b">
              <p className="font-display font-semibold text-sm">
                已選 {draft.length} 個處方
              </p>
              <p className="text-xs text-muted-foreground">
                點 +/- 調整組數,點動作名取消選擇
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {draft.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  尚未選擇任何處方
                </p>
              )}
              {draft.map((d) => {
                const p = PRESCRIPTION_KB.find(
                  (x) => x.id === d.prescriptionId
                );
                if (!p) return null;
                return (
                  <div
                    key={d.prescriptionId}
                    className="rounded-md bg-card border p-2.5 space-y-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(p)}
                      className="w-full text-left flex items-center gap-2 group"
                    >
                      <span className="text-xl">{p.thumbnailEmoji}</span>
                      <span className="font-display text-sm font-semibold flex-1 truncate group-hover:line-through">
                        {p.name}
                      </span>
                    </button>
                    <div className="flex items-center gap-2 text-xs tabular-nums">
                      <button
                        type="button"
                        onClick={() => updateSets(d.prescriptionId, -1)}
                        className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted"
                        aria-label="少一組"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-semibold">{d.sets}</span>
                      <button
                        type="button"
                        onClick={() => updateSets(d.prescriptionId, +1)}
                        className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted"
                        aria-label="多一組"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-muted-foreground">
                        組 × {d.reps}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={() => {
              onConfirm(draft);
              onOpenChange(false);
            }}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white"
          >
            加入評估 ({draft.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
