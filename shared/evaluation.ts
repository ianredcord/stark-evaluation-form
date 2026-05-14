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

// 完整評估表單資料
export interface EvaluationFormData {
  id?: number;
  basicInfo: BasicInfo;
  motiPhysio: MotiPhysioReport;
  functionalMovement: FunctionalMovement;
  redcord: RedcordAssessment;
  ronfic: RonficAssessment;
  trainingPlan: TrainingPlan;
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
  functionalMovement: defaultFunctionalMovement,
  redcord: defaultRedcordAssessment,
  ronfic: defaultRonficAssessment,
  trainingPlan: defaultTrainingPlan,
};
