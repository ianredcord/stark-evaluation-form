import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mockEvaluation = {
  id: 42,
  userId: 1,
  clinicId: null,
  date: "2024-05-15",
  clientName: "客戶 A",
  birthday: "1990-01-01",
  occupation: "工程師",
  dominantHand: "right",
  motiPhysioPage1: null,
  motiPhysioPage2: null,
  motiRiskValues: {
    overallRiskIndex: 45,
    roundShoulder: { value: 20, level: "danger" },
    headPosture: { value: 18, level: "warn" },
  },
  functionalMovement: {},
  redcordAssessment: {},
  trainingPlans: [],
  notes: "治療師備註不應傳給客戶",
  photos: [],
  prescriptions: [
    {
      riskItemKey: "roundShoulder",
      level: "danger",
      selectedFasciaIds: ["fascia-rs-danger-pec-minor"],
      selectedAcupointIds: [],
      selectedExerciseIds: [],
      selectedDeviceIds: [],
      customNotes: "",
    },
  ],
  clientSignature: null,
  coachSignature: null,
  shareCode: "abc123def456ghi789jk",
  sharedAt: new Date(),
  viewCount: 3,
  currentSymptomLocation: "肩膀",
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
  ronficMiniplusResult: null,
  ronficXimResult: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("./db", () => ({
  createEvaluation: vi.fn().mockResolvedValue(1),
  getEvaluationById: vi.fn(async (id: number) =>
    id === mockEvaluation.id ? mockEvaluation : null,
  ),
  getEvaluationsByUserId: vi.fn().mockResolvedValue([]),
  getEvaluationsForClinic: vi.fn().mockResolvedValue([]),
  getEvaluationByShareCode: vi.fn(async (code: string) =>
    code === mockEvaluation.shareCode ? mockEvaluation : null,
  ),
  setShareCode: vi.fn().mockResolvedValue(true),
  incrementViewCount: vi.fn().mockResolvedValue(undefined),
  updateEvaluation: vi.fn().mockResolvedValue(true),
  deleteEvaluation: vi.fn().mockResolvedValue(true),
  createTemplate: vi.fn().mockResolvedValue(1),
  getTemplateById: vi.fn().mockResolvedValue(null),
  getTemplatesByUserId: vi.fn().mockResolvedValue([]),
  getTemplatesForClinic: vi.fn().mockResolvedValue([]),
  updateTemplate: vi.fn().mockResolvedValue(true),
  deleteTemplate: vi.fn().mockResolvedValue(true),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
}));

import * as dbModule from "./db";
const incrementViewCountMock = vi.mocked(dbModule.incrementViewCount);
const setShareCodeMock = vi.mocked(dbModule.setShareCode);

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(overrides: Partial<{ id: number; clinicId: string | null; role: "user" | "admin" }> = {}): TrpcContext {
  return {
    user: {
      id: overrides.id ?? 1,
      openId: "test-user",
      email: "test@test.com",
      name: "Test",
      loginMethod: "manus",
      role: overrides.role ?? "user",
      clinicId: overrides.clinicId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("report.getByShareCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns filtered evaluation for valid shareCode (no auth required)", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.report.getByShareCode({
      shareCode: mockEvaluation.shareCode,
    });

    expect(result).not.toBeNull();
    expect(result?.id).toBe(42);
    expect(result?.clientName).toBe("客戶 A");
    expect(result?.motiRiskValues).toBeDefined();
    expect(result?.prescriptions).toBeDefined();
    // 不應外洩治療師備註
    expect((result as Record<string, unknown>)?.notes).toBeUndefined();
    // 不應外洩簽名
    expect((result as Record<string, unknown>)?.clientSignature).toBeUndefined();
    // 不應外洩症狀文字
    expect((result as Record<string, unknown>)?.currentSymptomLocation).toBeUndefined();
  });

  it("increments view count on access", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.report.getByShareCode({
      shareCode: mockEvaluation.shareCode,
    });

    // 非同步 increment 被觸發
    expect(incrementViewCountMock).toHaveBeenCalledWith(mockEvaluation.id);
  });

  it("returns null for invalid shareCode", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.report.getByShareCode({
      shareCode: "nonexistent000000000",
    });

    expect(result).toBeNull();
  });

  it("rejects too-short shareCode at validation layer", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.report.getByShareCode({ shareCode: "short" }),
    ).rejects.toThrow();
  });
});

describe("evaluation.generateShareLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing shareCode without regenerating (idempotent)", async () => {
    const ctx = createAuthContext({ id: 1 });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.generateShareLink({ id: 42 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.shareCode).toBe(mockEvaluation.shareCode);
    }
    expect(setShareCodeMock).not.toHaveBeenCalled();
  });

  it("rejects user from different clinic", async () => {
    const ctx = createAuthContext({ id: 999, clinicId: "other-clinic" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.generateShareLink({ id: 42 });

    expect(result.success).toBe(false);
  });

  it("allows admin from any user", async () => {
    const ctx = createAuthContext({ id: 999, role: "admin" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.generateShareLink({ id: 42 });

    expect(result.success).toBe(true);
  });
});
