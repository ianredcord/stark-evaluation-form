// 處方知識庫(Prescription Knowledge Base)
// 對應 Moti 12 項失衡 → 四欄處方(筋膜/穴位/運動/儀器)
// Phase 1:JSON 形式內嵌於程式碼;Phase 2 再搬到 DB + 後台編輯介面
//
// 高優先 4 項(hkaRight / roundShoulder / lumbarLordosis / shoulderDiff)
// 內容為佔位範例,Ian 之後會以實際臨床處方覆蓋

import type { MotiRiskKey } from "./evaluation";

export type PrescriptionCategory = "fascia" | "acupoint" | "exercise" | "device";

export interface PrescriptionItem {
  id: string;
  category: PrescriptionCategory;
  title: string;
  description: string;
  duration?: string;
  notes?: string;
}

export type PrescriptionLevel = "warn" | "danger";

export interface PrescriptionForRiskLevel {
  itemKey: MotiRiskKey;
  level: PrescriptionLevel;
  fascia: PrescriptionItem[];
  acupoint: PrescriptionItem[];
  exercise: PrescriptionItem[];
  device: PrescriptionItem[];
}

export const PRESCRIPTION_CATEGORY_LABEL: Record<PrescriptionCategory, string> = {
  fascia: "筋膜放鬆",
  acupoint: "穴位調理",
  exercise: "運動處方",
  device: "儀器處置",
};

