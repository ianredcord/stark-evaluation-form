// 評估表單資料類型定義

// 基本資料（第 1 頁）
export interface BasicInfo {
  date: string;
  name: string;
  birthday: string;
  occupation: string;
  dominantHand: "left" | "right" | "";
  
  // 目前症狀
  currentSymptomLocation: string;
  currentSymptomTrigger: string;
  currentSymptomTreatment: string;
  
  // 過去症狀
  pastSymptomLocation: string;
  pastSymptomTrigger: string;
  pastSymptomTreatment: string;
  
  // 最早症狀
  earliestSymptomLocation: string;
  earliestSymptomTrigger: string;
  earliestSymptomTreatment: string;
  
  // 病史
  injuryHistory: string;
  fractureHistory: string;
  surgeryHistory: string;
  medicalDiagnosis: string;
  medication: string;
  exerciseHabits: string;
  sleepCondition: string;
  goalsAndExpectations: string;
}

// Moti Physio 3D 姿勢檢測（第 2 頁）
export interface MotiPhysioReport {
  reportPage1: string; // 圖片 URL
  reportPage2: string; // 圖片 URL
}

// Moti 12 項風險數值單項
export interface MotiRiskItem {
  value: number | null;
  level: "" | "maintain" | "warn" | "danger";
}

// 12 項閾值定義
// 邏輯：value < t[0] → maintain；t[0] ≤ value < t[1] → warn；value ≥ t[1] → danger
export const MOTI_THRESHOLDS = {
  hkaRight:         { name: "[右] HKA-角度", unit: "°", thresholds: [2, 4] },
  hkaLeft:          { name: "[左] HKA-角度", unit: "°", thresholds: [2, 4] },
  shoulderDiff:     { name: "肩膀高度差",    unit: "°", thresholds: [1, 3] },
  roundShoulder:    { name: "圓肩",          unit: "°", thresholds: [12, 19] },
  lumbarLordosis:   { name: "腰椎前凸",      unit: "°", thresholds: [40, 44] },
  thoracicKyphosis: { name: "胸椎後凸",      unit: "°", thresholds: [41, 47] },
  scoliosis:        { name: "脊椎側彎",      unit: "°", thresholds: [8, 17] },
  kneeFlexion:      { name: "膝關節屈曲",    unit: "°", thresholds: [4, 7] },
  pelvisRotation:   { name: "骨盆旋轉",      unit: "°", thresholds: [1, 3] },
  pelvisTilt:       { name: "骨盆傾斜",      unit: "°", thresholds: [1, 2] },
  pelvisAnterior:   { name: "骨盆前傾",      unit: "°", thresholds: [3, 5] },
  headPosture:      { name: "頭部姿勢",      unit: "°", thresholds: [17, 23] },
} as const;

export type MotiRiskKey = keyof typeof MOTI_THRESHOLDS;

export interface MotiRiskValues {
  hkaRight: MotiRiskItem;
  hkaLeft: MotiRiskItem;
  shoulderDiff: MotiRiskItem;
  roundShoulder: MotiRiskItem;
  lumbarLordosis: MotiRiskItem;
  thoracicKyphosis: MotiRiskItem;
  scoliosis: MotiRiskItem;
  kneeFlexion: MotiRiskItem;
  pelvisRotation: MotiRiskItem;
  pelvisTilt: MotiRiskItem;
  pelvisAnterior: MotiRiskItem;
  headPosture: MotiRiskItem;
  overallRiskIndex: number | null;
}

export function calculateMotiLevel(
  value: number | null,
  thresholds: readonly [number, number]
): "" | "maintain" | "warn" | "danger" {
  if (value === null || isNaN(value)) return "";
  if (value < thresholds[0]) return "maintain";
  if (value < thresholds[1]) return "warn";
  return "danger";
}

export const MOTI_LEVEL_LABEL: Record<"maintain" | "warn" | "danger", string> = {
  maintain: "維持",
  warn: "警惕",
  danger: "危險",
};

