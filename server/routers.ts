import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createEvaluation,
  getEvaluationById,
  getEvaluationByShareCode,
  getEvaluationsForClinic,
  getEvaluationStats,
  updateEvaluation,
  setShareCode,
  incrementViewCount,
  deleteEvaluation,
  updateUserProfile,
  createTemplate,
  getTemplateById,
  getTemplatesForClinic,
  updateTemplate,
  deleteTemplate,
  upsertUser,
  getUserByOpenId,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { generateEvaluationPDF } from "./pdfGenerator";

// Auth bypass:
// - autoBypass: NODE_ENV === "development" AND OAUTH_SERVER_URL 未設定(保留 Hotfix 1 行為)
// - explicitBypass: ENABLE_DEV_AUTH_BYPASS === "true"(臨時開關,Week 3 接 OAuth 後移除)
async function devAuth(ctx: TrpcContext): Promise<User | null> {
  if (ctx.user) return ctx.user;

  const explicitBypass = process.env.ENABLE_DEV_AUTH_BYPASS === "true";
  const autoBypass =
    process.env.NODE_ENV === "development" &&
    !process.env.OAUTH_SERVER_URL;

  if (!explicitBypass && !autoBypass) return null;

  const openId = process.env.OWNER_OPEN_ID || "local-user";
  await upsertUser({
    openId,
    name: "Local Dev",
    email: "dev@local.test",
    loginMethod: "dev-bypass",
    role: "admin",
    clinicId: process.env.OWNER_CLINIC_ID || null,
  });
  return (await getUserByOpenId(openId)) ?? null;
}

// 專案層的 protectedProcedure 替代品。不動 _core/trpc.ts 裡的原版,
// 只在本檔案內取代使用。production 行為等價於原 protectedProcedure。
const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const user = await devAuth(ctx);
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({ ctx: { ...ctx, user } });
});

// 判斷使用者是否能存取該評估表(自己 / 同診所 / admin)
function canAccessEvaluation(
  evaluation: { userId: number; clinicId: string | null },
  user: { id: number; role: string; clinicId: string | null },
): boolean {
  if (user.role === "admin") return true;
  if (evaluation.userId === user.id) return true;
  if (
    evaluation.clinicId &&
    user.clinicId &&
    evaluation.clinicId === user.clinicId
  ) {
    return true;
  }
  return false;
}

