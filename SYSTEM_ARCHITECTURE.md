# Stark Evaluation System · 系統架構備忘錄

> 這份文件給新加入這個 Project 的 Claude.ai 對話、或新工程師看。
> 讀完這份 + MASTER_PLAN.md = 對專案有完整脈絡。

---

## 1. 專案速覽

- **名稱**:史塔克運動科學評估系統(Stark Evaluation System)
- **使用者**:史塔克診所 Ian(治療師)+ 未來其他診所 SaaS 訂閱者
- **產品定位**:從「治療師內部工具」轉型「SaaS + 客戶線上互動報告」
- **時程**:2026 年 5 月,4 週 MVP

## 2. 技術棧

```
Frontend
├── React 19 + TypeScript
├── Vite 7
├── Tailwind CSS v4
├── shadcn/ui (Radix UI primitives)
├── Wouter (router)
├── React Hook Form + Zod
├── Framer Motion
└── html2canvas + jsPDF (PDF,目前)

Backend
├── Node.js
├── Express
├── tRPC v11
├── Drizzle ORM
├── MySQL 8 (Docker 本地 / Railway production)
└── Puppeteer (PDF,Week 4 才啟用)

Infra
├── AWS S3 SDK (現未用,Week 3 改用 Cloudflare R2)
├── jose (JWT)
└── nanoid (shareCode 用)
```

## 3. 目錄結構(關鍵檔案)

```
stark-evaluation-form/
├── client/
│   ├── src/
│   │   ├── _core/           ← Manus 平台保留,不可動
│   │   ├── components/
│   │   │   └── pages/       ← Page1-7,Page8 將新增
│   │   ├── contexts/
│   │   │   └── EvaluationFormContext.tsx  ← 全表單狀態管理
│   │   ├── pages/
│   │   │   ├── Home.tsx           ← 首頁
│   │   │   ├── EvaluationForm.tsx ← 主流程
│   │   │   ├── Templates.tsx
│   │   │   ├── TemplateEdit.tsx
│   │   │   └── ComponentShowcase.tsx
│   │   ├── lib/
│   │   │   └── pdfGenerator.ts    ← PDF 渲染
│   │   ├── App.tsx
│   │   └── const.ts               ← getLoginUrl 等
├── server/
│   ├── _core/                ← Manus 平台保留,不可動
│   ├── routers.ts            ← tRPC routes + devAuth bypass
│   ├── db.ts                 ← Drizzle DB helper
│   ├── pdfGenerator.ts       ← Puppeteer PDF(目前未用)
│   ├── storage.ts            ← S3 helper
│   └── *.test.ts             ← Vitest 測試
├── shared/
│   ├── _core/                ← Manus 保留
│   ├── evaluation.ts         ← 核心型別 + 預設值 + MOTI 邏輯
│   ├── prescriptionKB.ts     ← 處方知識庫(Task 02 將新增)
│   ├── const.ts              ← Manus 保留
│   └── types.ts
├── drizzle/
│   ├── schema.ts             ← DB schema
│   ├── 0000-0004_*.sql       ← Migrations
│   └── meta/                 ← Drizzle 內部
├── MASTER_PLAN.md            ← 4 週路線圖
├── todo.md                   ← Manus 給的歷史 todo
├── package.json
├── drizzle.config.ts
└── .gitignore
```

## 4. 紅線(不可動)

```
server/_core/      ← Manus 平台基礎建設
client/src/_core/  ← Manus 平台 React hooks
shared/_core/      ← Manus 平台共用
shared/const.ts    ← Manus 保留(雖然不在 _core)
```

理由:這些是 Manus 平台給的程式碼,動了會破壞跟 Manus 雲端的相容性。
雖然我們離開了 Manus,但這些檔案的接口設計是合理的,
重寫成本 > 保留成本,所以維持「不動 _core」紀律。

## 5. 已完成的功能 (commit history)

```
6 個 commit (從新到舊):

5f69e1b fix(auth): allow explicit ENABLE_DEV_AUTH_BYPASS for production preview
        ← Hotfix 3,讓 production 也能 bypass(暫時)

f6e9816 docs: add 4-week SaaS MVP master plan + ignore .claude/
        ← MASTER_PLAN.md

ad77d97 fix(db): change image and signature columns from text to longtext
        ← Hotfix 2,6 個欄位 text → longtext

f828411 feat: add structured Moti 12-risk-item input on Page 2
        ← Task 01,12 項數值結構化輸入

427eb6d fix(auth): bypass OAuth in dev mode when OAUTH_SERVER_URL is empty
        ← Hotfix 1,本地開發 OAuth bypass

2a147eb Initial: Manus 原始版本
        ← Manus 平台原始程式碼
```

## 6. 核心型別速查

### shared/evaluation.ts 重要型別

```typescript
EvaluationFormData = {
  basicInfo: BasicInfo
  motiPhysio: MotiPhysioReport          ← 兩張圖片 URL/base64
  motiRiskValues: MotiRiskValues        ← Task 01 新增,12 項結構化
  functionalMovement: FunctionalMovement ← 9 項動作檢測
  redcord: RedcordAssessment            ← 21 項紅繩
  ronfic: RonficAssessment              ← MINIPLUS + XIM 圖片
  trainingPlan: TrainingPlan            ← 5 堂課 + 簽名
  prescriptions: PrescriptionSelection[] ← Task 02-04 將新增
}

MotiRiskKey = "hkaRight" | "hkaLeft" | "shoulderDiff" | "roundShoulder"
            | "lumbarLordosis" | "thoracicKyphosis" | "scoliosis"
            | "kneeFlexion" | "pelvisRotation" | "pelvisTilt"
            | "pelvisAnterior" | "headPosture"

calculateMotiLevel(value, thresholds) → "" | "maintain" | "warn" | "danger"
```

