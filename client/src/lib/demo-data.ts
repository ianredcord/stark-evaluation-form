// Chen Xiaoyan demo dataset — matches DESIGN_THERAPIST_v3.png + DESIGN_CLIENT_v2.png.
// Used as fake data through Week 2-3 until Week 4 wires real tRPC data.

export const demoClient = {
  id: "demo-001",
  name: "陳小妍",
  initial: "陳",
  age: 24,
  gender: "女性",
  height: 158,
  weight: 50,
  primaryTherapist: "林昱辰",
};

export const demoComplaint = {
  symptomAreas: "下背部痠痛、頸部緊繃、右膝內側不適",
  triggerActions: "久坐起身、深蹲、長時間電腦作業",
  injuryHistory: "無明顯外傷",
  surgeryHistory: "無",
  medicalDiagnosis: "無明確診斷",
  sleepStatus: "約 6 小時,偶有淺眠",
  goals: "減少痠痛、改善姿勢、提升運動表現與穩定度",
};

export const demoDataSources = [
  {
    systemName: "MOTI Physio",
    systemKind: "姿勢結構分析",
    state: "imported" as const,
    summaryHtml: "異常 4 項",
    timestamp: "2026/05/13 11:42",
    accent: "primary" as const,
  },
  {
    systemName: "RONFIC",
    systemKind: "動作功能評估",
    state: "imported" as const,
    summaryHtml: "異常 3 項",
    timestamp: "2026/05/13 11:18",
    accent: "good" as const,
  },
  {
    systemName: "InBody",
    systemKind: "身體組成分析",
    state: "imported" as const,
    summaryHtml: "體脂 22.6%",
    timestamp: "2026/05/12 13:50",
    accent: "accent" as const,
  },
  {
    systemName: "Redcord",
    systemKind: "神經肌肉控制評估",
    state: "imported" as const,
    summaryHtml: "弱項 6 項",
    timestamp: "2026/05/12 13:40",
    accent: "warn" as const,
  },
];

export const demoPostureFindings = [
  { label: "頭部姿勢", value: "前傾 11°", tone: "warn" as const },
  { label: "骨盆前傾", value: "輕度前傾", tone: "warn" as const },
  { label: "骨盆側傾", value: "右側低", tone: "warn" as const },
  { label: "肩膀高度差", value: "右高 6 mm", tone: "good" as const },
  { label: "HKA 角度", value: "右內扣 3°", tone: "danger" as const },
];

export const demoPostureHotspots = [
  { x: 0.5, y: 0.08, color: "danger" as const, r: 4 },
  { x: 0.5, y: 0.22, color: "danger" as const, r: 4.5 },
  { x: 0.5, y: 0.5, color: "warn" as const, r: 4 },
  { x: 0.5, y: 0.58, color: "warn" as const, r: 4 },
  { x: 0.62, y: 0.7, color: "danger" as const, r: 4 },
];

export type FunctionalIssue = {
  label: string;
  result: string;
  level: 0 | 1 | 2 | 3;
};

export const demoFunctionalIssues: FunctionalIssue[] = [
  { label: "單腳站", result: "左差", level: 2 },
  { label: "核心控制", result: "中等", level: 2 },
  { label: "深蹲", result: "代償多", level: 2 },
  { label: "呼吸 / 骨盆底", result: "協調差", level: 1 },
  { label: "軀幹旋轉", result: "左右不對稱", level: 2 },
  { label: "左右不對稱", result: "明顯", level: 2 },
];

export const demoTherapistJudgment =
  "個案頸前沉 + 骨盆下沉,核心啟動慢,左右不對稱明顯。建議先處理骨盆穩定 + 核心,再加肩頸活動度。深蹲時右髖注意,可能跟骨盆控制有關。";

