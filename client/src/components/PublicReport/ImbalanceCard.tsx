// 單一失衡項目卡片 — 含進度條、等級徽章、可展開解釋

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MOTI_THRESHOLDS,
  MOTI_LEVEL_LABEL,
  MotiRiskKey,
  MotiRiskItem,
} from "../../../../shared/evaluation";

type LevelKey = "" | "maintain" | "warn" | "danger";

// 客戶端「為什麼會這樣 / 日常影響」說明 — placeholder,Ian 之後提供
const ITEM_EXPLANATIONS: Record<
  MotiRiskKey,
  { why: string; impact: string }
> = {
  hkaRight: {
    why: "右膝向內或外偏移,可能源於髖部肌力不均、足弓塌陷或長時間單側施力。",
    impact: "增加右膝關節磨損風險,長期可能引發膝痛或步態異常。",
  },
  hkaLeft: {
    why: "左膝向內或外偏移,可能源於髖部肌力不均、足弓塌陷或長時間單側施力。",
    impact: "增加左膝關節磨損風險,長期可能引發膝痛或步態異常。",
  },
  shoulderDiff: {
    why: "左右肩高度不一致,常見於慣用手使用習慣或單側背負重物。",
    impact: "造成肩頸緊繃、姿勢失衡,影響上半身動作協調。",
  },
  roundShoulder: {
    why: "肩膀向前內捲,多由長時間使用 3C、伏案工作導致胸前肌肉緊縮、後背肌肉鬆弛。",
    impact: "壓迫胸腔影響呼吸效率,並導致肩頸痠痛、肩夾擠症候群。",
  },
  lumbarLordosis: {
    why: "下背前凸角度過大,常見於核心無力、骨盆前傾、髖屈肌緊縮。",
    impact: "下背壓力集中,容易引發腰痠、椎間盤負擔。",
  },
  thoracicKyphosis: {
    why: "上背駝彎角度過大,多伴隨圓肩、長時間低頭使用 3C。",
    impact: "胸椎活動度下降,影響肩關節功能,增加上背疲勞感。",
  },
  scoliosis: {
    why: "脊椎左右側彎,可能來自肌肉張力不均、長期單側姿勢或先天結構。",
    impact: "影響身體對稱性,長期可能造成肩高差、骨盆歪斜、運動代償。",
  },
  kneeFlexion: {
    why: "站立時膝關節未完全伸直,常見於股四頭肌無力或膝後側緊繃。",
    impact: "影響站立穩定性,長期增加髕股關節壓力。",
  },
  pelvisRotation: {
    why: "骨盆水平面旋轉,多源於髖屈肌、臀肌左右不均。",
    impact: "造成步態不對稱、下背與單側膝蓋負擔加重。",
  },
  pelvisTilt: {
    why: "骨盆左右高低不一,常與單側久站、跛行、肌力不均有關。",
    impact: "影響下肢力學鏈,導致下背及髖部勞損。",
  },
  pelvisAnterior: {
    why: "骨盆前傾,源於髖屈肌緊縮、腹肌無力,常與腰椎前凸並存。",
    impact: "腰部負荷增加,易疲勞、痠痛。",
  },
  headPosture: {
    why: "頭部前傾,即俗稱「烏龜頸」,多由長時間低頭看螢幕引起。",
    impact: "頸椎壓力上升,影響呼吸、肩頸僵硬甚至頭痛。",
  },
};

interface ImbalanceCardProps {
  itemKey: MotiRiskKey;
  item: MotiRiskItem;
  highlight?: boolean;
}

const LEVEL_STYLE: Record<
  "" | "maintain" | "warn" | "danger",
  { badge: string; bar: string }
> = {
  "": { badge: "bg-gray-100 text-gray-600", bar: "bg-gray-300" },
  maintain: { badge: "bg-green-100 text-green-700", bar: "bg-green-500" },
  warn: { badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500" },
  danger: { badge: "bg-red-100 text-red-700", bar: "bg-red-500" },
};

export function ImbalanceCard({ itemKey, item, highlight }: ImbalanceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = MOTI_THRESHOLDS[itemKey];
  const level: LevelKey = item.level || "";
  const explanation = ITEM_EXPLANATIONS[itemKey];

  // 進度條:依 thresholds[1](danger 起點)的 1.5 倍當作 100%
  const maxBar = meta.thresholds[1] * 1.5;
  const value = item.value ?? 0;
  const percent = Math.min(100, (Math.abs(value) / maxBar) * 100);

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className={cn(
        "w-full text-left rounded-2xl border-2 bg-white p-4 transition-all",
        highlight ? "border-stark-orange shadow-sm" : "border-stark-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-sm font-bold text-stark-text">{meta.name}</h3>
            {level && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                  LEVEL_STYLE[level].badge,
                )}
              >
                {MOTI_LEVEL_LABEL[level as "maintain" | "warn" | "danger"]}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-bold text-stark-text leading-none">
              {item.value !== null ? item.value : "—"}
            </span>
            <span className="text-xs text-muted-foreground">{meta.unit}</span>
            <span className="text-[10px] text-muted-foreground ml-1">
              (警惕 ≥{meta.thresholds[0]} / 危險 ≥{meta.thresholds[1]})
            </span>
          </div>
          {/* 進度條 */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", LEVEL_STYLE[level].bar)}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform mt-1",
            expanded && "rotate-180",
          )}
        />
      </div>

      {expanded && explanation && (
        <div className="mt-4 pt-4 border-t border-stark-border space-y-2 text-xs">
          <div>
            <span className="font-semibold text-stark-text">為什麼會這樣:</span>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              {explanation.why}
            </p>
          </div>
          <div>
            <span className="font-semibold text-stark-text">日常影響:</span>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              {explanation.impact}
            </p>
          </div>
        </div>
      )}
    </button>
  );
}