### drizzle/schema.ts 重要欄位

```typescript
evaluations table:
  - 基本資料(姓名/生日/慣用手/三層症狀)
  - injuryHistory / medicalDiagnosis 等病史
  - motiPhysioPage1 / motiPhysioPage2 (longtext, base64)
  - motiRiskValues (json) ← Task 01
  - functionalMovement (json)
  - redcordAssessment (json)
  - ronficMiniplusResult / ronficXimResult (longtext)
  - trainingPlans (json)
  - photos (json array)
  - clientSignature / coachSignature (longtext)
  - prescriptions (json) ← Task 02 將新增
```

## 7. tRPC routes

```
auth.me              ← publicProcedure,回 user 或 null(dev bypass)
evaluation.create    ← protectedProcedure(用 shadow 版,接 devAuth)
evaluation.get
evaluation.list
evaluation.update
evaluation.delete
upload.image         ← S3 上傳(目前前端沒呼叫)
upload.signature
pdf.generate         ← Puppeteer 後端(目前不可靠)
template.create
template.get / list / update / delete / createFromEvaluation
```

## 8. 開發紀律(每次動程式碼必遵守)

### 共用型別同步原則

改 `shared/evaluation.ts` 時,要同步檢查並更新:
1. `drizzle/schema.ts` ← DB 欄位
2. `server/routers.ts` ← evaluationInputSchema (zod)
3. 對應的 Page 元件 ← UI
4. `client/src/pages/EvaluationForm.tsx`:
   - useEffect 載入 mapping
   - convertFormDataToApiFormat
   - handleExportPDF 的 evaluationData 物件
5. `client/src/lib/pdfGenerator.ts` ← PDF 渲染
6. (若加 Context setter)`client/src/contexts/EvaluationFormContext.tsx`

### Claude Code 協作紀律

1. 動手前先讀檔案理解現況
2. 給「準備改動的檔案清單」+ 型別 snippet,等確認才動手
3. 不確定處先問,不憑感覺寫
4. 改完跑 `pnpm check` 確認型別
5. 不自動 commit,Ian 驗收 OK 才 commit
6. 不自動跑 `pnpm db:push`,告訴 Ian 手動跑
7. 改 schema 一定要產 migration,不要手改 SQL

### Git commit message 紀律

用 conventional commits:
- `feat:` 新功能
- `fix:` 修 bug
- `chore:` 雜事
- `refactor:` 重構
- `docs:` 文件

## 9. 環境變數總覽

### 本地 .env

```bash
DATABASE_URL=mysql://root:dev@localhost:3306/stark
JWT_SECRET=local-dev-secret-change-me
NODE_ENV=development
VITE_APP_ID=local-dev
OWNER_OPEN_ID=local-user
# 其他 OAUTH_SERVER_URL / BUILT_IN_FORGE_* 留空
```

### Railway production(見 RAILWAY_DEPLOYMENT.md)

```
DATABASE_URL=${{MySQL.MYSQL_URL}}
JWT_SECRET=<48-byte base64>
NODE_ENV=production
VITE_APP_ID=stark
OWNER_OPEN_ID=ianredcord
ENABLE_DEV_AUTH_BYPASS=true   ← Hotfix 3,Week 3 接 OAuth 後移除
```

## 10. 已知技術債(Phase 2 處理)

| # | 技術債 | 影響 | 計畫 |
|---|--------|------|------|
| 1 | base64 圖片塞 DB | DB 變肥、流量浪費 | Week 3 切 Cloudflare R2 |
| 2 | OAuth 用 dev bypass | 任何人有 URL 都能進 | Week 3 接 Google OAuth |
| 3 | PDF 用 html2canvas | 畫質低,中文渲染受限 | Week 4 改 Puppeteer |
| 4 | 沒多診所隔離 | SaaS 無法擴展 | Week 4 加 tenantId |
| 5 | Manus 內建 LLM (forgeApi) 失效 | AI 功能不能用 | Phase 2 接 Anthropic API |
| 6 | Moti OCR 手動輸入 | 治療師花 90 秒打字 | Phase 2 LLM Vision API |
| 7 | 沒有計費系統 | 不能收錢 | Phase 2 接 Stripe |

## 11. 重要外部連結

- GitHub repo: https://github.com/ianredcord/stark-evaluation-form
- Railway dashboard: https://railway.com (project: thriving-reflection)
- Production URL: https://stark-evaluation-form-production.up.railway.app
- Anthropic API docs (Phase 2 OCR): https://docs.claude.com

## 12. 對未來 Claude.ai 對話的建議

當你接手這個 Project,**第一句話請這樣回應 Ian**:

```
讀完 MASTER_PLAN.md + SYSTEM_ARCHITECTURE.md。
我看到的狀態是:
- 已完成:[列出已完成的 Hotfix/Task]
- 進行中:[根據 MASTER_PLAN 推測當前週次]
- 接下來該做:[根據路線圖建議下一個 Task]

請告訴我這次對話要做的事,我需要的話會請 Ian 補充上下文。
```

不要直接動手做事,先確認上下文。

文件結束。
