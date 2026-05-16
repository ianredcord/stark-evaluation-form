import { int, json, longtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", [
    "super_admin",
    "admin",
    "therapist",
    "assistant",
    "viewer",
    // legacy compat — pre-migration rows
    "user",
  ])
    .default("therapist")
    .notNull(),
  status: mysqlEnum("status", ["active", "disabled"])
    .default("active")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const ALL_ROLES = [
  "super_admin",
  "admin",
  "therapist",
  "assistant",
  "viewer",
] as const;
export type UserRole = (typeof ALL_ROLES)[number];
export type UserStatus = "active" | "disabled";

export const ROLE_RANK: Record<UserRole, number> = {
  super_admin: 50,
  admin: 40,
  therapist: 30,
  assistant: 20,
  viewer: 10,
};

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "super_admin" || role === "admin";
}

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 評估表主表
 */
export const evaluations = mysqlTable("evaluations", {
  id: int("id").autoincrement().primaryKey(),
  
  // 關聯使用者
  userId: int("userId").notNull(),

  // 關聯客戶 (W4 新增 — nullable for backfill from existing rows)
  clientId: int("clientId"),

  // 基本資料
  date: varchar("date", { length: 20 }),
  clientName: varchar("clientName", { length: 100 }),
  birthday: varchar("birthday", { length: 20 }),
  occupation: varchar("occupation", { length: 100 }),
  dominantHand: varchar("dominantHand", { length: 10 }),
  
  // 目前症狀
  currentSymptomLocation: text("currentSymptomLocation"),
  currentSymptomTrigger: text("currentSymptomTrigger"),
  currentSymptomTreatment: text("currentSymptomTreatment"),
  
  // 過去症狀
  pastSymptomLocation: text("pastSymptomLocation"),
  pastSymptomTrigger: text("pastSymptomTrigger"),
  pastSymptomTreatment: text("pastSymptomTreatment"),
  
  // 最早症狀
  earliestSymptomLocation: text("earliestSymptomLocation"),
  earliestSymptomTrigger: text("earliestSymptomTrigger"),
  earliestSymptomTreatment: text("earliestSymptomTreatment"),
  
  // 病史
  injuryHistory: text("injuryHistory"),
  fractureHistory: text("fractureHistory"),
  surgeryHistory: text("surgeryHistory"),
  medicalDiagnosis: text("medicalDiagnosis"),
  medication: text("medication"),
  exerciseHabits: text("exerciseHabits"),
  sleepCondition: text("sleepCondition"),
  goalsAndExpectations: text("goalsAndExpectations"),
  
  // Moti Physio 報告（圖片:目前為 base64 data URL,longtext 容納 ~13MB)
  motiPhysioPage1: longtext("motiPhysioPage1"),
  motiPhysioPage2: longtext("motiPhysioPage2"),

  // Moti 12 項風險數值（JSON 格式儲存）
  motiRiskValues: json("motiRiskValues"),
  
  // 功能性動作檢測（JSON 格式儲存）
  functionalMovement: json("functionalMovement"),
  
  // 紅繩動力鍊檢測（JSON 格式儲存）
  redcordAssessment: json("redcordAssessment"),
  
  // RONFIC 評估結果（圖片:目前為 base64 data URL,longtext 容納 ~13MB)
  ronficMiniplusResult: longtext("ronficMiniplusResult"),
  ronficXimResult: longtext("ronficXimResult"),
  
  // 訓練計畫（JSON 格式儲存）
  trainingPlans: json("trainingPlans"),
  notes: text("notes"),
  
  // 評估照片（JSON 陣列儲存圖片 URL）
  photos: json("photos"),
  
  // 簽名（Data URL 或 S3 URL;SignaturePad 產生的 base64 通常 500KB+,需 longtext)
  clientSignature: longtext("clientSignature"),
  coachSignature: longtext("coachSignature"),

  // === W4 新增:整合評估文字類 ===
  chiefComplaint: text("chiefComplaint"),
  clientGoals: text("clientGoals"),
  plainExplanation: text("plainExplanation"),
  interventionNotes: text("interventionNotes"),

  // === W4 新增:整合評估結構化 ===
  topThreeIssues: json("topThreeIssues"),       // [{ title, description }, ...]
  recommendedPlan: json("recommendedPlan"),     // string[]
  interventionTypes: json("interventionTypes"), // Record<string, boolean>
  weekPlan: json("weekPlan"),                   // WeekPlan[]
  reassessDate: varchar("reassessDate", { length: 20 }),
  riskLevel: mysqlEnum("riskLevel", ["low", "mid", "high"]),

  // === W4 新增:客戶端視覺欄位 ===
  overallScore: int("overallScore"),
  subScores: json("subScores"),                 // { posture, movement, neuromuscular, composition: number }
  bodyRiskMap: json("bodyRiskMap"),             // { hotspots: BodyHotspot[], legend: ... }
  strengths: json("strengths"),                 // string[]
  inBodyData: json("inBodyData"),
  assignedTherapistId: varchar("assignedTherapistId", { length: 64 }),

  // === W4 新增:處方 (Week 5) ===
  prescriptions: json("prescriptions"),         // PrescriptionSelection[]

  // === W4 新增:分享連結 ===
  shareCode: varchar("shareCode", { length: 20 }),
  shareCodeCreatedAt: timestamp("shareCodeCreatedAt"),
  lastViewedByClient: timestamp("lastViewedByClient"),

  // 時間戳記
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;

/**
 * 評估表範本
 */
export const evaluationTemplates = mysqlTable("evaluationTemplates", {
  id: int("id").autoincrement().primaryKey(),
  
  // 關聯使用者（建立者）
  userId: int("userId").notNull(),
  
  // 範本基本資訊
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // 功能性動作檢測預設項目（JSON 格式）
  functionalMovement: json("functionalMovement"),
  
  // 紅繩動力鍊檢測預設項目（JSON 格式）
  redcordAssessment: json("redcordAssessment"),
  
  // 訓練計畫預設項目（JSON 格式）
  trainingPlans: json("trainingPlans"),
  
  // 時間戳記
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EvaluationTemplate = typeof evaluationTemplates.$inferSelect;
export type InsertEvaluationTemplate = typeof evaluationTemplates.$inferInsert;

/**
 * 客戶實體 (W4 新增). evaluations 可有多筆對應同一 client.id.
 * Plan v1.2 Section 3.2 — 從 evaluations.basicInfo 拆出.
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 建立此客戶檔案的治療師
  name: varchar("name", { length: 100 }).notNull(),
  birthdate: varchar("birthdate", { length: 20 }),
  gender: varchar("gender", { length: 16 }),
  height: int("height"),
  weight: int("weight"),
  phone: varchar("phone", { length: 32 }),
  primaryConcern: text("primaryConcern"),
  primaryTherapistId: varchar("primaryTherapistId", { length: 64 }),
  tenantId: varchar("tenantId", { length: 64 }), // Phase 2 多診所
  status: mysqlEnum("status", ["active", "pending", "completed"])
    .default("active")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * 處方知識庫 (W5 新增).
 * Mirror of shared/prescriptionKB.ts shape — admin CRUD via /prescriptions.
 */
export const prescriptionKB = mysqlTable("prescriptionKB", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // 建立者 (null = system seed)
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }),
  category: mysqlEnum("category", [
    "core",
    "hip",
    "shoulder",
    "balance",
    "mobility",
    "redcord",
  ]).notNull(),
  difficulty: mysqlEnum("difficulty", [
    "beginner",
    "intermediate",
    "advanced",
  ]).notNull(),
  defaultSets: int("defaultSets").notNull(),
  defaultReps: varchar("defaultReps", { length: 32 }).notNull(),
  videoUrl: varchar("videoUrl", { length: 500 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  thumbnailEmoji: varchar("thumbnailEmoji", { length: 16 }),
  targetAreas: json("targetAreas"), // string[]
  description: text("description"),
  tag: varchar("tag", { length: 64 }),
  cues: json("cues"), // string[]
  contraindications: json("contraindications"), // string[]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PrescriptionKBRow = typeof prescriptionKB.$inferSelect;
export type InsertPrescriptionKBRow = typeof prescriptionKB.$inferInsert;
