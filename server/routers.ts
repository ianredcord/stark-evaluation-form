import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createEvaluation,
  getEvaluationById,
  getEvaluationsByUserId,
  updateEvaluation,
  deleteEvaluation,
  createTemplate,
  getTemplateById,
  getTemplatesByUserId,
  updateTemplate,
  deleteTemplate,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { generateEvaluationPDF } from "./pdfGenerator";

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
  
  functionalMovement: z.any().optional(),
  redcordAssessment: z.any().optional(),
  
  ronficMiniplusResult: z.string().optional(),
  ronficXimResult: z.string().optional(),
  
  trainingPlans: z.any().optional(),
  notes: z.string().optional(),
  photos: z.any().optional(),
  
  clientSignature: z.string().optional(),
  coachSignature: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
          ...input,
        });
        return { id };
      }),

    // 取得單一評估表
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const evaluation = await getEvaluationById(input.id);
        
        // 確保只能存取自己的評估表（除非是管理員）
        if (evaluation && evaluation.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          return null;
        }
        
        return evaluation;
      }),

    // 取得使用者的所有評估表
    list: protectedProcedure.query(async ({ ctx }) => {
      return getEvaluationsByUserId(ctx.user.id);
    }),

    // 更新評估表
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: evaluationInputSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        // 確認評估表存在且屬於該使用者
        const existing = await getEvaluationById(input.id);
        if (!existing || (existing.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
          return { success: false, error: "評估表不存在或無權限" };
        }
        
        const success = await updateEvaluation(input.id, input.data);
        return { success };
      }),

    // 刪除評估表
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // 確認評估表存在且屬於該使用者
        const existing = await getEvaluationById(input.id);
        if (!existing || (existing.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
          return { success: false, error: "評估表不存在或無權限" };
        }
        
        const success = await deleteEvaluation(input.id);
        return { success };
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
          ...input,
        });
        return { id };
      }),

    // 取得單一範本
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const template = await getTemplateById(input.id);
        
        // 確保只能存取自己的範本（除非是管理員）
        if (template && template.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          return null;
        }
        
        return template;
      }),

    // 取得使用者的所有範本
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTemplatesByUserId(ctx.user.id);
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
        // 確認範本存在且屬於該使用者
        const existing = await getTemplateById(input.id);
        if (!existing || (existing.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
          return { success: false, error: "範本不存在或無權限" };
        }
        
        const success = await updateTemplate(input.id, input.data);
        return { success };
      }),

    // 刪除範本
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // 確認範本存在且屬於該使用者
        const existing = await getTemplateById(input.id);
        if (!existing || (existing.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
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
        // 取得評估表資料
        const evaluation = await getEvaluationById(input.evaluationId);
        
        if (!evaluation) {
          return { success: false, error: "評估表不存在" };
        }
        
        // 確認權限
        if (evaluation.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          return { success: false, error: "無權限存取此評估表" };
        }
        
        // 建立範本
        const id = await createTemplate({
          userId: ctx.user.id,
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
