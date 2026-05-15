// 處方分標籤 — 筋膜/穴位/運動/儀器,客戶端展示

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PrescriptionSelection,
  MOTI_THRESHOLDS,
} from "../../../../shared/evaluation";
import {
  getPrescriptionFor,
  PRESCRIPTION_CATEGORY_LABEL,
  PrescriptionCategory,
  PrescriptionItem,
} from "../../../../shared/prescriptionKB";

interface PrescriptionTabsProps {
  prescriptions: PrescriptionSelection[];
}

const ORDER: PrescriptionCategory[] = ["fascia", "acupoint", "exercise", "device"];

export function PrescriptionTabs({ prescriptions }: PrescriptionTabsProps) {
  // 蒐集所有被勾選的處方項目,依分類聚合
  const grouped = useMemo(() => {
    const byCategory: Record<
      PrescriptionCategory,
      Array<{ item: PrescriptionItem; riskName: string }>
    > = { fascia: [], acupoint: [], exercise: [], device: [] };

    prescriptions.forEach((p) => {
      const kb = getPrescriptionFor(p.riskItemKey, p.level);
      if (!kb) return;
      const riskName = MOTI_THRESHOLDS[p.riskItemKey].name;
      const collect = (
        cat: PrescriptionCategory,
        ids: string[],
        items: PrescriptionItem[],
      ) => {
        ids.forEach((id) => {
          const item = items.find((x) => x.id === id);
          if (item) byCategory[cat].push({ item, riskName });
        });
      };
      collect(
        "fascia",
        p.selectedFasciaIds,
        kb.fascia,
      );
      collect(
        "acupoint",
        p.selectedAcupointIds,
        kb.acupoint,
      );
      collect(
        "exercise",
        p.selectedExerciseIds,
        kb.exercise,
      );
      collect("device", p.selectedDeviceIds, kb.device);
    });
    return byCategory;
  }, [prescriptions]);

  const totalCount = ORDER.reduce((sum, c) => sum + grouped[c].length, 0);

  if (totalCount === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stark-border bg-white p-8 text-center text-muted-foreground">
        本次評估未產出個人化處方,請洽治療師補充。
      </div>
    );
  }

  return (
    <Tabs defaultValue={ORDER.find((c) => grouped[c].length > 0) ?? "fascia"} className="w-full">
      <TabsList className="bg-stark-bg w-full h-auto flex-wrap gap-1 p-1.5">
        {ORDER.map((c) => (
          <TabsTrigger
            key={c}
            value={c}
            disabled={grouped[c].length === 0}
            className="flex-1 min-w-[80px] data-[state=active]:bg-stark-orange data-[state=active]:text-white"
          >
            <span className="truncate">
              {PRESCRIPTION_CATEGORY_LABEL[c]}
              {grouped[c].length > 0 && (
                <span className="ml-1 text-[10px] opacity-80">({grouped[c].length})</span>
              )}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {ORDER.map((c) => (
        <TabsContent key={c} value={c} className="mt-3 space-y-2">
          {grouped[c].map(({ item, riskName }, idx) => (
            <PrescriptionEntry
              key={`${item.id}-${idx}`}
              item={item}
              riskName={riskName}
            />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

interface PrescriptionEntryProps {
  item: PrescriptionItem;
  riskName: string;
}

function PrescriptionEntry({ item, riskName }: PrescriptionEntryProps) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left rounded-xl border-2 border-stark-border bg-white p-3 hover:border-stark-orange/60 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-stark-text">{item.title}</span>
            {item.duration && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stark-orange/10 text-stark-orange font-medium">
                {item.duration}
              </span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
              對應:{riskName}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-stark-border text-xs text-muted-foreground leading-relaxed">
          {item.description}
          {item.notes && (
            <div className="mt-2 px-2 py-1 rounded bg-amber-50 text-amber-700">
              ※ {item.notes}
            </div>
          )}
        </div>
      )}
    </button>
  );
}