// 功能性動作檢測項目
export interface FunctionalMovementItem {
  performance: string; // 表現/疼痛
  promotingFactor: string; // 促進因素 A-E
  condition: string; // 狀況描述
}

// 功能性動作檢測（第 3-4 頁）
export interface FunctionalMovement {
  // 頸部
  neckFlexion: FunctionalMovementItem;
  neckExtension: FunctionalMovementItem;
  neckRotationLeft: FunctionalMovementItem;
  neckRotationRight: FunctionalMovementItem;
  
  // 肩關節
  shoulderFlexionLeft: FunctionalMovementItem;
  shoulderFlexionRight: FunctionalMovementItem;
  shoulderAbductionLeft: FunctionalMovementItem;
  shoulderAbductionRight: FunctionalMovementItem;
  
  // 軀幹
  trunkFlexion: FunctionalMovementItem;
  trunkExtension: FunctionalMovementItem;
  trunkRotationLeft: FunctionalMovementItem;
  trunkRotationRight: FunctionalMovementItem;
  
  // 下肢
  singleLegStandLeft: FunctionalMovementItem;
  singleLegStandRight: FunctionalMovementItem;
  overheadSquat: FunctionalMovementItem;
}

// 紅繩動力鍊檢測項目
export interface RedcordItem {
  checked: boolean;
  scoreR: string; // 右側評分 0-3
  scoreL: string; // 左側評分 0-3
  workload: string; // 1-6 / AXIS / Stimula
  sets: number; // 組數
  reps: number; // 次數
}

// 核心項目（有 Pain 和秒數）
export interface RedcordCoreItem {
  checked: boolean;
  pain: boolean;
  seconds: number;
  reps: number;
}

// 頸部項目
export interface RedcordCervicalItem {
  checked: boolean;
  pain: boolean;
  stimula: boolean;
  value: string;
}

// 紅繩動力鍊檢測（第 5 頁）
export interface RedcordAssessment {
  trainingSide: string; // 訓練側
  
  // 下肢
  spl: RedcordItem; // 臀大肌
  sb: RedcordItem; // 腿後腱肌群
  abd: RedcordItem; // 臀中肌
  add: RedcordItem; // 內收肌群
  pb: RedcordItem; // 腹部肌群
  skf: RedcordItem; // 腿後腱肌群
  phf: RedcordItem; // 腰大肌
  
  // 核心
  sls: RedcordCoreItem;
  pls: RedcordCoreItem;
  kls: RedcordCoreItem;
  
  // 呼吸/骨盆底肌教學
  pelvicFloorStimula: boolean;
  
  // 上肢
  scapularDepression: RedcordItem; // 下斜方肌
  scapularProtraction: RedcordItem; // 前鋸肌
  scapularRetraction: RedcordItem; // 菱形肌
  shoulderExtension: RedcordItem; // 闘背肌
  pushUp: RedcordItem; // 胸大肌/肱三頭肌
  pullUp: RedcordItem; // 後三角肌/二頭肌
  
  // 頸部
  cervicalSetting: RedcordCervicalItem;
  cervicalRetraction: RedcordCervicalItem;
  cervicalRotation: RedcordCervicalItem;
  cervicalExtension: RedcordCervicalItem;
  cervicalSidebending: RedcordCervicalItem;
  
  // 其他動作
  otherMovement: {
    name: string;
    score: string;
    workload: string;
    value: string;
  };
}

// RONFIC 評估結果（第 6 頁）
export interface RonficAssessment {
  miniplusResult: string; // 圖片 URL
  ximResult: string; // 圖片 URL
}

// 訓練計畫項目
export interface TrainingPlanItem {
  session: string;
  content: string;
}

// 訓練計畫與備註（第 7 頁）
export interface TrainingPlan {
  plans: TrainingPlanItem[];
  notes: string;
  photos: string[]; // 圖片 URL 陣列
  clientSignature: string; // 簽名 Data URL
  coachSignature: string; // 簽名 Data URL
}

// === W4 新增:整合評估結構化型別 ===

