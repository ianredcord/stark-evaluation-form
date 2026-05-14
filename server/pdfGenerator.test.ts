import { describe, expect, it, vi } from "vitest";

// Mock puppeteer to avoid actual browser launch in tests
vi.mock("puppeteer", () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        setViewport: vi.fn().mockResolvedValue(undefined),
        setContent: vi.fn().mockResolvedValue(undefined),
        pdf: vi.fn().mockResolvedValue(Buffer.from("mock-pdf-content")),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

import { generateEvaluationPDF } from "./pdfGenerator";
import type { Evaluation } from "../drizzle/schema";

describe("PDF Generator", () => {
  const mockEvaluation: Partial<Evaluation> = {
    id: 1,
    userId: 1,
    clientName: "測試客戶",
    birthday: "1990-01-01",
    occupation: "軟體工程師",
    dominantHand: "right",
    date: "2024-12-24",
    currentSymptomLocation: "右肩疼痛",
    currentSymptomTrigger: "舉手過頭時疼痛",
    currentSymptomTreatment: "物理治療",
    pastSymptomLocation: "下背痛",
    pastSymptomTrigger: "久坐",
    pastSymptomTreatment: "按摩",
    earliestSymptomLocation: null,
    earliestSymptomTrigger: null,
    earliestSymptomTreatment: null,
    injuryHistory: "無",
    fractureHistory: "無",
    surgeryHistory: "無",
    medicalDiagnosis: "肩夾擠症候群",
    medication: "無",
    exerciseHabits: "每週健身 3 次",
    sleepCondition: "良好",
    goalsAndExpectations: "改善肩膀活動度",
    motiPhysioPage1: null,
    motiPhysioPage2: null,
    functionalMovement: {
      neck_flexion: { performance: "A", factors: ["A"], condition: "正常" },
      neck_extension: { performance: "B", factors: ["B"], condition: "輕微受限" },
    },
    redcordAssessment: {
      SPL: { R: { score: 2, workload: 3 }, L: { score: 2, workload: 3 } },
      SB: { R: { score: 1, workload: 2 }, L: { score: 1, workload: 2 } },
    },
    ronficMiniplusResult: null,
    ronficXimResult: null,
    trainingPlans: [
      { session: "第 1 堂", content: "肩關節活動度訓練" },
      { session: "第 2 堂", content: "核心穩定訓練" },
    ],
    notes: "客戶配合度良好",
    photos: [],
    clientSignature: null,
    coachSignature: null,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should generate PDF buffer from evaluation data", async () => {
    const result = await generateEvaluationPDF(mockEvaluation as Evaluation);
    
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should handle evaluation with minimal data", async () => {
    const minimalEvaluation: Partial<Evaluation> = {
      id: 2,
      userId: 1,
      clientName: "簡易測試",
      date: "2024-12-24",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await generateEvaluationPDF(minimalEvaluation as Evaluation);
    
    expect(result).toBeInstanceOf(Buffer);
  });

  it("should handle evaluation with empty arrays", async () => {
    const emptyArraysEvaluation: Partial<Evaluation> = {
      id: 3,
      userId: 1,
      clientName: "空陣列測試",
      date: "2024-12-24",
      trainingPlans: [],
      photos: [],
      functionalMovement: {},
      redcordAssessment: {},
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await generateEvaluationPDF(emptyArraysEvaluation as Evaluation);
    
    expect(result).toBeInstanceOf(Buffer);
  });

  it("should handle evaluation with all fields populated", async () => {
    const fullEvaluation: Partial<Evaluation> = {
      ...mockEvaluation,
      motiPhysioPage1: "https://example.com/image1.jpg",
      motiPhysioPage2: "https://example.com/image2.jpg",
      ronficMiniplusResult: "https://example.com/ronfic1.jpg",
      ronficXimResult: "https://example.com/ronfic2.jpg",
      clientSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      coachSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    };

    const result = await generateEvaluationPDF(fullEvaluation as Evaluation);
    
    expect(result).toBeInstanceOf(Buffer);
  });
});