export const demoTopIssues = [
  {
    title: "核心穩定與控制不足",
    description: "核心啟動延遲,動作中代償明顯。",
  },
  {
    title: "左右不對稱與骨盆控制",
    description: "骨盆前傾、單腳站不穩與旋轉不對稱。",
  },
  {
    title: "深蹲動作代償與軀幹主導不足",
    description: "深蹲時膝前位與軀幹偏倒代償明顯。",
  },
];

export const demoInterventionOptions = [
  { key: "training", label: "訓練" },
  { key: "therapy", label: "治療" },
  { key: "redcord", label: "Redcord" },
  { key: "home", label: "居家運動" },
  { key: "reassess", label: "複評追蹤" },
] as const;

export const demoInterventionDefaults: Record<string, boolean> = {
  training: true,
  therapy: true,
  redcord: true,
  home: false,
  reassess: false,
};

export const demoInterventionNotes =
  "以核心與髖部穩定、動作控制與對稱性為主要介入方向。";

export const demoWeekPlan = [
  {
    n: 1,
    weekLabel: "第 1 週",
    phase: "啟動期",
    items: ["姿勢矯正呼吸練習", "核心啟動", "Redcord 基礎訓練"],
  },
  {
    n: 2,
    weekLabel: "第 2 週",
    phase: "穩定期",
    items: ["髖關節控制訓練", "深蹲動作再教育", "單腳站平衡訓練"],
  },
  {
    n: 3,
    weekLabel: "第 3 週",
    phase: "整合期",
    items: ["負重功能訓練", "旋轉與抗阻訓練", "動作整合練習"],
  },
  {
    n: 4,
    weekLabel: "第 4 週",
    phase: "精進期",
    items: ["功能強化與漸進", "對稱性檢查", "複評與調整計畫"],
  },
];

export const demoEvaluationProgress = [
  { key: "basic", label: "基本資料", date: "2026/5/10", done: true },
  { key: "questionnaire", label: "問卷完成", date: "2026/5/10", done: true },
  { key: "moti", label: "MOTI 匯入", date: "2026/5/13", done: true },
  { key: "ronfic", label: "RONFIC 匯入", date: "2026/5/13", done: true },
  { key: "inbody", label: "InBody 匯入", date: "2026/5/12", done: true },
  { key: "redcord", label: "Redcord 匯入", date: "2026/5/12", done: true },
  {
    key: "integrate",
    label: "整合評估",
    date: "填寫中",
    done: false,
    current: true,
  },
];

export const demoReportSummary = {
  plainExplanation:
    "您的下背與腰部痠痛主要與姿勢前傾、骨盆穩定不足有關聯。我們將透過訓練與治療,改善穩定度和動作控制,幫助您減少痠痛並提升運動表現。",
  riskLevel: {
    score: 68,
    label: "中高風險",
    tone: "warn" as const,
    note:
      "目前姿勢與動作控制問題較明顯,若不改善可能增加再發與慢性疼痛風險。",
  },
  recommendedPlan: [
    "核心與軀幹穩定訓練",
    "深蹲動作再教育",
    "Redcord 懸吊穩定訓練",
    "姿勢與動作對稱性改善",
  ],
  reassessDate: "2026/06/10",
  reassessHint: "4 週後",
  notes:
    "建議日常週免久坐,每 60 分鐘起身活動;持續記錄痠痛變化以利追蹤調整。",
  lastUpdatedBy: "林昱辰",
  lastUpdatedAt: "2026/05/13 17:28",
};

// --- Client-facing report (Week 3) ---