// 評估表資料驗證 Schema
const evaluationInputSchema = z.object({
  date: z.string().optional(),
  clientName: z.string().optional(),
  birthday: z.string().optional(),
  occupation: z.string().optional(),
  dominantHand: z.string().optional(),
  
  currentSymptomLocation: z.string().optional(),
  currentSymptomTrigger: z.string().optional(),
  currentSymptomTreatment: z.string().optional(),
  
  pastSymptomLocation: z.string().optional(),
  pastSymptomTrigger: z.string().optional(),
  pastSymptomTreatment: z.string().optional(),
  
  earliestSymptomLocation: z.string().optional(),
  earliestSymptomTrigger: z.string().optional(),
  earliestSymptomTreatment: z.string().optional(),
  
  injuryHistory: z.string().optional(),
  fractureHistory: z.string().optional(),
  surgeryHistory: z.string().optional(),
  medicalDiagnosis: z.string().optional(),
  medication: z.string().optional(),
  exerciseHabits: z.string().optional(),
  sleepCondition: z.string().optional(),
  goalsAndExpectations: z.string().optional(),
  
  motiPhysioPage1: z.string().optional(),
  motiPhysioPage2: z.string().optional(),

  motiRiskValues: z.any().optional(),

  functionalMovement: z.any().optional(),
  redcordAssessment: z.any().optional(),
  
  ronficMiniplusResult: z.string().optional(),
  ronficXimResult: z.string().optional(),
  
  trainingPlans: z.any().optional(),
  notes: z.string().optional(),
  photos: z.any().optional(),

  prescriptions: z.any().optional(),

  clientSignature: z.string().optional(),
  coachSignature: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => devAuth(ctx)),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(100) }))
      .mutation(async ({ ctx, input }) => {
        const ok = await updateUserProfile(ctx.user.id, { name: input.name });
        return { success: ok };
      }),
  }),

  // 統計 API(治療師 dashboard)
  stats: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      return getEvaluationStats(ctx.user.id, ctx.user.clinicId ?? null);
    }),
  }),

  // 評估表 API
  evaluation: router({
    // 建立新評估表
    create: protectedProcedure
      .input(evaluationInputSchema)
      .mutation(async ({ ctx, input }) => {
        const id = await createEvaluation({
          userId: ctx.user.id,
          clinicId: ctx.user.clinicId ?? null,
          ...input,
        });
        return { id };
      }),

    // 取得單一評估表(同診所可見)
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const evaluation = await getEvaluationById(input.id);
        if (evaluation && !canAccessEvaluation(evaluation, ctx.user)) {
          return null;
        }
        return evaluation;
      }),

    // 取得使用者所屬診所的評估表(同 clinicId 共享;無 clinicId 則只見自己)
    list: protectedProcedure.query(async ({ ctx }) => {
      return getEvaluationsForClinic(ctx.user.id, ctx.user.clinicId ?? null);
    }),

    // 更新評估表
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: evaluationInputSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getEvaluationById(input.id);
        if (!existing || !canAccessEvaluation(existing, ctx.user)) {
          return { success: false, error: "評估表不存在或無權限" };
        }

        const success = await updateEvaluation(input.id, input.data);
        return { success };
      }),

    // 刪除評估表
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getEvaluationById(input.id);
        if (!existing || !canAccessEvaluation(existing, ctx.user)) {
          return { success: false, error: "評估表不存在或無權限" };
        }

        const success = await deleteEvaluation(input.id);
        return { success };
      }),

    // 產生或取得分享連結代碼(冪等)
    generateShareLink: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getEvaluationById(input.id);
        if (!existing || !canAccessEvaluation(existing, ctx.user)) {
          return { success: false as const, error: "評估表不存在或無權限" };
        }
        if (existing.shareCode) {
          return { success: true as const, shareCode: existing.shareCode };
        }
        const code = nanoid(20);
        const ok = await setShareCode(input.id, code);
        if (!ok) return { success: false as const, error: "建立失敗" };
        return { success: true as const, shareCode: code };
      }),
  }),

  // 客戶端公開報告 API(無認證,以 shareCode 存取)
  report: router({
    getByShareCode: publicProcedure
      .input(z.object({ shareCode: z.string().min(8).max(32) }))
      .query(async ({ input }) => {
        const evaluation = await getEvaluationByShareCode(input.shareCode);
        if (!evaluation) return null;

        // 非同步計數,不阻塞回應
        void incrementViewCount(evaluation.id);

        // 過濾敏感欄位:不回傳治療師備註、簽名圖、原始症狀文字等
        // 客戶端報告以 Moti 失衡數值 + 處方建議為主
        return {
          id: evaluation.id,
          date: evaluation.date,
          clientName: evaluation.clientName,
          motiPhysioPage1: evaluation.motiPhysioPage1,
          motiPhysioPage2: evaluation.motiPhysioPage2,
          motiRiskValues: evaluation.motiRiskValues,
          prescriptions: (evaluation as { prescriptions?: unknown })
            .prescriptions,
          sharedAt: evaluation.sharedAt,
        };
      }),
  }),

  // 檔案上傳 API
  upload: router({
    // 上傳圖片
    image: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        contentType: z.string().default("image/png"),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // 從 base64 轉換為 Buffer
          const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          
          // 產生唯一檔名
          const ext = input.filename.split(".").pop() || "png";
          const key = `evaluations/${ctx.user.id}/${nanoid()}.${ext}`;
          
          // 上傳到 S3
          const { url } = await storagePut(key, buffer, input.contentType);
          
          return { success: true, url };
        } catch (error) {
          console.error("[Upload] Failed to upload image:", error);
          return { success: false, error: "上傳失敗" };
        }
      }),

    // 上傳簽名
    signature: protectedProcedure
      .input(z.object({
        base64: z.string(),
        type: z.enum(["client", "coach"]),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // 從 base64 轉換為 Buffer
          const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          
          // 產生唯一檔名
          const key = `signatures/${ctx.user.id}/${input.type}-${nanoid()}.png`;
          
          // 上傳到 S3
          const { url } = await storagePut(key, buffer, "image/png");
          
          return { success: true, url };
        } catch (error) {
          console.error("[Upload] Failed to upload signature:", error);
          return { success: false, error: "上傳失敗" };
        }
      }),
  }),

  // PDF 生成 API
  pdf: router({
    generate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // 取得評估表資料
          const evaluation = await getEvaluationById(input.id);
          
          if (!evaluation) {
            return { success: false, error: "評估表不存在" };
          }
          
          // 確認權限
          if (evaluation.userId !== ctx.user.id && ctx.user.role !== 'admin') {
            return { success: false, error: "無權限存取此評估表" };
          }
          
          // 生成 PDF
          const pdfBuffer = await generateEvaluationPDF(evaluation);
          
          // 上傳到 S3
          const key = `pdfs/${ctx.user.id}/${evaluation.id}-${nanoid()}.pdf`;
          const { url } = await storagePut(key, pdfBuffer, "application/pdf");
          
          return { success: true, url };
        } catch (error) {
          console.error("[PDF] Failed to generate PDF:", error);
          return { success: false, error: "PDF 生成失敗" };
        }
      }),
  }),

  // 範本 API
  template: router({
    // 建立新範本
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "範本名稱不可為空"),
        description: z.string().optional(),
        functionalMovement: z.any().optional(),
        redcordAssessment: z.any().optional(),
        trainingPlans: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createTemplate({
          userId: ctx.user.id,
          clinicId: ctx.user.clinicId ?? null,
          ...input,
        });
        return { id };
      }),

    // 取得單一範本(同診所可見)
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const template = await getTemplateById(input.id);
        if (template && !canAccessEvaluation(template, ctx.user)) {
          return null;
        }
        return template;
      }),

    // 取得使用者所屬診所的範本
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTemplatesForClinic(ctx.user.id, ctx.user.clinicId ?? null);
    }),

    // 更新範本
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          functionalMovement: z.any().optional(),
          redcordAssessment: z.any().optional(),
          trainingPlans: z.any().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getTemplateById(input.id);
        if (!existing || !canAccessEvaluation(existing, ctx.user)) {
          return { success: false, error: "範本不存在或無權限" };
        }

        const success = await updateTemplate(input.id, input.data);
        return { success };
      }),

    // 刪除範本
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getTemplateById(input.id);
        if (!existing || !canAccessEvaluation(existing, ctx.user)) {
          return { success: false, error: "範本不存在或無權限" };
        }

        const success = await deleteTemplate(input.id);
        return { success };
      }),

    // 從現有評估表儲存為範本
    createFromEvaluation: protectedProcedure
      .input(z.object({
        evaluationId: z.number(),
        name: z.string().min(1, "範本名稱不可為空"),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const evaluation = await getEvaluationById(input.evaluationId);
        if (!evaluation || !canAccessEvaluation(evaluation, ctx.user)) {
          return { success: false, error: "無權限存取此評估表" };
        }

        const id = await createTemplate({
          userId: ctx.user.id,
          clinicId: ctx.user.clinicId ?? null,
          name: input.name,
          description: input.description,
          functionalMovement: evaluation.functionalMovement,
          redcordAssessment: evaluation.redcordAssessment,
          trainingPlans: evaluation.trainingPlans,
        });

        return { success: true, id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
