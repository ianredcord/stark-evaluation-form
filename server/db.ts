import { desc, eq, or, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, evaluations, InsertEvaluation, Evaluation, evaluationTemplates, InsertEvaluationTemplate, EvaluationTemplate, evaluationFeedbacks, EvaluationFeedback, InsertEvaluationFeedback } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "clinicId"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ 評估表 CRUD 函數 ============

/**
 * 建立新評估表
 */
export async function createEvaluation(data: InsertEvaluation): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create evaluation: database not available");
    return null;
  }

  try {
    const result = await db.insert(evaluations).values(data);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create evaluation:", error);
    throw error;
  }
}

/**
 * 根據 ID 取得評估表
 */
export async function getEvaluationById(id: number): Promise<Evaluation | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get evaluation: database not available");
    return null;
  }

  try {
    const result = await db.select().from(evaluations).where(eq(evaluations.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get evaluation:", error);
    throw error;
  }
}

/**
 * 取得使用者的所有評估表
 */
export async function getEvaluationsByUserId(userId: number): Promise<Evaluation[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get evaluations: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(evaluations)
      .where(eq(evaluations.userId, userId))
      .orderBy(desc(evaluations.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get evaluations:", error);
    throw error;
  }
}

/**
 * 取得使用者所屬診所的所有評估表(同 clinicId)。若 clinicId 為 null,
 * 則 fallback 到只看自己的評估表。
 */
export async function getEvaluationsForClinic(
  userId: number,
  clinicId: string | null,
): Promise<Evaluation[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const where = clinicId
      ? or(eq(evaluations.userId, userId), eq(evaluations.clinicId, clinicId))
      : eq(evaluations.userId, userId);
    const result = await db
      .select()
      .from(evaluations)
      .where(where)
      .orderBy(desc(evaluations.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get clinic evaluations:", error);
    return [];
  }
}

/**
 * 同診所範本(自己的 + 同 clinicId 共享的)
 */
export async function getTemplatesForClinic(
  userId: number,
  clinicId: string | null,
): Promise<EvaluationTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const where = clinicId
      ? or(
          eq(evaluationTemplates.userId, userId),
          eq(evaluationTemplates.clinicId, clinicId),
        )
      : eq(evaluationTemplates.userId, userId);
    const result = await db
      .select()
      .from(evaluationTemplates)
      .where(where)
      .orderBy(desc(evaluationTemplates.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get clinic templates:", error);
    return [];
  }
}

/**
 * 評估統計 — 給治療師 dashboard 用
 * 回傳:總數、已分享數、總瀏覽次數、本月新增、最近 7 日趨勢、最近活動
 */
export interface EvaluationStats {
  total: number;
  shared: number;
  totalViews: number;
  thisMonth: number;
  templates: number;
  uniqueClients: number;
  feedbackCount: number;
  feedbackAverage: number;
  // 最近 7 日 [{date: 'YYYY-MM-DD', count: number}]
  recentDays: Array<{ date: string; count: number }>;
  // 最近 5 筆評估
  recentEvaluations: Array<{
    id: number;
    clientName: string | null;
    date: string | null;
    viewCount: number;
    hasShareCode: boolean;
    isOwn: boolean;
    createdAt: Date;
  }>;
}

export async function getEvaluationStats(
  userId: number,
  clinicId: string | null,
): Promise<EvaluationStats> {
  const empty: EvaluationStats = {
    total: 0,
    shared: 0,
    totalViews: 0,
    thisMonth: 0,
    templates: 0,
    uniqueClients: 0,
    feedbackCount: 0,
    feedbackAverage: 0,
    recentDays: buildLast7DaysSkeleton(),
    recentEvaluations: [],
  };

  const db = await getDb();
  if (!db) return empty;

  try {
    const [evals, templates, feedback] = await Promise.all([
      getEvaluationsForClinic(userId, clinicId),
      getTemplatesForClinic(userId, clinicId),
      getFeedbackSummary(userId, clinicId),
    ]);
    const uniqueClients = new Set(
      evals.map((e) => (e.clientName || "").trim()).filter(Boolean),
    ).size;

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const recentDays = buildLast7DaysSkeleton();
    const dayIndex = new Map(recentDays.map((d, i) => [d.date, i]));

    let shared = 0;
    let totalViews = 0;
    let thisMonth = 0;
    evals.forEach((e) => {
      if (e.shareCode) shared += 1;
      totalViews += e.viewCount ?? 0;
      if (e.createdAt && new Date(e.createdAt) >= thisMonthStart) thisMonth += 1;
      const key = toISODate(e.createdAt);
      const idx = dayIndex.get(key);
      if (idx !== undefined) recentDays[idx].count += 1;
    });

    const recentEvaluations = evals.slice(0, 5).map((e) => ({
      id: e.id,
      clientName: e.clientName,
      date: e.date,
      viewCount: e.viewCount ?? 0,
      hasShareCode: Boolean(e.shareCode),
      isOwn: e.userId === userId,
      createdAt: e.createdAt,
    }));

    return {
      total: evals.length,
      shared,
      totalViews,
      thisMonth,
      templates: templates.length,
      uniqueClients,
      feedbackCount: feedback.count,
      feedbackAverage: feedback.average,
      recentDays,
      recentEvaluations,
    };
  } catch (error) {
    console.error("[Database] Failed to compute stats:", error);
    return empty;
  }
}

function toISODate(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function buildLast7DaysSkeleton(): Array<{ date: string; count: number }> {
  const result: Array<{ date: string; count: number }> = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  return result;
}

/**
 * 客戶列表(以 clientName 分群)
 * 從 evaluations 萃取出唯一客戶,每位帶最後評估日期、總評估數、最後分享狀態
 */
export interface ClientSummary {
  name: string;
  birthday: string | null;
  occupation: string | null;
  evaluationCount: number;
  lastEvaluationDate: string | null;
  lastEvaluationId: number;
  hasShareCode: boolean;
  totalViews: number;
  lastUpdatedAt: Date;
}

export async function getClientsForClinic(
  userId: number,
  clinicId: string | null,
): Promise<ClientSummary[]> {
  const all = await getEvaluationsForClinic(userId, clinicId);
  const map = new Map<string, ClientSummary>();
  for (const e of all) {
    const name = (e.clientName || "").trim();
    if (!name) continue;
    const existing = map.get(name);
    if (!existing) {
      map.set(name, {
        name,
        birthday: e.birthday,
        occupation: e.occupation,
        evaluationCount: 1,
        lastEvaluationDate: e.date,
        lastEvaluationId: e.id,
        hasShareCode: Boolean(e.shareCode),
        totalViews: e.viewCount ?? 0,
        lastUpdatedAt: e.updatedAt ?? e.createdAt,
      });
    } else {
      existing.evaluationCount += 1;
      existing.totalViews += e.viewCount ?? 0;
      // 因為 getEvaluationsForClinic 已按 createdAt desc 排序,第一筆即為最新
      // 後面遇到的視為舊資料,只補生日/職業若先前為空
      if (!existing.birthday && e.birthday) existing.birthday = e.birthday;
      if (!existing.occupation && e.occupation) existing.occupation = e.occupation;
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.lastUpdatedAt.getTime() - a.lastUpdatedAt.getTime(),
  );
}

/**
 * 取得特定客戶的完整評估歷史(同診所範圍)
 */
export async function getClientHistory(
  userId: number,
  clinicId: string | null,
  clientName: string,
): Promise<Evaluation[]> {
  const all = await getEvaluationsForClinic(userId, clinicId);
  return all.filter((e) => (e.clientName || "").trim() === clientName.trim());
}

/**
 * 提交客戶端回饋(透過 shareCode 公開提交)
 */
export async function createFeedback(
  shareCode: string,
  rating: number,
  comment: string | null,
): Promise<{ ok: boolean; evaluationId?: number }> {
  const db = await getDb();
  if (!db) return { ok: false };
  if (rating < 1 || rating > 5) return { ok: false };
  try {
    const evalRow = await getEvaluationByShareCode(shareCode);
    if (!evalRow) return { ok: false };
    await db.insert(evaluationFeedbacks).values({
      evaluationId: evalRow.id,
      rating,
      comment: comment?.slice(0, 1000) || null,
    } satisfies InsertEvaluationFeedback);
    return { ok: true, evaluationId: evalRow.id };
  } catch (error) {
    console.error("[Database] Failed to create feedback:", error);
    return { ok: false };
  }
}

/**
 * 取得單一評估的所有回饋
 */
export async function getFeedbacksForEvaluation(
  evaluationId: number,
): Promise<EvaluationFeedback[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(evaluationFeedbacks)
      .where(eq(evaluationFeedbacks.evaluationId, evaluationId))
      .orderBy(desc(evaluationFeedbacks.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get feedbacks:", error);
    return [];
  }
}

/**
 * 治療師回饋彙總(平均分、未讀數、最近 5 則)
 */
export interface FeedbackSummary {
  count: number;
  average: number;
  recent: Array<{
    id: number;
    evaluationId: number;
    clientName: string | null;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }>;
}

export async function getFeedbackSummary(
  userId: number,
  clinicId: string | null,
): Promise<FeedbackSummary> {
  const empty: FeedbackSummary = { count: 0, average: 0, recent: [] };
  const db = await getDb();
  if (!db) return empty;

  try {
    const evals = await getEvaluationsForClinic(userId, clinicId);
    if (evals.length === 0) return empty;

    const idMap = new Map(evals.map((e) => [e.id, e.clientName]));
    const ids = evals.map((e) => e.id);

    const feedbacks = await db
      .select()
      .from(evaluationFeedbacks)
      .where(inArray(evaluationFeedbacks.evaluationId, ids))
      .orderBy(desc(evaluationFeedbacks.createdAt));

    if (feedbacks.length === 0) return empty;

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const avg = sum / feedbacks.length;

    return {
      count: feedbacks.length,
      average: Math.round(avg * 10) / 10,
      recent: feedbacks.slice(0, 5).map((f) => ({
        id: f.id,
        evaluationId: f.evaluationId,
        clientName: idMap.get(f.evaluationId) ?? null,
        rating: f.rating,
        comment: f.comment,
        createdAt: f.createdAt,
      })),
    };
  } catch (error) {
    console.error("[Database] Failed to summarize feedback:", error);
    return empty;
  }
}

/**
 * 更新使用者個人資料(名稱等)
 */
export async function updateUserProfile(
  userId: number,
  data: { name?: string | null },
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.update(users).set(data).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update user profile:", error);
    return false;
  }
}

/**
 * 更新評估表
 */
export async function updateEvaluation(
  id: number,
  data: Partial<InsertEvaluation>
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update evaluation: database not available");
    return false;
  }

  try {
    await db.update(evaluations).set(data).where(eq(evaluations.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update evaluation:", error);
    throw error;
  }
}

/**
 * 以 shareCode 取得評估表(供客戶端公開報告使用,不含敏感欄位過濾)
 */
export async function getEvaluationByShareCode(
  shareCode: string,
): Promise<Evaluation | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select()
      .from(evaluations)
      .where(eq(evaluations.shareCode, shareCode))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get evaluation by shareCode:", error);
    return null;
  }
}

/**
 * 為評估表建立(或回傳既有)分享代碼
 */
export async function setShareCode(
  id: number,
  shareCode: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .update(evaluations)
      .set({ shareCode, sharedAt: new Date() })
      .where(eq(evaluations.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to set shareCode:", error);
    return false;
  }
}

/**
 * 客戶端訪問計數+1
 */
export async function incrementViewCount(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db
      .update(evaluations)
      .set({ viewCount: sql`${evaluations.viewCount} + 1` })
      .where(eq(evaluations.id, id));
  } catch (error) {
    console.error("[Database] Failed to increment viewCount:", error);
  }
}

/**
 * 刪除評估表
 */
export async function deleteEvaluation(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete evaluation: database not available");
    return false;
  }

  try {
    await db.delete(evaluations).where(eq(evaluations.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete evaluation:", error);
    throw error;
  }
}

// ============ 範本 CRUD 函數 ============

/**
 * 建立新範本
 */
export async function createTemplate(data: InsertEvaluationTemplate): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create template: database not available");
    return null;
  }

  try {
    const result = await db.insert(evaluationTemplates).values(data);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create template:", error);
    throw error;
  }
}

/**
 * 根據 ID 取得範本
 */
export async function getTemplateById(id: number): Promise<EvaluationTemplate | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get template: database not available");
    return null;
  }

  try {
    const result = await db.select().from(evaluationTemplates).where(eq(evaluationTemplates.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get template:", error);
    throw error;
  }
}

/**
 * 取得使用者的所有範本
 */
export async function getTemplatesByUserId(userId: number): Promise<EvaluationTemplate[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get templates: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(evaluationTemplates)
      .where(eq(evaluationTemplates.userId, userId))
      .orderBy(desc(evaluationTemplates.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get templates:", error);
    throw error;
  }
}

/**
 * 更新範本
 */
export async function updateTemplate(
  id: number,
  data: Partial<InsertEvaluationTemplate>
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update template: database not available");
    return false;
  }

  try {
    await db.update(evaluationTemplates).set(data).where(eq(evaluationTemplates.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update template:", error);
    throw error;
  }
}

/**
 * 刪除範本
 */
export async function deleteTemplate(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete template: database not available");
    return false;
  }

  try {
    await db.delete(evaluationTemplates).where(eq(evaluationTemplates.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete template:", error);
    throw error;
  }
}