export interface TopIssue {
  title: string;
  description: string;
}

export type RiskLevel = "low" | "mid" | "high";

export interface WeekPlanItem {
  n: number;
  weekLabel: string;
  phase: string;
  items: string[];
}

export interface SubScores {
  posture: number;
  movement: number;
  neuromuscular: number;
  composition: number;
}

export interface BodyHotspotData {
  x: number;
  y: number;
  color?: "good" | "warn" | "danger" | "primary";
  r?: number;
}

export interface BodyRiskMapData {
  hotspotsFront: BodyHotspotData[];
  hotspotsBack: BodyHotspotData[];
}

export interface StrengthItem {
  label: string;
  hint?: string;
}

export interface PrescriptionSelection {
  prescriptionId: string;
  sets: number;
  reps: string;
  notes?: string;
}

// 完整評估表單資料
export interface EvaluationFormData {
  id?: number;
  clientId?: number;
  basicInfo: BasicInfo;
  motiPhysio: MotiPhysioReport;
  motiRiskValues: MotiRiskValues;
  functionalMovement: FunctionalMovement;
  redcord: RedcordAssessment;
  ronfic: RonficAssessment;
  trainingPlan: TrainingPlan;

  // === W4 新增:整合評估文字 ===
  chiefComplaint?: string;
  clientGoals?: string;
  plainExplanation?: string;
  interventionNotes?: string;

  // === W4 新增:整合評估結構化 ===
  topThreeIssues?: TopIssue[];
  recommendedPlan?: string[];
  interventionTypes?: Record<string, boolean>;
  weekPlan?: WeekPlanItem[];
  reassessDate?: string;
  riskLevel?: RiskLevel;

  // === W4 新增:客戶端視覺欄位 ===
  overallScore?: number;
  subScores?: SubScores;
  bodyRiskMap?: BodyRiskMapData;
  strengths?: StrengthItem[];
  inBodyData?: Record<string, unknown>;
  assignedTherapistId?: string;

  // === W4 新增:處方 ===
  prescriptions?: PrescriptionSelection[];

  // === W4 新增:分享連結 ===
  shareCode?: string;
  shareCodeCreatedAt?: string;
  lastViewedByClient?: string;

  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
}

// 預設空白表單資料
export const defaultBasicInfo: BasicInfo = {
  date: "",
  name: "",
  birthday: "",
  occupation: "",
  dominantHand: "",
  currentSymptomLocation: "",
  currentSymptomTrigger: "",
  currentSymptomTreatment: "",
  pastSymptomLocation: "",
  pastSymptomTrigger: "",
  pastSymptomTreatment: "",
  earliestSymptomLocation: "",
  earliestSymptomTrigger: "",
  earliestSymptomTreatment: "",
  injuryHistory: "",
  fractureHistory: "",
  surgeryHistory: "",
  medicalDiagnosis: "",
  medication: "",
  exerciseHabits: "",
  sleepCondition: "",
  goalsAndExpectations: "",
};

export const defaultFunctionalMovementItem: FunctionalMovementItem = {
  performance: "",
  promotingFactor: "",
  condition: "",
};

export const defaultRedcordItem: RedcordItem = {
  checked: false,
  scoreR: "",
  scoreL: "",
  workload: "",
  sets: 0,
  reps: 0,
};

export const defaultRedcordCoreItem: RedcordCoreItem = {
  checked: false,
  pain: false,
  seconds: 0,
  reps: 0,
};

export const defaultRedcordCervicalItem: RedcordCervicalItem = {
  checked: false,
  pain: false,
  stimula: false,
  value: "",
};

export const defaultMotiPhysioReport: MotiPhysioReport = {
  reportPage1: "",
  reportPage2: "",
};

export const defaultMotiRiskItem: MotiRiskItem = { value: null, level: "" };

