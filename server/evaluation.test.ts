import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./auth/context";

// Mock database functions
vi.mock("./db", () => ({
  createEvaluation: vi.fn().mockResolvedValue(1),
  getEvaluationById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    date: "2024-01-01",
    clientName: "測試客戶",
    birthday: "1990-01-01",
    occupation: "工程師",
    dominantHand: "right",
    currentSymptomLocation: "肩膀",
    currentSymptomTrigger: "舉重",
    currentSymptomTreatment: "物理治療",
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
    exerciseHabits: "每週運動3次",
    sleepCondition: "良好",
    goalsAndExpectations: "改善肩膀疼痛",
    motiPhysioPage1: null,
    motiPhysioPage2: null,
    functionalMovement: {},
    redcordAssessment: {},
    ronficMiniplusResult: null,
    ronficXimResult: null,
    trainingPlans: [],
    notes: "",
    photos: [],
    clientSignature: null,
    coachSignature: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getEvaluationsByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      date: "2024-01-01",
      clientName: "測試客戶",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  updateEvaluation: vi.fn().mockResolvedValue(true),
  deleteEvaluation: vi.fn().mockResolvedValue(true),
}));

// Mock storage functions
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://example.com/test.png" }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("evaluation.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new evaluation for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.create({
      date: "2024-01-01",
      clientName: "新客戶",
      birthday: "1990-01-01",
      occupation: "設計師",
      dominantHand: "right",
    });

    expect(result).toEqual({ id: 1 });
  });

  it("throws error for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.evaluation.create({
        date: "2024-01-01",
        clientName: "新客戶",
      })
    ).rejects.toThrow();
  });
});

describe("evaluation.get", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns evaluation for owner", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.get({ id: 1 });

    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.clientName).toBe("測試客戶");
  });

  it("returns null for non-owner non-admin", async () => {
    const ctx = createAuthContext();
    ctx.user!.id = 2; // Different user
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.get({ id: 1 });

    expect(result).toBeNull();
  });
});

describe("evaluation.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns list of evaluations for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("evaluation.update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates evaluation for owner", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.update({
      id: 1,
      data: {
        clientName: "更新後的名稱",
      },
    });

    expect(result.success).toBe(true);
  });

  it("returns error for non-owner", async () => {
    const ctx = createAuthContext();
    ctx.user!.id = 2; // Different user
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.update({
      id: 1,
      data: {
        clientName: "更新後的名稱",
      },
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("evaluation.delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes evaluation for owner", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.delete({ id: 1 });

    expect(result.success).toBe(true);
  });

  it("returns error for non-owner", async () => {
    const ctx = createAuthContext();
    ctx.user!.id = 2; // Different user
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.delete({ id: 1 });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("upload.image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads image and returns URL", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Simple base64 encoded 1x1 pixel PNG
    const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.upload.image({
      base64,
      filename: "test.png",
      contentType: "image/png",
    });

    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
  });
});

describe("upload.signature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads client signature", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.upload.signature({
      base64,
      type: "client",
    });

    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
  });

  it("uploads coach signature", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.upload.signature({
      base64,
      type: "coach",
    });

    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
  });
});
