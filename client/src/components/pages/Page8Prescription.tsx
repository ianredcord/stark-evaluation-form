import { useMemo } from "react";
import { useEvaluationForm } from "@/contexts/EvaluationFormContext";
import { SectionTitle, TextArea } from "@/components/FormFields";
import {
  MOTI_THRESHOLDS,
  MOTI_LEVEL_LABEL,
  MotiRiskKey,
  PrescriptionSelection,
} from "../../../../shared/evaluation";
import {
  PRESCRIPTION_CATEGORY_LABEL,
  PrescriptionCategory,
  PrescriptionItem,
  PrescriptionLevel,
  getPrescriptionFor,
  hasPrescriptionKB,
} from "../../../../shared/prescriptionKB";
import { Check, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: PrescriptionCategory[] = [
  "fascia",
  "acupoint",
  "exercise",
  "device",
];

const LEVEL_STYLE: Record<
  PrescriptionLevel,
  { badge: string; icon: typeof AlertTriangle }
> = {
  warn: {
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    icon: AlertTriangle,
  },
  danger: {
    badge: "bg-red-100 text-red-800 border-red-300",
    icon: AlertCircle,
  },
};

export function Page8Prescription() {
  const { formData, updatePrescriptions } = useEvaluationForm();
  const { motiRiskValues, prescriptions } = formData;

  // 找出本次評估的失衡項目(warn / danger)
  const imbalances = useMemo(() => {
    const result: Array<{ key: MotiRiskKey; level: PrescriptionLevel }> = [];
    (Object.keys(MOTI_THRESHOLDS) as MotiRiskKey[]).forEach((key) => {
      const item = motiRiskValues[key];
      if (item?.level === "warn" || item?.level === "danger") {
        result.push({ key, level: item.level });
      }
    });
    return result;
  }, [motiRiskValues]);

  const findSelection = (
    riskItemKey: MotiRiskKey,
    level: PrescriptionLevel,
  ): PrescriptionSelection | undefined =>
    prescriptions.find(
      (p) => p.riskItemKey === riskItemKey && p.level === level,
    );

  const upsertSelection = (
    riskItemKey: MotiRiskKey,
    level: PrescriptionLevel,
    patch: Partial<PrescriptionSelection>,
  ) => {
    const existing = findSelection(riskItemKey, level);
    const next: PrescriptionSelection = existing
      ? { ...existing, ...patch }
      : {
          riskItemKey,
          level,
          selectedFasciaIds: [],
          selectedAcupointIds: [],
          selectedExerciseIds: [],
          selectedDeviceIds: [],
          customNotes: "",
          ...patch,
        };
    const rest = prescriptions.filter(
      (p) => !(p.riskItemKey === riskItemKey && p.level === level),
    );
    updatePrescriptions([...rest, next]);
  };

  const toggleItem = (
    riskItemKey: MotiRiskKey,
    level: PrescriptionLevel,
    category: PrescriptionCategory,
    itemId: string,
  ) => {
    const existing = findSelection(riskItemKey, level);
    const fieldKey = (
      {
        fascia: "selectedFasciaIds",
        acupoint: "selectedAcupointIds",
        exercise: "selectedExerciseIds",
        device: "selectedDeviceIds",
      } as const
    )[category];
    const currentList = existing?.[fieldKey] ?? [];
    const nextList = currentList.includes(itemId)
      ? currentList.filter((id) => id !== itemId)
      : [...currentList, itemId];
    upsertSelection(riskItemKey, level, { [fieldKey]: nextList });
  };

  const isSelected = (
    riskItemKey: MotiRiskKey,
    level: PrescriptionLevel,
    category: PrescriptionCategory,
    itemId: string,
  ): boolean => {
    const existing = findSelection(riskItemKey, level);
    if (!existing) return false;
    const fieldKey = (
      {
        fascia: "selectedFasciaIds",
        acupoint: "selectedAcupointIds",
        exercise: "selectedExerciseIds",
        device: "selectedDeviceIds",
      } as const
    )[category];
    return existing[fieldKey].includes(itemId);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <SectionTitle>處方建議</SectionTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          系統依第 2 頁 Moti 失衡項目自動帶出建議處方,勾選後將寫入此份評估
        </p>
      </div>

      {imbalances.length === 0 ? (
        <EmptyImbalanceState />
      ) : (
        <div className="space-y-6">
          {imbalances.map(({ key, level }) => (
            <RiskItemBlock
              key={`${key}-${level}`}
              riskKey={key}
              level={level}
              isSelected={isSelected}
              onToggle={toggleItem}
              notes={findSelection(key, level)?.customNotes ?? ""}
              onNotesChange={(v) =>
                upsertSelection(key, level, { customNotes: v })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyImbalanceState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stark-border bg-white p-10 text-center">
      <Sparkles className="w-10 h-10 mx-auto text-stark-orange mb-3" />
      <p className="text-stark-text font-medium">
        本次評估沒有警惕 / 危險等級的失衡項目
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        若需手動建立處方,請先回到第 2 頁填寫 Moti 12 項風險數值
      </p>
    </div>
  );
}

interface RiskItemBlockProps {
  riskKey: MotiRiskKey;
  level: PrescriptionLevel;
  isSelected: (
    k: MotiRiskKey,
    l: PrescriptionLevel,
    c: PrescriptionCategory,
    id: string,
  ) => boolean;
  onToggle: (
    k: MotiRiskKey,
    l: PrescriptionLevel,
    c: PrescriptionCategory,
    id: string,
  ) => void;
  notes: string;
  onNotesChange: (v: string) => void;
}

function RiskItemBlock({
  riskKey,
  level,
  isSelected,
  onToggle,
  notes,
  onNotesChange,
}: RiskItemBlockProps) {
  const meta = MOTI_THRESHOLDS[riskKey];
  const kb = getPrescriptionFor(riskKey, level);
  const hasKB = hasPrescriptionKB(riskKey);
  const LevelIcon = LEVEL_STYLE[level].icon;

  return (
    <div className="rounded-2xl border-2 border-stark-border bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-stark-bg border-b-2 border-stark-border">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border",
              LEVEL_STYLE[level].badge,
            )}
          >
            <LevelIcon className="w-3.5 h-3.5" />
            {MOTI_LEVEL_LABEL[level]}
          </span>
          <h3 className="text-base font-bold text-stark-text">{meta.name}</h3>
        </div>
      </div>

      {/* Body */}
      {!hasKB ? (
        <div className="px-5 py-8 text-center text-muted-foreground bg-gray-50">
          <p className="text-sm">處方知識庫建構中</p>
          <p className="text-xs mt-1">Phase 2 補齊;可在下方備註自行填寫</p>
        </div>
      ) : kb ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 p-4">
          {CATEGORY_ORDER.map((cat) => (
            <CategoryColumn
              key={cat}
              category={cat}
              items={kb[cat]}
              isSelected={(id) => isSelected(riskKey, level, cat, id)}
              onToggle={(id) => onToggle(riskKey, level, cat, id)}
            />
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-muted-foreground bg-gray-50">
          <p className="text-sm">此等級暫無預設處方</p>
        </div>
      )}

      {/* 治療師備註 */}
      <div className="px-4 pb-4">
        <TextArea
          label="治療師備註"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="額外想交代客戶的內容、調整、注意事項…"
          rows={2}
        />
      </div>
    </div>
  );
}

interface CategoryColumnProps {
  category: PrescriptionCategory;
  items: PrescriptionItem[];
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
}

function CategoryColumn({
  category,
  items,
  isSelected,
  onToggle,
}: CategoryColumnProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-stark-border bg-stark-bg/40 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-stark-orange">
          {PRESCRIPTION_CATEGORY_LABEL[category]}
        </span>
        <span className="text-xs text-muted-foreground">
          {items.length} 項
        </span>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-muted-foreground py-3 text-center">
          無預設項目
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const selected = isSelected(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className={cn(
                    "w-full text-left rounded-lg border p-2.5 transition-colors",
                    selected
                      ? "border-stark-orange bg-stark-orange/10"
                      : "border-stark-border bg-white hover:border-stark-orange/50",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-0.5 w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center",
                        selected
                          ? "bg-stark-orange border-stark-orange"
                          : "bg-white border-stark-border",
                      )}
                    >
                      {selected && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-stark-text leading-tight">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 leading-snug">
                        {item.description}
                      </div>
                      {(item.duration || item.notes) && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {item.duration && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stark-orange/10 text-stark-orange font-medium">
                              {item.duration}
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
