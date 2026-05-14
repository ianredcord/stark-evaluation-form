import { useEvaluationForm } from "@/contexts/EvaluationFormContext";
import { ImageUpload } from "@/components/ImageUpload";
import { SectionTitle } from "@/components/FormFields";
import {
  MOTI_THRESHOLDS,
  MOTI_LEVEL_LABEL,
  MotiRiskKey,
  MotiRiskItem,
  calculateMotiLevel,
} from "../../../../shared/evaluation";

const LEVEL_BADGE_CLASS: Record<"maintain" | "warn" | "danger", string> = {
  maintain: "bg-green-100 text-green-800",
  warn: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

export function Page2MotiPhysio() {
  const { formData, updateMotiPhysio, updateMotiRiskValues } = useEvaluationForm();
  const { motiPhysio, motiRiskValues } = formData;

  const handleItemChange = (key: MotiRiskKey, rawValue: string) => {
    const parsed = rawValue === "" ? null : Number(rawValue);
    const value = parsed !== null && isNaN(parsed) ? null : parsed;
    const item: MotiRiskItem = {
      value,
      level: calculateMotiLevel(value, MOTI_THRESHOLDS[key].thresholds),
    };
    updateMotiRiskValues({ [key]: item } as Partial<typeof motiRiskValues>);
  };

  const handleOverallChange = (rawValue: string) => {
    const parsed = rawValue === "" ? null : Number(rawValue);
    const value = parsed !== null && isNaN(parsed) ? null : parsed;
    updateMotiRiskValues({ overallRiskIndex: value });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-muted-foreground">
          請上傳 Moti Physio 3D 姿勢檢測報告的兩頁截圖
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 第一頁報告 */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <SectionTitle>Moti Physio 3D 姿勢檢測報告第一頁</SectionTitle>
          </div>
          <ImageUpload
            label=""
            value={motiPhysio.reportPage1}
            onChange={(url) => updateMotiPhysio({ reportPage1: url || "" })}
            aspectRatio="video"
            placeholder="點擊或拖曳上傳第一頁報告"
            className="min-h-[400px]"
          />
        </div>

        {/* 第二頁報告 */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <SectionTitle>Moti Physio 3D 姿勢檢測報告第二頁</SectionTitle>
          </div>
          <ImageUpload
            label=""
            value={motiPhysio.reportPage2}
            onChange={(url) => updateMotiPhysio({ reportPage2: url || "" })}
            aspectRatio="video"
            placeholder="點擊或拖曳上傳第二頁報告"
            className="min-h-[400px]"
          />
        </div>
      </div>

      {/* Moti 12 項風險數值 */}
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <SectionTitle>Moti 12 項風險數值</SectionTitle>
          <p className="text-sm text-muted-foreground">
            對照報告填寫,系統將自動判定失衡等級
          </p>
        </div>

        {/* 整體失衡風險指數 */}
        <div className="rounded-xl border-2 border-stark-border bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-stark-text">
              整體失衡風險指數
            </div>
            <div className="text-xs text-muted-foreground">
              對照 Moti 報告手動填入 0–100
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={motiRiskValues.overallRiskIndex ?? ""}
              onChange={(e) => handleOverallChange(e.target.value)}
              placeholder="—"
              className="stark-input w-28 text-3xl font-bold text-center"
            />
            <span className="text-sm text-stark-text-muted">/ 100</span>
          </div>
        </div>

        {/* 12 項目卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(MOTI_THRESHOLDS) as MotiRiskKey[]).map((key) => {
            const def = MOTI_THRESHOLDS[key];
            const item = motiRiskValues[key];
            const level = item.level;

            return (
              <div
                key={key}
                className="rounded-xl border-2 border-stark-border bg-white p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-stark-text">
                    {def.name}
                  </span>
                  {level && (
                    <span
                      className={
                        "text-xs font-semibold px-2 py-0.5 rounded-full " +
                        LEVEL_BADGE_CLASS[level]
                      }
                    >
                      {MOTI_LEVEL_LABEL[level]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step={0.1}
                    value={item.value ?? ""}
                    onChange={(e) => handleItemChange(key, e.target.value)}
                    placeholder="—"
                    className="stark-input flex-1 text-center"
                  />
                  <span className="text-sm text-stark-text-muted">
                    {def.unit}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  維持 &lt; {def.thresholds[0]}{def.unit} ・ 警惕 &lt; {def.thresholds[1]}{def.unit} ・ 危險 ≥ {def.thresholds[1]}{def.unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
