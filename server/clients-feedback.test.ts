import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    clinicId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("clients API", () => {
  it("clients router 存在,提供 list / history", () => {
    const caller = appRouter.createCaller(createAuthContext());
    expect(caller.clients).toBeDefined();
    expect(caller.clients.list).toBeDefined();
    expect(caller.clients.history).toBeDefined();
  });

  it("list 在無 DB 環境下回空陣列(不會崩)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.clients.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("history 須輸入 name", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    // @ts-expect-error - 故意傳錯
    await expect(caller.clients.history({})).rejects.toThrow();
  });
});

describe("feedback API", () => {
  it("feedback router 存在,提供 submit / listForEvaluation", () => {
    const caller = appRouter.createCaller(createAuthContext());
    expect(caller.feedback).toBeDefined();
    expect(caller.feedback.submit).toBeDefined();
    expect(caller.feedback.listForEvaluation).toBeDefined();
  });

  it("submit 必須 rating 在 1-5 範圍", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.feedback.submit({ shareCode: "x", rating: 6 }),
    ).rejects.toThrow();
    await expect(
      caller.feedback.submit({ shareCode: "x", rating: 0 }),
    ).rejects.toThrow();
  });

  it("submit 在無 DB 環境下回 { ok: false }", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.feedback.submit({
      shareCode: "nonexistent",
      rating: 5,
      comment: "great",
    });
    expect(result.ok).toBe(false);
  });

  it("submit comment 超過 1000 字會被拒", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.feedback.submit({
        shareCode: "x",
        rating: 5,
        comment: "a".repeat(1001),
      }),
    ).rejects.toThrow();
  });
});