export const defaultMotiRiskValues: MotiRiskValues = {
  hkaRight: { ...defaultMotiRiskItem },
  hkaLeft: { ...defaultMotiRiskItem },
  shoulderDiff: { ...defaultMotiRiskItem },
  roundShoulder: { ...defaultMotiRiskItem },
  lumbarLordosis: { ...defaultMotiRiskItem },
  thoracicKyphosis: { ...defaultMotiRiskItem },
  scoliosis: { ...defaultMotiRiskItem },
  kneeFlexion: { ...defaultMotiRiskItem },
  pelvisRotation: { ...defaultMotiRiskItem },
  pelvisTilt: { ...defaultMotiRiskItem },
  pelvisAnterior: { ...defaultMotiRiskItem },
  headPosture: { ...defaultMotiRiskItem },
  overallRiskIndex: null,
};

export const defaultFunctionalMovement: FunctionalMovement = {
  neckFlexion: { ...defaultFunctionalMovementItem },
  neckExtension: { ...defaultFunctionalMovementItem },
  neckRotationLeft: { ...defaultFunctionalMovementItem },
  neckRotationRight: { ...defaultFunctionalMovementItem },
  shoulderFlexionLeft: { ...defaultFunctionalMovementItem },
  shoulderFlexionRight: { ...defaultFunctionalMovementItem },
  shoulderAbductionLeft: { ...defaultFunctionalMovementItem },
  shoulderAbductionRight: { ...defaultFunctionalMovementItem },
  trunkFlexion: { ...defaultFunctionalMovementItem },
  trunkExtension: { ...defaultFunctionalMovementItem },
  trunkRotationLeft: { ...defaultFunctionalMovementItem },
  trunkRotationRight: { ...defaultFunctionalMovementItem },
  singleLegStandLeft: { ...defaultFunctionalMovementItem },
  singleLegStandRight: { ...defaultFunctionalMovementItem },
  overheadSquat: { ...defaultFunctionalMovementItem },
};

export const defaultRedcordAssessment: RedcordAssessment = {
  trainingSide: "",
  spl: { ...defaultRedcordItem },
  sb: { ...defaultRedcordItem },
  abd: { ...defaultRedcordItem },
  add: { ...defaultRedcordItem },
  pb: { ...defaultRedcordItem },
  skf: { ...defaultRedcordItem },
  phf: { ...defaultRedcordItem },
  sls: { ...defaultRedcordCoreItem },
  pls: { ...defaultRedcordCoreItem },
  kls: { ...defaultRedcordCoreItem },
  pelvicFloorStimula: false,
  scapularDepression: { ...defaultRedcordItem },
  scapularProtraction: { ...defaultRedcordItem },
  scapularRetraction: { ...defaultRedcordItem },
  shoulderExtension: { ...defaultRedcordItem },
  pushUp: { ...defaultRedcordItem },
  pullUp: { ...defaultRedcordItem },
  cervicalSetting: { ...defaultRedcordCervicalItem },
  cervicalRetraction: { ...defaultRedcordCervicalItem },
  cervicalRotation: { ...defaultRedcordCervicalItem },
  cervicalExtension: { ...defaultRedcordCervicalItem },
  cervicalSidebending: { ...defaultRedcordCervicalItem },
  otherMovement: { name: "", score: "", workload: "", value: "" },
};

export const defaultRonficAssessment: RonficAssessment = {
  miniplusResult: "",
  ximResult: "",
};

export const defaultTrainingPlan: TrainingPlan = {
  plans: [
    { session: "", content: "" },
    { session: "", content: "" },
    { session: "", content: "" },
    { session: "", content: "" },
    { session: "", content: "" },
  ],
  notes: "",
  photos: [],
  clientSignature: "",
  coachSignature: "",
};

export const defaultEvaluationFormData: EvaluationFormData = {
  basicInfo: defaultBasicInfo,
  motiPhysio: defaultMotiPhysioReport,
  motiRiskValues: defaultMotiRiskValues,
  functionalMovement: defaultFunctionalMovement,
  redcord: defaultRedcordAssessment,
  ronfic: defaultRonficAssessment,
  trainingPlan: defaultTrainingPlan,
};