// TODO: Ian provides full clinical content. Below are structural placeholders.
export const PRESCRIPTION_KB: PrescriptionForRiskLevel[] = [
  // ───── HKA(右) ─────
  {
    itemKey: "hkaRight",
    level: "warn",
    fascia: [
      {
        id: "fascia-hka-r-warn-itband",
        category: "fascia",
        title: "髂脛束滾筒放鬆",
        description: "從髖外側沿大腿外側滾至膝外上緣,慢速來回。",
        duration: "2 分鐘 / 側",
      },
    ],
    acupoint: [
      {
        id: "acupoint-hka-r-warn-yanglingquan",
        category: "acupoint",
        title: "陽陵泉",
        description: "膝外側腓骨頭前下方凹陷處;指壓或按摩棒按壓。",
        duration: "1 分鐘",
      },
    ],
    exercise: [
      {
        id: "exercise-hka-r-warn-clamshell",
        category: "exercise",
        title: "蚌殼式(Clamshell)",
        description: "強化臀中肌、改善膝外翻代償。",
        duration: "15 下 × 3 組",
      },
    ],
    device: [],
  },
  {
    itemKey: "hkaRight",
    level: "danger",
    fascia: [
      {
        id: "fascia-hka-r-danger-itband",
        category: "fascia",
        title: "髂脛束 + 闊筋膜張肌 深層放鬆",
        description: "用按摩槍或紅繩懸吊釋放髂脛束緊張。",
        duration: "3 分鐘 / 側",
        notes: "若有劇痛建議搭配儀器處置",
      },
    ],
    acupoint: [
      {
        id: "acupoint-hka-r-danger-xuehai",
        category: "acupoint",
        title: "血海 + 陽陵泉",
        description: "雙穴交替按壓,改善膝周血流與肌張力。",
        duration: "各 1 分鐘",
      },
    ],
    exercise: [
      {
        id: "exercise-hka-r-danger-mono-squat",
        category: "exercise",
        title: "單腳輕負重蹲",
        description: "鏡前監控膝對齊腳尖,矯正動態 valgus。",
        duration: "10 下 × 3 組",
      },
    ],
    device: [
      {
        id: "device-hka-r-danger-shockwave",
        category: "device",
        title: "震波(髂脛束附著點)",
        description: "RONFIC MINI+ / 低能量設定",
        notes: "由治療師依疼痛閾值調整",
      },
    ],
  },

  // ───── 圓肩 ─────
  {
    itemKey: "roundShoulder",
    level: "warn",
    fascia: [
      {
        id: "fascia-rs-warn-pec",
        category: "fascia",
        title: "胸大肌 / 胸小肌筋膜放鬆",
        description: "球放鬆胸前緣,沿鎖骨下緣推開。",
        duration: "2 分鐘 / 側",
      },
    ],
    acupoint: [
      {
        id: "acupoint-rs-warn-zhongfu",
        category: "acupoint",
        title: "中府 / 雲門",
        description: "鎖骨外端下方凹陷;按壓鬆動胸肌起點。",
        duration: "1 分鐘",
      },
    ],
    exercise: [
      {
        id: "exercise-rs-warn-wall-angel",
        category: "exercise",
        title: "牆天使(Wall Angel)",
        description: "活化下斜方肌、菱形肌,改善胸椎伸展。",
        duration: "10 下 × 3 組",
      },
    ],
    device: [],
  },
  {
    itemKey: "roundShoulder",
    level: "danger",
    fascia: [
      {
        id: "fascia-rs-danger-pec-minor",
        category: "fascia",
        title: "胸小肌深層筋膜釋放",
        description: "肩前彈響或卡頓者必做。",
        duration: "3 分鐘 / 側",
      },
    ],
    acupoint: [
      {
        id: "acupoint-rs-danger-jianjing",
        category: "acupoint",
        title: "肩井 + 中府",
        description: "上斜方降張、胸前打開組合。",
        duration: "各 1 分鐘",
      },
    ],
    exercise: [
      {
        id: "exercise-rs-danger-redcord-sd",
        category: "exercise",
        title: "紅繩 Scapular Depression",
        description: "下斜方啟動,直接對抗圓肩。",
        duration: "30 秒 × 5 次",
      },
    ],
    device: [
      {
        id: "device-rs-danger-xim",
        category: "device",
        title: "RONFIC XIM 胸椎伸展",
        description: "胸椎 T3–T6 mobilization 程式",
      },
    ],
  },

  // ───── 腰椎前凸 ─────
  {
    itemKey: "lumbarLordosis",
    level: "warn",
    fascia: [
      {
        id: "fascia-ll-warn-qladd",
        category: "fascia",
        title: "腰方肌 + 髂腰肌放鬆",
        description: "側躺球放鬆腰側、髖前釋放髂腰肌。",
        duration: "2 分鐘 / 側",
      },
    ],
    acupoint: [
      {
        id: "acupoint-ll-warn-shenshu",
        category: "acupoint",
        title: "腎俞",
        description: "腰二椎旁開 1.5 寸;指壓緩解下背緊張。",
        duration: "1 分鐘",
      },
    ],
    exercise: [
      {
        id: "exercise-ll-warn-deadbug",
        category: "exercise",
        title: "死蟲式(Dead Bug)",
        description: "核心抗伸展訓練,中立骨盆優先。",
        duration: "10 下 × 3 組",
      },
    ],
    device: [],
  },
  {
    itemKey: "lumbarLordosis",
    level: "danger",
    fascia: [
      {
        id: "fascia-ll-danger-iliopsoas",
        category: "fascia",
        title: "髂腰肌深層放鬆",
        description: "髖屈緊縮為主因,徒手或工具皆可。",
        duration: "3 分鐘 / 側",
        notes: "孕婦 / 腹腔手術史避開",
      },
    ],
    acupoint: [
      {
        id: "acupoint-ll-danger-mingmen",
        category: "acupoint",
        title: "命門 + 腎俞",
        description: "下背中軸 + 雙側組合。",
        duration: "各 1 分鐘",
      },
    ],
    exercise: [
      {
        id: "exercise-ll-danger-redcord-pls",
        category: "exercise",
        title: "紅繩 PLS(俯臥懸吊核心)",
        description: "強化深層核心、抑制腰椎代償。",
        duration: "20 秒 × 5 次",
      },
    ],
    device: [
      {
        id: "device-ll-danger-miniplus",
        category: "device",
        title: "RONFIC MINI+ 下背肌群",
        description: "L1–L5 雙側放鬆程式",
      },
    ],
  },

  // ───── 肩膀高度差 ─────
  {
    itemKey: "shoulderDiff",
    level: "warn",
    fascia: [
      {
        id: "fascia-sd-warn-uppertrap",
        category: "fascia",
        title: "高側上斜方肌筋膜放鬆",
        description: "高的那一側做主放鬆,平衡左右張力。",
        duration: "2 分鐘",
      },
    ],
    acupoint: [
      {
        id: "acupoint-sd-warn-jianjing",
        category: "acupoint",
        title: "肩井(高側)",
        description: "降高側肩線的關鍵穴位。",
        duration: "1 分鐘",
      },
    ],
    exercise: [
      {
        id: "exercise-sd-warn-shrug-eccentric",
        category: "exercise",
        title: "離心聳肩(高側)",
        description: "緩慢下放,增加肩胛下沉肌控制。",
        duration: "10 下 × 3 組",
      },
    ],
    device: [],
  },
  {
    itemKey: "shoulderDiff",
    level: "danger",
    fascia: [
      {
        id: "fascia-sd-danger-levator",
        category: "fascia",
        title: "提肩胛肌深層釋放",
        description: "頸根痛或單側肩胛上抬常見來源。",
        duration: "3 分鐘",
      },
    ],
    acupoint: [
      {
        id: "acupoint-sd-danger-jianjing-tianliao",
        category: "acupoint",
        title: "肩井 + 天髎",
        description: "雙穴組合針對提肩胛 / 上斜方。",
        duration: "各 1 分鐘",
      },
    ],
    exercise: [
      {
        id: "exercise-sd-danger-redcord-sd",
        category: "exercise",
        title: "紅繩 Scapular Depression(高側單側)",
        description: "對抗側 down-regulation,平衡左右。",
        duration: "30 秒 × 5 次",
      },
    ],
    device: [
      {
        id: "device-sd-danger-shockwave",
        category: "device",
        title: "震波(提肩胛附著點)",
        description: "RONFIC MINI+ 點對點處置",
      },
    ],
  },

  // ───── 其他 8 項先留待 Phase 2 補齊 ─────
  // hkaLeft, thoracicKyphosis, scoliosis, kneeFlexion,
  // pelvisRotation, pelvisTilt, pelvisAnterior, headPosture
];

/**
 * 依 (riskKey, level) 取得對應的處方四欄。找不到則回傳 null。
 */
export function getPrescriptionFor(
  riskKey: MotiRiskKey,
  level: PrescriptionLevel,
): PrescriptionForRiskLevel | null {
  return (
    PRESCRIPTION_KB.find((p) => p.itemKey === riskKey && p.level === level) ?? null
  );
}

/**
 * 該失衡項是否已建構處方知識庫(任一等級有資料即算)。
 */
export function hasPrescriptionKB(riskKey: MotiRiskKey): boolean {
  return PRESCRIPTION_KB.some((p) => p.itemKey === riskKey);
}
