// Prescription knowledge base
// Week 5 placeholder dataset. Replaces the demo emoji thumbnails in
// PrescriptionSection. DB table prescriptionKB (migration 0010) will
// mirror this shape.

export type PrescriptionCategory =
  | "core"
  | "hip"
  | "shoulder"
  | "balance"
  | "mobility"
  | "redcord";

export type PrescriptionDifficulty = "beginner" | "intermediate" | "advanced";

export type Prescription = {
  id: string;
  name: string;
  nameEn?: string;
  category: PrescriptionCategory;
  difficulty: PrescriptionDifficulty;
  defaultSets: number;
  defaultReps: string; // 字串以便支持 "30 秒" / "12 下"
  videoUrl?: string;
  thumbnailUrl?: string;
  thumbnailEmoji?: string;
  targetAreas: readonly string[];
  description: string;
  tag: string;
  cues?: readonly string[];
  contraindications?: readonly string[];
};

export const PRESCRIPTION_CATEGORIES: Record<
  PrescriptionCategory,
  { label: string; description: string }
> = {
  core: { label: "核心穩定", description: "腹部、軀幹中軸控制" },
  hip: { label: "髖部", description: "髖關節控制與穩定" },
  shoulder: { label: "肩胛", description: "肩胛骨與胸椎活動" },
  balance: { label: "平衡 / 對稱", description: "本體感覺與單邊控制" },
  mobility: { label: "活動度", description: "關節活動度與筋膜放鬆" },
  redcord: { label: "Redcord 懸吊", description: "神經肌肉再教育" },
};

export const PRESCRIPTION_DIFFICULTY: Record<
  PrescriptionDifficulty,
  string
> = {
  beginner: "入門",
  intermediate: "中階",
  advanced: "進階",
};

export const PRESCRIPTION_KB: readonly Prescription[] = [
  {
    id: "dead-bug",
    name: "死蟲式",
    nameEn: "Dead Bug",
    category: "core",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: "10 下",
    thumbnailEmoji: "🪲",
    targetAreas: ["腹橫肌", "核心穩定"],
    tag: "核心穩定",
    description:
      "仰躺,雙手雙腿舉起呈 90 度。對側手腳緩慢伸展,保持腰部貼地。",
    cues: ["腰不離地", "呼吸不憋", "對側交替"],
  },
  {
    id: "side-plank",
    name: "側棒式",
    nameEn: "Side Plank",
    category: "core",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: "30 秒",
    thumbnailEmoji: "🪖",
    targetAreas: ["腹斜肌", "軀幹側鏈"],
    tag: "軀幹控制",
    description: "側臥,前臂撐地,身體成一直線。",
    cues: ["髖不下沉", "肩在肘正上方", "視線正前"],
  },
  {
    id: "glute-bridge",
    name: "臀橋式",
    nameEn: "Glute Bridge",
    category: "hip",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: "12 下",
    thumbnailEmoji: "🌉",
    targetAreas: ["臀大肌", "髖伸"],
    tag: "骨盆穩定",
    description: "仰躺曲膝,腳掌貼地,臀部用力抬起。",
    cues: ["臀夾緊", "下背不過度伸展", "膝蓋不外開"],
  },
  {
    id: "bird-dog",
    name: "鳥狗式",
    nameEn: "Bird Dog",
    category: "core",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: "10 下",
    thumbnailEmoji: "🦴",
    targetAreas: ["核心穩定", "脊柱中立"],
    tag: "核心啟動",
    description: "四足姿勢,對側手腳同時伸展,維持骨盆穩定。",
    cues: ["不晃骨盆", "視線朝下", "緩慢控制"],
  },
  {
    id: "wall-angel",
    name: "天使靠牆",
    nameEn: "Wall Angel",
    category: "shoulder",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: "10 下",
    thumbnailEmoji: "👼",
    targetAreas: ["肩胛骨", "胸椎活動度"],
    tag: "肩胛控制",
    description: "背靠牆,手肘呈 90 度沿牆面上下滑動。",
    cues: ["手肘貼牆", "下背不離牆", "肩膀放鬆"],
  },
  {
    id: "single-leg-stand",
    name: "單腳站平衡",
    nameEn: "Single-leg Stand",
    category: "balance",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: "30 秒 / 邊",
    thumbnailEmoji: "🧍",
    targetAreas: ["平衡", "髖部穩定"],
    tag: "平衡訓練",
    description: "單腳站立,維持骨盆水平與軀幹穩定。",
    cues: ["腳掌平貼地", "髖不歪斜", "視線固定一點"],
  },
  {
    id: "cat-cow",
    name: "貓牛式",
    nameEn: "Cat-Cow",
    category: "mobility",
    difficulty: "beginner",
    defaultSets: 2,
    defaultReps: "10 下",
    thumbnailEmoji: "🐈",
    targetAreas: ["脊柱活動度"],
    tag: "活動度",
    description: "四足姿勢,脊椎節節彎曲與伸展。",
    cues: ["呼吸配合動作", "從頸椎開始", "緩慢"],
  },
  {
    id: "redcord-pelvic-tilt",
    name: "Redcord 骨盆穩定",
    nameEn: "Redcord Pelvic Stability",
    category: "redcord",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: "12 下",
    thumbnailEmoji: "🪢",
    targetAreas: ["核心", "Redcord"],
    tag: "Redcord 基礎",
    description: "Redcord 懸吊輔助下,進行骨盆中立的動態穩定訓練。",
    cues: ["保持腰部中立", "感受腹部用力", "緩慢可控"],
  },
];

export type PrescriptionSelection = {
  prescriptionId: string;
  sets: number;
  reps: string;
  notes?: string;
};

export function getPrescription(id: string): Prescription | undefined {
  return PRESCRIPTION_KB.find((p) => p.id === id);
}

export const DEFAULT_DEMO_PRESCRIPTIONS: readonly PrescriptionSelection[] = [
  { prescriptionId: "dead-bug", sets: 3, reps: "10 下" },
  { prescriptionId: "side-plank", sets: 3, reps: "30 秒" },
  { prescriptionId: "glute-bridge", sets: 3, reps: "12 下" },
];
