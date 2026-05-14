import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 評估表主表
 */
export const evaluations = mysqlTable("evaluations", {
  id: int("id").autoincrement().primaryKey(),
  
  // 關聯使用者
  userId: int("userId").notNull(),
  
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
  
  // Moti Physio 報告（圖片 URL）
  motiPhysioPage1: text("motiPhysioPage1"),
  motiPhysioPage2: text("motiPhysioPage2"),
  
  // 功能性動作檢測（JSON 格式儲存）
  functionalMovement: json("functionalMovement"),
  
  // 紅繩動力鍊檢測（JSON 格式儲存）
  redcordAssessment: json("redcordAssessment"),
  
  // RONFIC 評估結果（圖片 URL）
  ronficMiniplusResult: text("ronficMiniplusResult"),
  ronficXimResult: text("ronficXimResult"),
  
  // 訓練計畫（JSON 格式儲存）
  trainingPlans: json("trainingPlans"),
  notes: text("notes"),
  
  // 評估照片（JSON 陣列儲存圖片 URL）
  photos: json("photos"),
  
  // 簽名（Data URL 或 S3 URL）
  clientSignature: text("clientSignature"),
  coachSignature: text("coachSignature"),
  
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
