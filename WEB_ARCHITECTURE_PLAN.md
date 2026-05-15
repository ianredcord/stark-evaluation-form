# Stark Web Architecture Plan · 網頁架構重構計畫

> 這份文件是史塔克評估系統「**從填表單模式 → 單頁工作台模式**」的完整重構計畫。
> 它取代原本 MASTER_PLAN.md 對 Week 1-6 的安排,把今天定下來的三張設計北極星
> (治療師端 mockup v3 + 客戶端報告 v2 + 使用者流程圖 v1)整合進開發路線。

> **文件版本**:v1.2
> **建立日期**:2026/05/15(v1.0)/ 2026/05/15(v1.1, v1.2)
> **作者**:Ian + Claude(v1.0)+ Claude Code 補強(v1.1, v1.2)
> **下次更新**:每週 review,有重大變動時改版本號
>
> **v1.2 變更**:
> - **Section 4.1** 字體載入從 CDN `@import url(...)` 改為
>   `@fontsource/*` npm 套件 self-host(與既有 Geist 字體一致)
>   — Claude Code Day 0 環境清點發現
>
> **v1.1 變更**:
> - **Section 4.1** Tailwind 寫法從 v3 風格(tokens.css + tailwind.config.ts)
>   修正為 v4 native 寫法(`@theme inline` in app.css)— Claude Code 提出
> - **Section 3.3** Migration 拆細(0005-0006 → 0005-0007),
>   後續 migration 全部 +1 — Claude Code 建議採納
> - **Section 6 Week 1** 新增 Day 0(環境清點 + branch 切換 + 文件搬移),
>   原 Day 1-5 順延為 Day 1-5(時程不變)— Claude Code 建議採納
> - **Section 9** 加入 Day 0 onboarding 模板

---

## 目錄

