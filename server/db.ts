import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, evaluations, InsertEvaluation, Evaluation, evaluationTemplates, InsertEvaluationTemplate, EvaluationTemplate } from "../drizzle/schema";
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

    const textFields = ["name", "email", "loginMethod"] as const;
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