export const demoClientReport = {
  evaluationDate: "2026/05/13",
  lastScore: 61,
  currentScore: 68,
  state: { label: "穩定進步中", tone: "warn" as const },
  encouragement:
    "你的身體功能表現屬於中等偏佳,在姿勢與核心穩定方面仍有提升空間。我們已為你擬定個人化改善計畫,持續練習,會讓你越來越好!",
  subScores: {
    posture: { value: 66, last: 59, tone: "warn" as const, toneLabel: "中等" },
    movement: {
      value: 70,
      last: 62,
      tone: "good" as const,
      toneLabel: "中等偏佳",
    },
    neuromuscular: {
      value: 64,
      last: 56,
      tone: "warn" as const,
      toneLabel: "中等",
    },
    composition: {
      value: 72,
      last: 68,
      tone: "good" as const,
      toneLabel: "良好",
    },
  },
  priorityFindings: [
    {
      title: "骨盆略為前傾,左右平衡需加強",
      description: "長時間坐姿習慣可能影響骨盆穩定。",
    },
    {
      title: "頭頸前傾與肩頸緊繃",
      description: "頸椎前傾角度偏大,容易引起肩頸不適。",
    },
    {
      title: "核心穩定性不足",
      description: "核心肌群啟動不足,影響動作效率與保護力。",
    },
  ],
  goodNews:
    "你的體組成與肌肉量表現良好,是建立健康與提升表現的好基礎!",
  riskLegend: [
    { label: "頭頸", hint: "緊繃風險較高", tone: "danger" as const },
    { label: "肩頸", hint: "緊繃風險較高", tone: "danger" as const },
    { label: "胸椎", hint: "活動度偏低", tone: "warn" as const },
    { label: "骨盆", hint: "穩定性偏弱", tone: "warn" as const },
    { label: "右膝", hint: "壓力偏高", tone: "danger" as const },
  ],
  strengths: [
    { label: "體組成表現良好", hint: "體脂 22.6%" },
    { label: "肌肉量充足", hint: "18.7 kg" },
    { label: "肩膀對稱性佳" },
  ],
  strengthsClosing: "這些是你建立健康與提升表現的好基礎。",
  dataSources: [
    {
      systemName: "MOTI Physio",
      systemKind: "姿勢結構分析",
      state: "imported" as const,
      accent: "primary" as const,
    },
    {
      systemName: "RONFIC",
      systemKind: "動作功能評估",
      state: "imported" as const,
      accent: "good" as const,
    },
    {
      systemName: "InBody",
      systemKind: "身體組成分析",
      state: "imported" as const,
      accent: "accent" as const,
    },
    {
      systemName: "Redcord",
      systemKind: "神經肌肉控制評估",
      state: "imported" as const,
      accent: "warn" as const,
    },
  ],
  recommendations: [
    {
      icon: "training" as const,
      title: "訓練建議",
      description: "強化核心穩定與體部控制,改善姿勢與動作效率",
      ctaLabel: "查看建議動作",
    },
    {
      icon: "therapy" as const,
      title: "治療建議",
      description: "放鬆肩頸與胸椎活動度,調整骨盆平衡",
      ctaLabel: "了解治療方案",
    },
    {
      icon: "reassess" as const,
      title: "複評時間",
      description: "建議 4 週後回來複評,追蹤進度與調整計畫",
      ctaLabel: "預約複評",
    },
  ],
  prescriptions: [
    {
      name: "死蟲式",
      nameEn: "Dead Bug",
      sets: "3 組 × 10 下",
      tag: "核心穩定",
      thumbnailEmoji: "🪲",
    },
    {
      name: "側棒式",
      nameEn: "Side Plank",
      sets: "3 組 × 30 秒",
      tag: "軀幹控制",
      thumbnailEmoji: "🪖",
    },
    {
      name: "臀橋式",
      nameEn: "Glute Bridge",
      sets: "3 組 × 12 下",
      tag: "骨盆穩定",
      thumbnailEmoji: "🌉",
    },
  ],
  prescriptionsIntro: "以下是針對你的問題,教練特別開立的處方,可在家或場館練習",
  expectedBirthdate: "2002-03-15", // for demo verify form
  shareCode: "abc123",
};

export const demoTabs = [
  { key: "complaint", label: "主訴與病史" },
  { key: "posture", label: "姿勢判讀" },
  { key: "functional", label: "功能動作" },
  { key: "body-comp", label: "體組成" },
  { key: "neuromuscular", label: "神經肌肉控制" },
  { key: "summary", label: "綜合結論" },
] as const;