- [0. 文件目的與使用方式](#0-文件目的與使用方式)
- [1. 架構決策摘要](#1-架構決策摘要)
- [2. 前端架構決策](#2-前端架構決策)
- [3. 後端 Schema 擴充清單](#3-後端-schema-擴充清單)
- [4. 設計系統建立](#4-設計系統建立)
- [5. 頁面實作順序](#5-頁面實作順序)
- [6. 6 週週次拆解](#6-6-週週次拆解)
- [7. 驗收標準](#7-驗收標準)
- [8. 風險與取捨清單](#8-風險與取捨清單)
- [9. 給 Claude Code 的開工指令模板](#9-給-claude-code-的開工指令模板)

---

## 0. 文件目的與使用方式

### 0.1 這份文件解決什麼問題

在 2026/05/15 的一整天設計討論中,我們完成了三件大事:

1. 跑了兩份 Perplexity research(SaaS UI/UX + 給非專業用戶的健康評估報告設計)
2. 定稿三張設計北極星(治療師端 mockup v3、客戶端報告 v2、使用者流程圖 v1)
3. 決定**整個 web 架構先重做、處方系統最後做**

但這些決策**還沒有對應到具體的開發步驟**。如果直接開工,Claude Code 會憑感覺寫,
品質不可控、進度不可預測、最後做出來跟設計圖差距大。

這份文件解決三件事:
- **方向問題**:每週要做什麼、為什麼這個順序
- **執行問題**:每個任務要動哪些檔案、改哪些 schema
- **驗收問題**:每週結束時應該長什麼樣、什麼算「做完」

### 0.2 誰看這份文件、什麼時候看

| 受眾 | 用途 | 怎麼看 |
|------|------|--------|
| Ian(自己) | 規劃週次任務、review 進度 | 從頭讀過一次,之後 weekly review |
| Claude Code | 接到開發指令時的上下文 | 看 Section 6 + 9 |
| 未來的 Claude.ai 對話 | 接手 project 時的快速 onboard | 看 Section 1 + 6 |
| 投資人 / 合作診所 | 看「你們有沒有 plan」 | 看 Section 1 + 6(摘要版) |

### 0.3 跟其他文件的關係

```
SYSTEM_ARCHITECTURE.md     ← 系統現狀(技術棧、目錄、紅線)
MASTER_PLAN.md              ← 4 週 MVP 路線圖(已過時,被本文取代)
WEB_ARCHITECTURE_PLAN.md    ← 本文件(6 週重構計畫,設計北極星實作)
RAILWAY_DEPLOYMENT.md       ← Production 部署
DESIGN_THERAPIST_v3.png     ← 治療師端設計圖
DESIGN_CLIENT_v2.png        ← 客戶端設計圖
USER_FLOW_v1.png            ← 使用者流程圖
```

讀順序建議:第一次接手 → SYSTEM_ARCHITECTURE.md → 本文件 → 看設計圖。

---

## 1. 架構決策摘要

### 1.1 為什麼從填表單改成單頁工作台

**舊架構(現狀)**:

```
治療師打開 → /evaluation → Page 1 基本資料
                         → Page 2 姿勢
                         → Page 3 功能動作
                         → Page 4 紅繩
                         → Page 5 體組成
                         → Page 6 訓練計畫
                         → Page 7 簽名
                         → 下載 PDF
```

每個 Page 是一個獨立頁面,治療師要**順序點下去**。

**問題**:
1. **沒有總覽** — 治療師看不到「這個客戶整體狀況」
2. **跳轉成本高** — 想改 Page 2 的數值要從 Page 5 一路回退
3. **看起來像 Google 表單** — 完全沒有 SaaS 產品感
4. **客戶看到的東西跟治療師一樣** — 缺乏雙受眾差異化

**新架構(目標)**:

```
治療師打開 → /clients/:id/assessment(整合評估頁,單頁工作台)
            ├─ 8 個編號區塊在同一頁(對應 mockup v3)
            ├─ 右側 Drawer 處理 Page 1-7 的細節填寫
            └─ 點「產生客戶報告」→ 生成 shareCode → 客戶端可看
```

整合評估頁 = **治療師的駕駛艙**,所有判讀、編輯、產生報告都在這頁完成。

**好處**:
1. **總覽與細節並存** — 看身體圖時可同時看數值
2. **減少頁面跳轉** — Drawer 邊填邊看主頁
3. **產品感** — 跟 mockup v3 一致,給客戶看不會丟臉
4. **雙受眾自然成立** — 治療師工作頁 vs 客戶報告頁是兩個獨立介面

### 1.2 三張設計北極星的角色定位

| 設計圖 | 角色 | 對應路由 | 受眾 |
|--------|------|----------|------|
| 治療師端 mockup v3 | 治療師工作頁 | `/clients/:id/assessment` | 治療師 |
| 客戶端報告 v2 | 客戶報告頁 | `/r/:shareCode` | 客戶 |
| 使用者流程圖 v1 | 兩端的銜接 | (跨頁面流程) | 全部 |

**雙受眾架構的精髓**:兩個介面**讀取同一份資料**,但**渲染邏輯完全不同**。

- 治療師看到 `HKA 右 3° 內翻` → 客戶看到 `右膝對位:需要注意`
- 治療師看到 `紅繩 SPL R:3 L:5` → 客戶看到 `臀大肌:左側較弱`

這個翻譯邏輯**寫在前端**,DB 只存「治療師輸入的原始資料」+「治療師寫的白話說明」。

### 1.3 「先架構、後處方」的決策依據

原本 MASTER_PLAN 是「Task 02-04 處方系統 → Week 3 重構 UI」。

今天改成「**重構 UI 架構 → 處方系統最後做**」。

**理由**:

1. **如果先做處方,UI 還是舊的填表單** → 處方做完後 UI 改造會把處方 UI 也重寫一次,**做兩次的成本**
2. **新架構先建立元件庫** → 處方做的時候直接用現成元件,品質統一
3. **設計北極星的客戶端 v2 已經畫了「教練處方」區塊** → 處方系統做的時候有明確視覺目標,不會做完才發現要改

**這個決定節省 30-40% 工作量、提升品質、降低重做風險**。

### 1.4 關鍵決策一覽

| 決策 | 選項 | 理由 |
|------|------|------|
| 主介面模式 | 單頁工作台(SPA Workspace) | 對應 mockup v3 |
| 開發順序 | 治療師端先(Week 2)→ 客戶端後(Week 3) | 資料來源邏輯上必須先有 |
| Page 1-7 處理 | 右側 Drawer | 邊填邊看主頁,空間感 |
| 處方系統時機 | Week 5(架構/兩端做完之後) | 元件庫成熟後再做 |
| 客戶端驗證 | shareCode + 生日驗證 | 業界標準折衷 |
| 簽名位置 | 治療師工作流第 ⑧ 步 | 現場簽名最合理 |
| 配色主軸 | 深靛藍 #1A2B4A + 米色 #FAF7F2 | research 推薦 + 視覺暖度 |

---

## 2. 前端架構決策

### 2.1 Route 結構(現狀 vs 新版)

**現狀**:

```
/                          → Home(首頁)
/evaluation                → 順序填寫 Page 1-7
/evaluation/:id            → 載入已存資料繼續填
/templates                 → 模板管理
/templates/:id/edit        → 模板編輯
/components                → ComponentShowcase
```

**新版**:

```
=== 治療師端(需登入)===
/                                  → Home(治療師首頁,客戶列表)
/clients                           → 客戶管理(列表 + 搜尋)
/clients/new                       → 新增客戶
/clients/:id                       → 客戶總覽(歷次評估 + 課表)
/clients/:id/assessment            → 整合評估頁(主工作台,對應 mockup v3)
                                     └ Drawer 處理 Page 1-7 子表單
/clients/:id/assessment/:assessId  → 載入特定評估(複評時)
/templates                         → 模板管理(沿用)
/settings                          → 設定(治療師個人/診所)

=== 客戶端(公開,生日驗證)===
/r/:shareCode                      → 客戶報告頁(對應 client v2)
/r/:shareCode/verify               → 生日驗證頁
/r/:shareCode/pdf                  → 客戶下載 PDF

=== 系統 ===
/auth/login                        → 登入(目前 dev bypass,Week 6 接 OAuth)
/auth/logout
```

### 2.2 頁面層級(Page Hierarchy)

```
App
├── (治療師區 - 需驗證)
│   ├── Home / ClientList
│   ├── ClientDetail
│   │   └── IntegratedAssessmentPage   ← 主工作台 ⭐
│   │       ├── Header(自動儲存、匯入資料、Tab)
│   │       ├── Tab: 主訴與病史
│   │       ├── Tab: 姿勢判讀
│   │       ├── Tab: 功能動作
│   │       ├── Tab: 體組成
│   │       ├── Tab: 神經肌肉控制
│   │       └── Tab: 綜合結論(預設)
│   │           ├── Section ①-⑧(8 編號區塊)
│   │           └── RightSidebar(報告編輯區)
│   │       └── EvaluationDrawer       ← 右側 Drawer(Page 1-7 編輯)
│   ├── TemplateList / TemplateEdit
│   └── Settings
│
├── (客戶區 - 公開)
│   ├── ClientReportPage(shareCode)
│   │   ├── BirthdateVerify(進入前)
│   │   └── ReportLayout
│   │       ├── HeroScoreBlock(68 分大圓環)
│   │       ├── PriorityFindings(三大重點)
│   │       ├── BodyRiskMap(身體風險地圖)
│   │       ├── YourStrengths(你的優勢)
│   │       ├── DataSources(資料整合來源)
│   │       ├── ActionPlan(改善建議 + 4 週路線圖)
│   │       ├── Prescriptions(教練處方)
│   │       └── CTABar(預約複評 / 聯絡治療師)
│
└── (系統)
    ├── Login
    └── 404 / Error
```

### 2.3 元件分層(Atom → Molecule → Organism → Page)

採用 **Atomic Design** 分層,因為新架構元件複雜度高,沒分層會亂。

```
src/components/
├── atoms/              ← 原子層:基礎元素
│   ├── ScoreRing.tsx          ← 圓環分數(可重用 5+ 處)
│   ├── StatusPill.tsx         ← 狀態徽章(正常/注意/危險)
│   ├── SectionNumber.tsx      ← 編號圓圈(①②③)
│   ├── BodyOutline.tsx        ← 簡易人形 SVG
│   └── (沿用 shadcn/ui: Button, Input, Card...)
│
├── molecules/          ← 分子層:組合元素
│   ├── ScoreCard.tsx          ← 分數卡(圓環 + 標籤 + 子分數)
│   ├── PriorityFinding.tsx    ← 三大重點卡
│   ├── StatusListItem.tsx     ← 部位風險列(label + value + 狀態)
│   ├── SystemImportCard.tsx   ← 4 個檢測系統的卡
│   ├── WeekPlanCard.tsx       ← 4 週計畫的單張卡
│   └── ChipToggle.tsx         ← 介入建議多選 chip
│
├── organisms/          ← 組織層:獨立區塊
│   ├── BodyRiskMap.tsx        ← 身體風險地圖(完整人形 + 熱點 + 標籤)
│   ├── HeroScoreBlock.tsx     ← 客戶端 hero 區
│   ├── PriorityFindingsList.tsx
│   ├── ActionPlanSection.tsx  ← 改善建議 + 4 週路線圖
│   ├── DataSourcesRow.tsx
│   ├── PrescriptionSection.tsx ← 教練處方區(Week 5 才填內容)
│   ├── ReportEditSidebar.tsx  ← 治療師端右側報告編輯區
│   └── EvaluationDrawer.tsx   ← 右側填寫抽屜
│
├── templates/          ← 模板層:頁面骨架
│   ├── TherapistLayout.tsx    ← 治療師端 sidebar + main 結構
│   └── ClientReportLayout.tsx ← 客戶報告長 scroll 結構
│
└── pages/              ← 頁面層:完整頁面
    ├── IntegratedAssessmentPage.tsx
    ├── ClientReportPage.tsx
    └── ...
```

**分層原則**:
- Atom 不依賴 Molecule,Molecule 不依賴 Organism
- 越下層越重用,越上層越特殊
- Token(color、spacing)透過 Tailwind config 與 CSS var 流通,不用元件傳

### 2.4 狀態管理策略

#### 治療師端

```
Server State (tRPC + React Query 自動管理)
├── 客戶資料 (clients.get)
├── 評估資料 (evaluations.get)
├── 模板 (templates.list)
└── 處方知識庫 (prescriptions.list) - Week 5

Local UI State (useState / useReducer)
├── Drawer 開關狀態
├── 當前 active tab
├── 編輯中的草稿(尚未存到 server)
└── Form 狀態(React Hook Form)

Context (跨元件共享)
├── AuthContext - 治療師資訊
└── AssessmentContext - 當前評估的 ID、客戶 ID
    (取代原 EvaluationFormContext,但保留相容性)
```

**重要**:取消「整個表單資料放在 Context」的做法。改成:
- 主畫面從 server 拿資料(via tRPC query)
- Drawer 編輯時用 React Hook Form 管理 local state
- 存檔時直接呼叫 tRPC mutation → React Query 自動 invalidate → 主畫面更新

#### 客戶端

```
Server State
└── 報告資料 (publicReport.get by shareCode)

Local State
└── 哪個 section 被展開(展開摺疊的 UI 狀態)

無 Context 需求(客戶端是 read-only)
```

### 2.5 雙受眾架構執行

**核心原則**:DB 存「治療師輸入的原始資料 + 治療師寫的白話說明」,前端做翻譯。

```
DB (evaluations table)
├── motiRiskValues: { hkaRight: 3, hkaLeft: -2, ... }    [原始]
├── redcordAssessment: { spl: { r: 3, l: 5 }, ... }      [原始]
├── prescriptions: [...]                                  [原始]
├── plainExplanation: "您的下背痠痛主要與..."             [治療師寫的白話]
├── topThreeIssues: [                                     [治療師寫的優先問題]
│     { title: "核心穩定不足", description: "..." },
│     ...
│   ]
├── recommendedPlan: ["核心訓練", "深蹲再教育", ...]      [治療師寫的方案]
└── reassessDate: 2026-06-10                              [治療師設定]
        ↓
        ├─ 治療師端讀:全部欄位都顯示(專業介面)
        └─ 客戶端讀:只顯示 plainExplanation + topThreeIssues + recommendedPlan + reassessDate
                    原始數值自動翻譯成白話(前端 mapping)
```

**翻譯邏輯放哪裡**:`shared/translations.ts`(新檔案,共用)

```ts
// shared/translations.ts (示意)
export const MOTI_RISK_LABELS = {
  hkaRight: { professional: "HKA 右", consumer: "右膝對位" },
  hkaLeft:  { professional: "HKA 左", consumer: "左膝對位" },
  // ...
};

export const REDCORD_LABELS = {
  spl: { professional: "SPL", consumer: "臀大肌" },
  sb:  { professional: "SB",  consumer: "腿後腱肌群" },
  // ...
};
```

---

## 3. 後端 Schema 擴充清單

對照三張設計圖,以下是必須新增的 DB 欄位 + 對應 migration。

### 3.1 evaluations table 必須新增的欄位

| 欄位名 | 型別 | 用途 | 對應設計圖位置 |
|--------|------|------|---------------|
| `chiefComplaint` | text | 客戶主訴(現場症狀描述) | mockup v3 左側「主訴」 |
| `clientGoals` | text | 客戶目標 | mockup v3 左側「目標」 |
| `topThreeIssues` | json | 三大優先問題陣列 | mockup v3 第 ⑥ 區塊 |
| `plainExplanation` | text | 給客戶看的白話說明 | mockup v3 右側 + 客戶端 |
| `recommendedPlan` | json | 建議方案 bullet list | mockup v3 右側 + 客戶端 |
| `interventionTypes` | json | 介入建議多選結果 | mockup v3 第 ⑦ 區塊 |
| `interventionNotes` | text | 介入備註 | mockup v3 第 ⑦ 下方 |
| `weekPlan` | json | 4 週計畫草案 | mockup v3 第 ⑧ 區塊 |
| `reassessDate` | date | 預計複評日期 | mockup v3 右側 + 客戶端 |
| `riskLevel` | enum | 風險等級(low/mid/high) | mockup v3 右側風險等級 |
| `overallScore` | int | 整體分數 0-100 | 客戶端 hero 大圓環 |
| `subScores` | json | 四個子分數 | 客戶端右側四卡 |
| `bodyRiskMap` | json | 身體風險地圖資料 | 客戶端中間身體圖 |
| `strengths` | json | 「你的優勢」列表 | 客戶端綠色 banner |
| `shareCode` | varchar(20) | 客戶分享連結代碼 | 流程圖第 ⑩ 步 |
| `shareCodeCreatedAt` | timestamp | 連結建立時間 | 安全性追蹤 |
| `lastViewedByClient` | timestamp | 客戶最後查看時間 | 治療師端通知用 |
| `inBodyData` | json | InBody 體組成資料 | mockup v3 第 ② InBody 卡 |
| `assignedTherapistId` | varchar | 指派治療師 | mockup v3 「指派治療計畫」 |

### 3.2 新 table

#### `clients` table(新)— 從 evaluations 拆出客戶實體

理由:目前 evaluations 一筆 = 一個客戶的一次評估,但複評時要查「同一客戶的歷次評估」,
應該拆出 client 實體。

```
clients
├── id (uuid pk)
├── name
├── birthdate
├── gender
├── height
├── weight
├── primaryTherapistId
├── tenantId (未來多診所,Phase 2)
├── createdAt
└── updatedAt

evaluations
├── id (uuid pk)
├── clientId (fk → clients.id)   ← 新增
├── ... (原本所有欄位)
└── createdAt
```

**Migration 影響**:現有 evaluations 要 backfill clients(從 basicInfo 拆出來)。

#### `prescriptionKB` table(Week 5 才做,先記著)

處方知識庫,Week 5 設計時再詳。

### 3.3 Migration 順序

> **v1.1 變更**:原本 0005-0006 兩個 migration 拆成 0005-0007 三個,
> 後續 migration 全部 +1。理由:單個 migration 失敗時 rollback 影響面小。

```
drizzle/0005_add_assessment_text_fields.sql      ← Week 1
  └ 加文字類欄位:
    - chiefComplaint
    - clientGoals
    - plainExplanation
    - interventionNotes

drizzle/0006_add_assessment_structured.sql       ← Week 1
  └ 加結構化欄位:
    - topThreeIssues (json)
    - recommendedPlan (json)
    - interventionTypes (json)
    - weekPlan (json)
    - reassessDate (date)
    - riskLevel (enum: low/mid/high)

drizzle/0007_add_client_facing_scores.sql        ← Week 1
  └ 加客戶端視覺欄位:
    - overallScore (int 0-100)
    - subScores (json,四子分數)
    - bodyRiskMap (json,身體風險地圖資料)
    - strengths (json,「你的優勢」列表)
    - inBodyData (json,InBody 體組成)
    - assignedTherapistId (varchar)

drizzle/0008_add_sharing.sql                     ← Week 3
  └ 加 shareCode, shareCodeCreatedAt, lastViewedByClient

drizzle/0009_extract_clients_table.sql           ← Week 4
  └ 建 clients table + backfill from evaluations
  └ evaluations 加 clientId

drizzle/0010_add_prescriptions.sql               ← Week 5
  └ 建 prescriptionKB table + evaluations 加 prescriptions json
```

**Migration 紀律**:
- 一個 migration 一個目的,失敗影響面小
- 本地先 `pnpm db:push` 跑通
- Production 等該週末手動跑(不自動跑)
- 跑失敗 → 立刻寫 rollback migration,不要直接改 SQL

### 3.4 zod schema 同步表

每個 SQL migration 必須同步更新:

```
drizzle/schema.ts                          ← Drizzle ORM 定義
server/routers.ts evaluationInputSchema    ← tRPC 輸入驗證
shared/evaluation.ts EvaluationFormData    ← 型別 + 預設值
client/src/contexts/AssessmentContext.tsx  ← Context 預設值(若用)
```

**紀律**:改一個 = 改四個,缺一個就型別不對。Claude Code 動 schema 前必看
這個清單。

---

---

## 4. 設計系統建立

### 4.1 設計 Token

> **v1.1 變更**:由 Claude Code 在 onboarding 時提醒 — 本專案使用
> **Tailwind v4**(已升級),不能用 v3 的 `tailwind.config.ts + tokens.css`
> 寫法。Tailwind v4 走 **CSS-first 的 `@theme` 機制**。
>
> 修正後:**所有設計 token 寫在 `client/src/app.css`(或現有主 CSS 檔)
> 的 `@theme inline` 區塊**。Tailwind 自動產生對應 utility class
> (例如 `bg-brand-primary`、`text-status-good`)。
>
> 不再建立 `tokens.css`,也不修改 `tailwind.config.ts`(v4 已不需要該檔)。

**規則**:
- 所有 token 透過 `@theme inline` 定義 → 自動產生 utility class
- **元件裡禁止寫死 hex / px 數值**,只能用 token utility(如 `bg-brand-primary`)
- 不確定變數名稱對應到哪個 utility class 時,參考 Tailwind v4 文件

#### 完整 Token 配置(寫在 client/src/app.css)

```css
@import "tailwindcss";

@theme inline {
  /* === 品牌色 === */
  --color-brand-primary: #1A2B4A;        /* 深靛藍 - 治療師端主色 */
  --color-brand-primary-light: #2D4373;
  --color-brand-primary-dark: #0F1A30;
  --color-brand-accent: #00B4D8;         /* 藍綠 - 強調色 */

  /* === 客戶端輔助色 === */
  --color-client-warm: #FAF7F2;          /* 米色背景 - 客戶端 */
  --color-client-violet: #7C3AED;        /* 客戶流程紫(流程圖用)*/

  /* === 語義色(狀態)=== */
  --color-status-good: #4CAF82;          /* 正常 / 良好 */
  --color-status-good-bg: #E8F5E9;       /* 正常背景 */
  --color-status-warn: #F59E0B;          /* 注意 / 中等 */
  --color-status-warn-bg: #FEF3C7;       /* 注意背景 */
  --color-status-danger: #EF4444;        /* 危險 / 嚴重 */
  --color-status-danger-bg: #FEE2E2;     /* 危險背景 */

  /* === 中性色(可選:覆蓋 Tailwind 預設 gray 系列)=== */
  --color-bg-page: #F9FAFB;              /* 頁面背景 */
  --color-bg-card: #FFFFFF;              /* 卡片背景 */
  --color-bg-subtle: #F3F4F6;            /* 淡背景(input、disabled)*/
  --color-border-default: #E5E7EB;       /* 預設邊框 */
  --color-border-strong: #D1D5DB;
  --color-text-primary: #111827;         /* 主要文字 */
  --color-text-secondary: #6B7280;       /* 次要文字 */
  --color-text-tertiary: #9CA3AF;        /* 輔助文字 */

  /* === 字體 === */
  --font-display: "Plus Jakarta Sans", "Noto Sans TC", sans-serif;
  --font-body: "Inter", "Noto Sans TC", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* === 圓角(覆蓋 Tailwind 預設 rounded-*)=== */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
}

/* 全域 body 樣式 */
body {
  font-family: var(--font-body);
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
}
```

#### 字體載入策略

> **v1.2 變更**:由 Claude Code 在 Day 0 環境清點時發現,
> 既有專案的 Geist 字體用 `@font-face` self-host 模式
> (jsdelivr CDN-as-self-host),不是 Google Fonts CDN。
>
> 為了保持風格一致,**字體統一用 `@fontsource/*` 套件 self-host**,
> 不要混用 CDN `@import url(...)` 寫法。

#### Day 1 安裝套件

```bash
pnpm add @fontsource/plus-jakarta-sans @fontsource/inter @fontsource/noto-sans-tc
```

#### Day 1 在 main.tsx 引入

```ts
// client/src/main.tsx 頂部
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/noto-sans-tc/400.css";
import "@fontsource/noto-sans-tc/500.css";
import "@fontsource/noto-sans-tc/700.css";
import "./index.css";
```

**注意**:不要在 index.css 寫 `@import url(...)`(CDN 法)。
全部走 npm 套件 self-host。

#### 對應產生的 Tailwind utility class

```
--color-brand-primary       →  bg-brand-primary / text-brand-primary / border-brand-primary
--color-brand-accent        →  bg-brand-accent / text-brand-accent
--color-status-good         →  bg-status-good / text-status-good
--color-status-good-bg      →  bg-status-good-bg(用於 pill 背景)
--color-status-warn / warn-bg / danger / danger-bg ← 同上
--color-client-warm         →  bg-client-warm
--font-display              →  font-display
--font-body                 →  font-body
--radius-md                 →  rounded-md(覆蓋 Tailwind 預設)
```

使用範例:
```tsx
// ❌ 錯誤(寫死 hex)
<div className="bg-[#1A2B4A] text-white">...</div>

// ✅ 正確(用 token utility)
<div className="bg-brand-primary text-white">...</div>

// ✅ 狀態徽章
<span className="bg-status-warn-bg text-status-warn px-2 py-1 rounded-md">
  注意
</span>
```

#### 字級階層(透過 Tailwind utility 對應)

| 用途 | Tailwind class | size | weight | line-height |
|------|---------------|------|--------|-------------|
| 大標題(頁面 title)| `text-3xl font-bold font-display` | 28-32px | 700 | 1.2 |
| 區塊標題 | `text-xl font-semibold font-display` | 18-20px | 600 | 1.3 |
| 卡片標題 | `text-base font-semibold` | 16px | 600 | 1.4 |
| 內文 | `text-sm` | 14px | 400 | 1.6 |
| 輔助文字 | `text-xs text-text-tertiary` | 12-13px | 400 | 1.5 |
| 數據(分數) | `text-6xl font-bold tabular-nums font-display` | 48-64px | 700 | 1 |

#### Day 0 前置確認(寫 @theme 之前必做)

Claude Code 開工前要先確認以下 3 件事:

1. **package.json 確認 Tailwind v4**(`"tailwindcss": "^4.x.x"`)
2. **現有 CSS 檔位置**:`client/src/app.css`?還是 `index.css`?還是 `main.css`?
3. **Tailwind 引入位置**:現在 `@import "tailwindcss"` 寫在哪個檔?

確認後才能決定 `@theme inline` 區塊要插在哪個檔案的什麼位置。

### 4.2 元件分層清單

完整元件清單 + 哪一週要做。**這份清單就是 Claude Code 的開發 backlog**。

#### Atoms(原子層 - Week 1 全部做完)

| 元件 | 用途 | 重用次數預估 | 依賴 |
|------|------|-------------|------|
| `ScoreRing` | 圓環分數(可設定 size、色彩、漸層) | 8+ | SVG |
| `StatusPill` | 狀態徽章(綠/橙/紅,可選文字) | 30+ | - |
| `SectionNumber` | 編號圓圈(①②③),可設色 | 20+ | - |
| `ChipToggle` | 可選擇徽章 chip | 10+ | shadcn Toggle |
| `BodyOutlineSimple` | 簡易人形 SVG(用於小卡片) | 5+ | SVG |
| `IconBadge` | 圓背景圖示 | 15+ | lucide-react |
| `DataLabelValue` | 「標籤: 值」一行 | 20+ | - |
| `EditableLabel` | 可點擊變編輯模式的文字 | 15+ | shadcn Input |
| `ProgressBar` | 進度條(可帶 segments) | 8+ | - |

#### Molecules(分子層 - Week 1 後半 + Week 2 補)

| 元件 | 組成 | 哪頁用 |
|------|------|--------|
| `ScoreCard` | ScoreRing + label + sub-label | 客戶 hero、治療師風險區 |
| `SubScoreCard` | mini ring + 標籤 + 數值 | 客戶端四子分數卡 |
| `PriorityFindingCard` | SectionNumber + icon + title + description | 治療師 ⑥、客戶三大重點 |
| `StatusListItem` | label + 進度條 + StatusPill | 客戶身體部位列表 |
| `SystemImportCard` | logo + 系統名 + 狀態 + summary | 治療師 ② + 客戶資料來源 |
| `WeekPlanCard` | 週標題 + checklist | 治療師 ⑧ + 客戶 4 週圖 |
| `ActionRecommendationCard` | icon + title + 描述 + CTA link | 客戶改善建議 |
| `KeyFindingRow` | 項目名 + 數值 badge | 治療師 ③ 右側 |
| `PrescriptionMiniCard` | 縮圖 + 動作名 + 組次數 + tag | 客戶處方區(Week 5) |

#### Organisms(組織層 - Week 2 治療師 / Week 3 客戶)

**治療師端 Organisms**(Week 2):

| 元件 | 對應 mockup v3 區塊 |
|------|---------------------|
| `ClientSidebar` | 中央-左客戶面板(主訴 / 目標 / 評估進度) |
| `AssessmentHeader` | 頂部標題列(自動儲存 / 匯入資料 / Tab) |
| `ComplaintSection` | ① 本次主訴 / 症狀 |
| `DataSourceSection` | ② 資料來源整合 |
| `PostureReadingSection` | ③ 姿勢重點判讀(身體圖 + 5 個發現)|
| `FunctionalIssueGrid` | ④ 功能與控制問題(2x3) |
| `TherapistJudgmentEditor` | ⑤ 治療師整合判讀(textarea + 載入上次/套用模板) |
| `TopIssuesEditor` | ⑥ 三大優先問題編輯器 |
| `InterventionChips` | ⑦ 介入建議多選 |
| `WeekPlanGrid` | ⑧ 4 週計畫草案 |
| `ReportEditSidebar` | 右側報告編輯區(白話說明 + 風險等級 + 建議方案) |
| `EvaluationDrawer` | 右側滑出抽屜(Page 1-7 細節填寫)|

**客戶端 Organisms**(Week 3):

| 元件 | 對應 client v2 區塊 |
|------|---------------------|
| `HeroScoreBlock` | 68 分大圓環 + 整體狀態卡 + 四子分數 |
| `PriorityFindingsList` | 本次三大重點(3 張卡)|
| `BodyRiskMap` | 身體風險地圖(人形 + 熱點 + 標籤) |
| `YourStrengthsBanner` | 你的優勢(綠底橫條)|
| `DataSourcesRow` | 資料整合來源 |
| `ActionPlanSection` | 改善建議 + 4 週路線圖 |
| `PrescriptionSection` | 教練處方(Week 5 填內容,Week 3 先做空殼)|
| `ClientCTABar` | 預約複評 / 聯絡治療師 |
| `BirthdateVerifyForm` | 生日驗證(進入前)|

#### Templates(模板層 - Week 2-3)

| 元件 | 用途 |
|------|------|
| `TherapistLayout` | 治療師端統一外殼(sidebar + main) |
| `ClientReportLayout` | 客戶端長 scroll 外殼 |

#### Pages(頁面層 - Week 2-3-4 完成)

對應前面 2.2 列的所有頁面。

### 4.3 元件實作依賴關係

```
Week 1 Foundation:
  Atoms (ScoreRing, StatusPill, SectionNumber, ChipToggle...)
        ↓ 依賴
  Molecules (ScoreCard, PriorityFindingCard, WeekPlanCard...)
        ↓
  [Week 1 結束:元件 showcase 頁面可看所有 atoms + molecules]

Week 2 治療師端:
  Therapist Organisms (各 Section 元件)
        ↓ 依賴
  TherapistLayout
        ↓
  IntegratedAssessmentPage
        ↓
  EvaluationDrawer(子表單)

Week 3 客戶端:
  Client Organisms (HeroScoreBlock, BodyRiskMap...)
        ↓ 依賴
  ClientReportLayout
        ↓
  ClientReportPage
        ↓
  shareCode 路由 + 生日驗證

Week 4 連接:
  把現有 Page 1-7 拆解進 EvaluationDrawer
  ClientDetail 頁(複評時的歷次比較)
```

**鐵律**:**下層元件未完成,不能寫上層元件**。Week 1 必須先完成 Atoms,
才能寫 Molecules,才能寫 Organisms。

---

## 5. 頁面實作順序

### 5.1 順序總覽

```
Phase 1 — Foundation (Week 1)
  ↓
Phase 2 — 治療師工作台 (Week 2)
  ↓
Phase 3 — 客戶報告 + shareCode (Week 3)
  ↓
Phase 4 — 連接舊系統 (Week 4)
  ↓
Phase 5 — 處方系統 (Week 5)
  ↓
Phase 6 — PDF + 打磨 (Week 6)
```

### 5.2 為什麼這個順序

#### 為什麼 Foundation 先做

- **無 Foundation,後面所有元件都會亂寫**(配色不一致、間距亂)
- **token + Atoms + Molecules 是基礎建設**,投資一週後面省三週
- **Week 1 結束有一個元件 showcase 頁** → 你可以直接看所有元件,確認設計感

#### 為什麼治療師端先(Week 2)、客戶端後(Week 3)

你已選 **A. 治療師端先做完(Week 2)→ 客戶端再做(Week 3)**。理由:

1. **資料來源邏輯上必須先有** — 客戶端讀的「白話說明」「三大問題」是治療師寫的,
   治療師端沒做好,客戶端只能用假資料
2. **治療師端是內部工具,可以邊用邊改** — 你跟同事可以提早使用、給回饋
3. **治療師端複雜度高(編輯器、Drawer、自動儲存)** — 先攻硬骨頭,後面客戶端
   只是 render 比較輕鬆

#### 為什麼 Page 1-7 重構放 Week 4

不放 Week 1 的理由:
- Week 1 在做基礎,沒空 refactor 舊 Page

不放 Week 2 的理由:
- Week 2 治療師工作台用「假資料 / 直接打 DB」測試畫面,先確認 UI 正確
- 工作台確定可用之後,才把 Page 1-7 接進來當資料輸入端

不放 Week 3 的理由:
- Week 3 是客戶端,不該插入治療師端的 refactor

放 Week 4 的理由:
- 治療師工作台 + 客戶端兩個 UI 已成熟
- 把 Page 1-7 改成 Drawer 子表單時,目標清楚

#### 為什麼處方放 Week 5

- 處方系統的 UI 在客戶端報告 v2 + 治療師端 mockup v3 已經有具體位置
- 元件庫(Week 1)+ 治療師端結構(Week 2)+ 客戶端結構(Week 3)都成熟後,
  處方做起來只是「加一個 organism 填內容」
- **不會有「處方做完才發現要重做」的風險**

#### 為什麼 PDF + 打磨放最後

- PDF 渲染依賴所有 UI 元件已穩定
- Puppeteer 改寫 PDF 邏輯需要 web 版設計穩定後才有「目標」
- 「打磨」階段做動效、響應式、accessibility(常被忽略但重要)

### 5.3 每頁的 Minimum Viable 標準

> 「做到什麼程度算 done?」每頁的 MVP 標準。

#### IntegratedAssessmentPage(治療師工作台)

**Week 2 結束時必須:**
- ✅ 8 個編號區塊都顯示出來,**用假資料即可**
- ✅ 右側報告編輯區可顯示(編輯功能 Week 4 接資料才完整)
- ✅ Tab 切換正常
- ✅ 「自動儲存」狀態列正常顯示
- ✅ 「載入上次評估」「套用模板」按鈕存在(功能可暫時 alert)
- ✅ 視覺與 mockup v3 對照 ≥ 90% 一致

**Week 2 不需要:**
- ❌ 真實資料(Week 4 才接)
- ❌ Drawer 編輯 Page 1-7(Week 4 才做)
- ❌ 「產生客戶報告」按鈕(Week 3 做)

#### ClientReportPage(客戶報告)

**Week 3 結束時必須:**
- ✅ 7 個區塊都顯示出來
- ✅ shareCode 路由可用(`/r/:shareCode`)
- ✅ 生日驗證頁可用
- ✅ 用假資料展示完整視覺
- ✅ 響應式(mobile 也能看)
- ✅ 視覺與 client v2 對照 ≥ 90% 一致

**Week 3 不需要:**
- ❌ 真實資料(Week 4 從治療師端接過來)
- ❌ 處方區塊完整內容(Week 5 才填)
- ❌ PDF 下載(Week 6 才做)

---

## 6. 6 週週次拆解

### Week 1 — Foundation(基礎建設)

#### 目標

建立設計 Token + Atoms + Molecules + 元件 showcase 頁。
**這週完成後,後續 5 週都建立在這份基礎上。**

#### 任務清單

> **v1.1 變更**:新增 Day 0(現況清點 + branch + 文件搬移),
> 原 Day 1-5 順延但保持 5 個工作天。

```
□ Day 0 - 環境清點 + Branch + 文件搬移(0.5 天)
  Step 1 - 環境清點(只看不動)
    - ls -la repo 根目錄
    - 列 client/src 下面 CSS 檔結構(找現有 app.css / index.css)
    - 確認 package.json 裡 tailwindcss 版本(必須是 v4.x)
    - grep -rn "#E8763A\|#F97316\|orange-" client/src/
      → 列出所有寫死舊配色的位置(僅列出,不動)
    - 確認 Tailwind 引入位置(現在 @import "tailwindcss" 在哪)
    - 結果回報 Ian

  Step 2 - Branch 切換 + 文件搬移
    - git checkout main && git pull
    - git checkout -b feat/week1-foundation
    - 把 WEB_ARCHITECTURE_PLAN.md / SYSTEM_ARCHITECTURE.md /
      RAILWAY_DEPLOYMENT.md 複製進 repo 根目錄
    - 新建 docs/design/ 放三張設計圖
      - DESIGN_THERAPIST_v3.png
      - DESIGN_CLIENT_v2.png
      - USER_FLOW_v1.png
    - git add . → 但不 commit,等 Ian 確認

□ Day 1 - 設計 Token(Tailwind v4 @theme 寫法)
  - 在 client/src/app.css(或對應主 CSS 檔)寫 @theme inline 區塊
    參考 Section 4.1 完整 Token 配置
  - 引入字體(@import Google Fonts 在 app.css 頂部 或在 index.html)
  - body 套用 font-family + 預設背景色
  - 不要建 tokens.css,不要動 tailwind.config.ts
  - 全專案 grep 舊配色位置(Day 0 已找出),先標記但「不動」
  - 跑 pnpm dev → 確認頁面不爛
  - 跑 pnpm check → 確認型別 OK

□ Day 2 - Atoms 第一批(必要型)
  - ScoreRing(SVG 圓環)
  - StatusPill(綠橙紅徽章)
  - SectionNumber(編號圓圈)
  - IconBadge(圓背景圖示)
  - 全部用 token utility class,禁止寫死 hex

□ Day 3 - Atoms 第二批(進階型)
  - ChipToggle
  - BodyOutlineSimple(簡易人形)
  - ProgressBar
  - EditableLabel
  - DataLabelValue

□ Day 4 - Molecules 第一批
  - ScoreCard
  - SubScoreCard
  - PriorityFindingCard
  - StatusListItem

□ Day 5 - Molecules 第二批 + Showcase
  - SystemImportCard
  - WeekPlanCard
  - KeyFindingRow
  - ActionRecommendationCard
  - **更新 ComponentShowcase 頁面展示所有元件**

□ Schema 工作(穿插進行,建議放 Day 4-5)
  - 0005_add_assessment_text_fields.sql
  - 0006_add_assessment_structured.sql
  - 0007_add_client_facing_scores.sql
  - Drizzle schema + zod + shared/evaluation.ts 同步
  - 本地 pnpm db:push 跑通,Production 不跑
```

#### 完成判定

打開 `/components` 頁面,可以看到:
- 所有 Atoms + Molecules 一個個展示
- 配色、字體跟 mockup v3 + client v2 視覺一致
- 互動效果(hover、focus、disabled)正常

#### 風險

- **元件設計細節跟設計圖不一致** — 緩解:邊做邊對照 mockup 截圖
- **過早最佳化** — 緩解:Week 1 不做動畫,只把樣式打對

---

### Week 2 — 治療師整合評估頁(主工作台)

#### 目標

實現治療師端 mockup v3 的完整視覺 + 假資料展示。

#### 任務清單

```
□ Day 1 - 頁面骨架
  - 建 TherapistLayout(左側 sidebar + 主內容區)
  - 建路由 /clients/:id/assessment
  - 建 IntegratedAssessmentPage(空殼)
  - 建 ClientSidebar 元件(中央-左面板)

□ Day 2 - Tab + Header
  - AssessmentHeader(頂部標題 + 自動儲存 + 匯入資料)
  - Tab 切換邏輯(主訴 / 姿勢 / 功能 / 體組成 / 神經肌肉 / 綜合結論)
  - 「綜合結論」tab 預設 active

□ Day 3 - Section ①-④
  - ComplaintSection(①)
  - DataSourceSection(②)
  - PostureReadingSection(③)— 含身體圖 + 5 個發現
  - FunctionalIssueGrid(④)— 2x3 grid

□ Day 4 - Section ⑤-⑧
  - TherapistJudgmentEditor(⑤)— textarea + 載入上次 / 套用模板
  - TopIssuesEditor(⑥)— 三大問題編輯
  - InterventionChips(⑦)— 多選 chip
  - WeekPlanGrid(⑧)— 4 週計畫

□ Day 5 - 右側 Report Edit Sidebar + 整合
  - ReportEditSidebar(白話說明 + 風險等級 + 建議方案 + 複評時間 + 備註)
  - 三個按鈕(儲存草稿 / 指派治療計畫 / 產生客戶報告)
  - 整體視覺對照 mockup v3 完成 90%
  - 假資料用 chenXiaoyan demo(內建一筆完整資料)
```

#### 完成判定

打開 `/clients/demo-001/assessment` 看到:
- 整頁視覺跟 mockup v3 對照 ≥ 90% 一致
- 所有區塊用假資料填滿
- Tab 切換正常
- 右側編輯區欄位都顯示
- 三個 CTA 按鈕存在(功能可暫時 alert)

#### 風險

- **③ 姿勢判讀的身體圖 SVG 找不到合適來源** — 緩解:用簡易線稿
  (跟 mockup v3 一樣即可,不要做 3D)
- **元件命名重複導致衝突** — 緩解:命名前查 components/ 已有清單

---

### Week 3 — 客戶報告頁 + shareCode

#### 目標

實現客戶端 v2 完整視覺 + shareCode 路由 + 生日驗證。

#### 任務清單

```
□ Day 1 - 公開路由 + 後端
  - 建 publicProcedure(tRPC) — 不需登入即可呼叫
  - 建 publicReport.getByShareCode(shareCode, birthdate) procedure
  - 生 shareCode 邏輯(nanoid)
  - 客戶端 layout 不繼承治療師端

□ Day 2 - 生日驗證頁
  - BirthdateVerifyForm
  - 路由 /r/:shareCode → 先驗證 → 通過才進報告
  - 失敗 3 次鎖定 1 小時(基本安全)
  - 通過後存 sessionStorage(同 session 不再問)

□ Day 3 - Client Page 上半
  - ClientReportLayout
  - HeroScoreBlock(68 分大圓環 + 整體狀態 + 四子分數)
  - PriorityFindingsList(三大重點)

□ Day 4 - Client Page 中下半
  - BodyRiskMap(身體圖 + 熱點 + 標籤)
  - YourStrengthsBanner(綠底橫條)
  - DataSourcesRow
  - ActionPlanSection(改善建議 + 4 週路線圖)

□ Day 5 - Client Page 底 + 整合
  - PrescriptionSection 空殼(Week 5 填內容)
  - ClientCTABar(預約複評 / 聯絡治療師)
  - Footer
  - 響應式調整(mobile 也能看)
  - 假資料展示完整視覺
```

#### Schema 工作

```
□ 0008_add_sharing.sql
  - evaluations 加 shareCode, shareCodeCreatedAt, lastViewedByClient
```

#### 完成判定

- `/r/abc123` 進去看到生日驗證頁
- 輸入正確生日 → 進入客戶報告頁
- 整頁視覺跟 client v2 對照 ≥ 90% 一致
- 在 mobile 上瀏覽也順暢

---

### Week 4 — 連接舊系統(Page 1-7 重構為 Drawer)

#### 目標

把現有 Page 1-7 拆解進 EvaluationDrawer,讓治療師工作台真的能編輯資料。
加 clients table 拆分。

#### 任務清單

```
□ Day 1 - clients table migration
  - 0009_extract_clients_table.sql
  - 寫 backfill script(從 evaluations.basicInfo 拆 clients)
  - 在本地跑通,Production 暫不跑

□ Day 2 - EvaluationDrawer 骨架
  - 建 Drawer 元件(shadcn Sheet)
  - 右側滑出,可摺疊
  - 6 個 tab(基本 / 姿勢 / 功能 / 紅繩 / 體組成 / 訓練)
  - 點主頁某區塊「編輯」→ 打開對應 tab

□ Day 3 - Page 1-3 內容塞進 Drawer
  - Page 1 基本資料 → Drawer tab 1
  - Page 2 姿勢(含 Moti 12 項)→ Drawer tab 2
  - Page 3 功能動作 → Drawer tab 3

□ Day 4 - Page 4-7 內容塞進 Drawer
  - Page 4 紅繩 → Drawer tab 4
  - Page 5 體組成 → Drawer tab 5
  - Page 6 訓練計畫 → 合併進主頁 ⑧ 區塊
  - Page 7 簽名 → 治療師工作流第 ⑧ 步(新 modal)

□ Day 5 - 資料連通 + 自動儲存
  - 主頁從 tRPC 拿資料 → render
  - Drawer 用 React Hook Form
  - 儲存 → tRPC mutation → React Query invalidate → 主頁更新
  - 自動儲存邏輯(5 秒 debounce)
  - 「⏳ 整合評估」進度判定邏輯
```

#### Schema 工作

```
□ EvaluationFormContext.tsx 廢除
  - 改成 AssessmentContext 只存「當前 ID」
  - 表單資料全部走 React Query
```

#### 完成判定

- 治療師可以打開 demo 客戶 → 點主頁區塊 → Drawer 滑出 → 編輯 → 儲存 → 主頁更新
- 自動儲存正常運作
- 「⏳ 整合評估」會自動變 ✓(全部填完時)

#### 風險

- **EvaluationFormContext 廢除後現有 Page 1-7 元件壞掉** — 緩解:逐 tab 改,
  改一個測一個
- **clients table backfill 失敗** — 緩解:本地先 dry run,production 等到
  Week 6 再上

---

### Week 5 — 處方系統

#### 目標

實現處方知識庫(Task 02-04 內容,延後到這週)+ 整合進治療師工作台 + 客戶端。

#### 任務清單

```
□ Day 1 - 處方知識庫 schema
  - 0010_add_prescriptions.sql
  - 建 prescriptionKB table(id, name, category, sets, reps,
      videoUrl, thumbnailUrl, targetArea, difficulty, description)
  - shared/prescriptionKB.ts(型別 + 預設資料 4 筆,你親手寫)

□ Day 2 - 處方選擇 UI(治療師端)
  - PrescriptionPicker 元件(modal 或 drawer)
  - 在治療師工作台某處新增「開立處方」入口
  - 選擇 → 可調整組次數 → 加入評估的 prescriptions 陣列

□ Day 3 - 處方在客戶報告呈現
  - 補完 PrescriptionSection(空殼 from Week 3)
  - 3 個動作 + 影片縮圖 + 組次數 + tag
  - 「查看完整處方清單」展開列表

□ Day 4 - 處方知識庫管理頁
  - /prescriptions 後台管理(治療師可新增、編輯處方)
  - 加圖片 / 影片連結
  - 分類管理(核心穩定 / 髖部 / 肩胛...)

□ Day 5 - 整合測試 + 處方資料填充
  - 你親手寫 4 個高優先處方完整內容
  - 串接整個流程:選擇 → 評估儲存 → 客戶端看到
  - 「處方影片」改用 R2 / YouTube embed
```

#### 完成判定

- 治療師可從處方知識庫選 3-5 個處方加入評估
- 客戶端報告看到處方區塊有內容
- 至少 4 個處方完整可用(由 Ian 親自寫)

---

### Week 6 — PDF 重做 + 打磨

#### 目標

Puppeteer 重寫 PDF,生成跟 web 一致的高品質報告。
打磨細節(動效、響應式、accessibility)。

#### 任務清單

```
□ Day 1 - Puppeteer setup + 治療師端 PDF
  - 啟用 server/pdfGenerator.ts(目前未用)
  - 治療師工作頁可一鍵下載 PDF 版(內部存檔用)

□ Day 2 - 客戶端 PDF
  - /r/:shareCode/pdf 路由
  - Puppeteer render 客戶報告 v2 → PDF
  - 字體嵌入(中文 Noto Sans TC)
  - 圖表正確渲染

□ Day 3 - 動效 + Framer Motion
  - 頁面載入動效(staggered reveal)
  - ScoreRing 數字遞增動畫
  - 區塊進場 fade-in
  - 不要過頭(refined,不是吵)

□ Day 4 - 響應式 + Accessibility
  - Mobile 響應式檢查
  - 鍵盤導航(治療師端 Tab、Shift+Tab)
  - ARIA 標籤
  - 對比度檢查(WCAG AA)

□ Day 5 - 整合測試 + Production 部署
  - Production migrations 跑(0005-0010)
  - clients table backfill 上 production
  - 自動化 smoke test
  - Tag v1.0
```

#### 完成判定

- PDF 下載出來跟 web 視覺一致
- 動效流暢不卡頓
- Mobile 看客戶報告體驗良好
- Production 環境完整運作

---

## 7. 驗收標準(Definition of Done)

每週結束時的「做完」定義。**沒過驗收,不進下一週**。

### Week 1 驗收

- [ ] `/components` 頁面展示所有 Atoms + Molecules
- [ ] 所有元件用 CSS var,**禁止寫死 hex**(grep 檢查)
- [ ] 字體載入正常(F12 看 network)
- [ ] 跟 mockup 視覺對照 ≥ 90% 一致(主觀,Ian 判斷)
- [ ] `pnpm check` 過、`pnpm test` 過
- [ ] Schema migration 0005 + 0006 + 0007 在本地 DB 跑通

### Week 2 驗收

- [ ] `/clients/demo-001/assessment` 可訪問
- [ ] 8 個區塊都顯示假資料
- [ ] Tab 切換正常
- [ ] 跟 mockup v3 對照 ≥ 90%
- [ ] 三個 CTA 按鈕存在(功能可 alert)

### Week 3 驗收

- [ ] `/r/abc123` 訪問先到生日驗證頁
- [ ] 通過驗證後進入客戶報告
- [ ] 7 個區塊都顯示假資料
- [ ] Mobile 響應式正常
- [ ] 跟 client v2 對照 ≥ 90%
- [ ] Schema migration 0008 在本地跑通

### Week 4 驗收

- [ ] Drawer 可開可關,6 個 tab 都能編輯
- [ ] 編輯儲存後主頁自動更新
- [ ] 自動儲存正常
- [ ] EvaluationFormContext 廢除完成
- [ ] 真實資料貫穿(治療師填 → 客戶看到正確內容)
- [ ] Schema migration 0009 跑通

### Week 5 驗收

- [ ] 處方知識庫至少 4 筆完整資料
- [ ] 治療師可選處方 + 加入評估
- [ ] 客戶報告看到處方區塊
- [ ] `/prescriptions` 管理頁可新增 / 編輯

### Week 6 驗收

- [ ] PDF 下載出來跟 web 視覺一致
- [ ] Production 跑通完整流程(治療師填 → 客戶看到 → 下載 PDF)
- [ ] 動效流暢
- [ ] Tag v1.0 在 GitHub

---

## 8. 風險與取捨清單

| # | 風險 | 影響 | 緩解策略 |
|---|------|------|----------|
| 1 | 身體風險地圖 SVG 太複雜 | Week 3 延期 | MVP 用 mockup 同款簡易線稿,不做點擊熱區 |
| 2 | clients table backfill 失敗 | Week 4 卡住 | 本地 dry run,production 等 Week 6 |
| 3 | EvaluationFormContext 廢除破壞舊邏輯 | Week 4 BUG 多 | 逐 tab 改,每改一個全測一次 |
| 4 | 元件命名衝突 | 整個專案結構亂 | 命名前查 components/ 已有清單 |
| 5 | Puppeteer 中文字體渲染問題 | Week 6 PDF 醜 | Week 5 末提前測試,可改 jsPDF + font embed |
| 6 | Drawer + Form 狀態同步複雜 | Week 4 自動儲存 BUG | 用 React Query 的 mutation 鎖定模式 |
| 7 | InBody 資料來源未整合 | 治療師端 ② 卡顯示不完整 | Week 2 假資料,Phase 2 接 InBody API |
| 8 | 客戶端 mobile RWD 細節 | Week 3 體驗差 | Week 1 元件已 RWD,Week 3 結尾全頁 audit |
| 9 | OAuth 還沒接,production 開放 | 安全隱憂 | ENABLE_DEV_AUTH_BYPASS 維持到 Phase 2 |
| 10 | 設計圖跟實作差距 > 10% | 看起來「不像 SaaS」 | Week 1-3 每天結尾對照 mockup 截圖 |

### 已決定要砍的功能(本次 6 週不做)

- ❌ Google OAuth(Phase 2 - 接 NextAuth 或自寫)
- ❌ 多診所 tenantId(Phase 2)
- ❌ Stripe 計費(Phase 2)
- ❌ LLM API 自動產生白話(Phase 2)
- ❌ Moti OCR(Phase 2)
- ❌ 3D 人體模型(永久不做,改用 2D 線稿)
- ❌ LINE / SMS / Email 推送(Phase 2,目前只做 shareCode 複製)
- ❌ 客戶帳號註冊(Phase 2,目前只做生日驗證)
- ❌ 處方完成度追蹤(客戶有沒有真的做)(Phase 2)
- ❌ 多治療師指派工作流(目前一個治療師)

---

## 9. 給 Claude Code 的開工指令模板

### 9.1 每週開工前的 Claude Code 指令模板

```
你好 Claude Code,

這週我要做 Week N 的任務,請參考:
- /WEB_ARCHITECTURE_PLAN.md Section 6 - Week N 部分
- /SYSTEM_ARCHITECTURE.md(系統現況、紅線、共用型別同步原則)
- /DESIGN_THERAPIST_v3.png(治療師端設計圖)
- /DESIGN_CLIENT_v2.png(客戶端設計圖)
- /USER_FLOW_v1.png(使用者流程圖)

開始前請:
1. 讀完上述文件
2. 給我這週的「準備改動檔案清單」+ 「關鍵型別 snippet」
3. 等我確認 OK,才動手

紀律(SYSTEM_ARCHITECTURE Section 8):
- 不自動 commit
- 不自動跑 pnpm db:push
- 改 schema 必產 migration
- 改完跑 pnpm check
- 改 shared 型別必須同步檢查 4 個地方
- 動手前先給檔案清單 + 型別 snippet
```

### 9.2 單一任務的 Claude Code 指令模板

```
Task: [任務名稱]

Context:
- 對應 WEB_ARCHITECTURE_PLAN.md Week N Day M
- 對應設計圖位置:[mockup v3 第 ⑤ 區塊 / client v2 hero block ...]

Specs:
- [具體要求列表]

Files expected to change:
- [檔案 1]
- [檔案 2]

Acceptance:
- [驗收條件 1]
- [驗收條件 2]

開始前先給我:
1. 你準備改的檔案清單(check 對不對)
2. 關鍵型別或 schema 的 snippet
3. 預估時間

等我確認 OK 才動手。
```

### 9.3 範例 A — Week 1 Day 0 Onboarding 指令(第一次開工用)

> **v1.1 新增**:Day 0 環境清點 + Branch + 文件搬移。
> 這個 prompt 給「整週開工時第一次跟 Claude Code 對話」用。
> Claude Code 讀完後給 A-E 回應 → 你確認 → 才接 Day 1 指令。

```
你好 Claude Code,

我是 Ian,史塔克運動科學評估系統的開發者。今天是 Week 1 Day 0,
我們要開始一個 6 週的網頁架構重構計畫。

== 第一階段:讀懂上下文 ==

請先讀完以下文件(依此順序):

1. SYSTEM_ARCHITECTURE.md
   → 系統現況、技術棧、紅線(_core)、共用型別同步原則

2. WEB_ARCHITECTURE_PLAN.md
   → 6 週重構計畫(這次開發的聖經)
   → 特別注意 Section 4.1(Tailwind v4 @theme 寫法)
   → Section 6 Week 1 Day 0-5 任務清單
   → Section 3.3 Migration 順序(0005-0010 共 6 個)

3. RAILWAY_DEPLOYMENT.md
   → Production 部署資訊

4. docs/design/DESIGN_THERAPIST_v3.png   ← 治療師端設計圖
5. docs/design/DESIGN_CLIENT_v2.png       ← 客戶端報告設計圖
6. docs/design/USER_FLOW_v1.png           ← 使用者流程圖

== 第二階段:確認理解 ==

讀完後請用以下格式回答(不要動手寫程式):

A. 你看到的系統現況摘要(3-5 句)
B. 你理解的 6 週計畫架構(WEB_ARCHITECTURE_PLAN.md Section 6 摘要)
C. 你看到的設計北極星方向(配色、字體、雙受眾架構)
D. 開發紀律確認:列出你會遵守的 5 條紀律
   (對照 SYSTEM_ARCHITECTURE Section 8)
E. 對這次重構,你有沒有任何疑問或建議?

== 第三階段:等我確認 ==

我看完你的回應 → 確認你理解正確 → 才會給你 Day 0 任務細項。

== 重要紀律 ==

- 不自動 commit
- 不自動跑 pnpm db:push
- 改 schema 必產 migration
- 改完跑 pnpm check 確認型別
- 動手前先給「準備改動檔案清單」+「型別 snippet」等我確認
- 不確定的事先問,不憑感覺寫
- 改 shared 型別必須同步檢查 4 個地方
- 不動 _core 紅線

開始讀文件,然後給我 A-E 五點回應。
```

### 9.4 範例 B — Week 1 Day 0 環境清點任務

> Onboarding 通過後,接下來這份 prompt 開始正式做事。
> Day 0 拆 3 個 Step,每個 Step 結束停下來確認。

```
Day 0 任務開始。請按 Step 1 → Step 2 → Step 3 順序執行,
每個 Step 結束停下來給我回報,不要連續做完。

═══════════════════════════════════
== Step 1 - 環境清點(只看不動)==
═══════════════════════════════════

執行並回報:

1. ls -la repo 根目錄,列出所有檔案
2. 列出 client/src 下面 CSS 檔結構
   (找 app.css / index.css / main.css 之類)
3. cat 出 client/src 主 CSS 檔的前 50 行
   (我要看現在 Tailwind 怎麼引入)
4. cat package.json 裡 tailwindcss 的版本號
   (確認是 v4.x.x)
5. 跑 grep -rn "#E8763A\|#F97316\|orange-" client/src/ \
     --include="*.tsx" --include="*.ts" --include="*.css" \
     --include="*.jsx"
   列出所有結果(但不要動任何檔案)

把上面 5 項結果完整貼給我 → 等我確認 → 才進 Step 2

═══════════════════════════════════════
== Step 2 - Branch 切換 + 文件搬移 ==
═══════════════════════════════════════

(等 Ian 確認 Step 1 後才執行)

1. git status(確認 worktree 乾淨)
2. git checkout main && git pull
3. git checkout -b feat/week1-foundation
4. 文件搬移:
   - WEB_ARCHITECTURE_PLAN.md → repo 根目錄
   - SYSTEM_ARCHITECTURE.md → repo 根目錄(若不在)
   - RAILWAY_DEPLOYMENT.md → repo 根目錄(若不在)
   - mkdir docs/design
   - DESIGN_THERAPIST_v3.png → docs/design/
   - DESIGN_CLIENT_v2.png → docs/design/
   - USER_FLOW_v1.png → docs/design/
5. git add . → git status 確認檔案列表 → 給我看
6. 不要 commit,等我確認 commit message

═══════════════════════════════════════════
== Step 3 - Day 1 預備(Tailwind v4 確認)==
═══════════════════════════════════════════

(等 Ian 確認 Step 2 後才執行)

基於 Step 1 看到的 CSS 檔結構,告訴我:

1. @theme inline 區塊建議插入哪個檔案?(app.css / index.css / 其他)
2. 該檔案目前有沒有現存的 @theme 或 :root token 定義?
3. 如果有 .css 檔需要新建,你建議檔名?
4. 字體載入要寫在 CSS @import 還是 index.html link?
   (理由給我聽)
5. Day 1 預估時間(寫 @theme + 引字體 + 測試)

不要動任何檔案,只給建議,等我裁決。
```

### 9.5 範例 C — Week 1 Day 1 寫 @theme 配置

> Day 0 結束後,Day 1 才開始實際寫 token。

```
Task: Week 1 Day 1 — Tailwind v4 @theme inline 設定

== Context ==
- WEB_ARCHITECTURE_PLAN.md Section 4.1 - 完整 Token 配置
- Day 0 Step 1 已確認的 CSS 檔位置:[填入]
- Day 0 Step 3 已決定的字體載入策略:[填入]

== Specs ==
1. 把 Section 4.1「完整 Token 配置」整段 @theme inline 寫進 [Day 0 確認的檔案]
2. 引入 Google Fonts(Plus Jakarta Sans, Inter, Noto Sans TC)
3. 設定 body 預設 font-family + bg-page color
4. 確認 Tailwind v4 自動產生對應 utility class
   (例如 bg-brand-primary, text-status-good)

== 不要做的事 ==
- 不要建 tokens.css(v1.0 plan 寫的,v1.1 修正:用 @theme inline)
- 不要動 tailwind.config.ts(v4 已不需要該檔)
- 不要動現有 _core 檔案
- 不要改舊 Page 元件的配色(Week 2-4 才做)

== Files expected to change ==
- [Day 0 確認的 CSS 檔案]

== Acceptance ==
1. pnpm check 過
2. pnpm dev 開首頁不爛
3. F12 看 computed style,某元素 color 可追溯到 var(--color-xxx)
4. 字體載入成功(F12 Network 看到 fonts.googleapis.com 200)
5. 隨便建一個 <div className="bg-brand-primary text-white"> 測試,
   背景是深靛藍 #1A2B4A

== 動手前先給我這 3 樣 ==
1. 完整 CSS 檔修改後的內容(我要 review)
2. 預計 1 個還是 2 個 commit(token 一個、字體一個?)
3. 預估時間

等我確認 OK 才動手寫檔案。
```

---

## 文件結束

**版本歷史:**
- v1.0 (2026/05/15) — Ian + Claude 共同制定,初版
- v1.1 (2026/05/15) — Claude Code onboarding 後補強
  - Section 4.1:Tailwind 從 v3 風格改為 v4 native `@theme inline`
    寫法(廢除 tokens.css + tailwind.config.ts 路徑)
  - Section 3.3:Migration 拆細為 0005-0010(原為 0005-0009),
    後續編號全部 +1
  - Section 6 Week 1:新增 Day 0(環境清點 + branch + 文件搬移)
  - Section 9:新增 Day 0 onboarding + 環境清點 + Day 1 三個範例
- v1.2 (2026/05/15) — Claude Code Day 0 Step 1 環境清點後補強
  - Section 4.1:字體載入從 CDN `@import url(...)` 改為
    `@fontsource/*` npm 套件 self-host
    (與既有 Geist 字體 self-host 模式一致)

**下次 review 時機:**
- 每週週末(Sunday)
- 任一 Week 完成時
- 任一 Week 風險爆掉時

**若有重大變動:**
- v1.x = 細節調整(不影響架構)
- v2.0 = 架構調整(影響 Section 2 或 6)

