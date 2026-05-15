> ⚠️ **DEPRECATED — 2026/05/15 起本文件不再維護**
>
> 這份 MASTER_PLAN.md 是 Manus 時代的 4 週 MVP 路線圖,已被
> [`WEB_ARCHITECTURE_PLAN.md`](./WEB_ARCHITECTURE_PLAN.md) 完全取代。
>
> 保留本文件僅為歷史脈絡參考。所有 Week 1-6 的開發任務、
> Migration 順序、設計北極星對照,請看新文件。
>
> ---

# Stark Evaluation System · 4-Week SaaS MVP 主計畫

> 這份文件是給 Claude Code 看的。
> 作者:Ian(史塔克診所) + Claude.ai
> 目標:1 個月內把現有評估工具,改造成可給「客戶 + 試用診所」使用的初版 SaaS

---

## 文件結構

1. [背景與目標](#1-背景與目標)
2. [核心轉變](#2-核心轉變-從評估工具到-saas)
3. [4 週路線圖總覽](#3-4-週路線圖)
4. [每週詳細任務](#4-每週詳細任務)
5. [架構決策](#5-架構決策)
6. [紅線與限制](#6-紅線與限制)
7. [驗證機制](#7-驗證機制每週的決定點)

---

## 1. 背景與目標

### 1.1 系統現況(Day 1)

- 從 Manus 平台導出的 React + tRPC + Drizzle + MySQL 全棧應用
- 目前是「**單一治療師的內部評估工具**」,7 頁評估表 + PDF 匯出
- 已完成 commit:
  - Initial: Manus 原始版本
  - fix(auth): OAuth dev bypass
  - feat: Moti 12-risk-item structured input (Task 01)
  - fix(db): text → longtext for image/signature columns

### 1.2 目標(Day 30)

**能讓「史塔克診所 + 1 位友好同行」實際做評估、客戶能在手機上看到互動報告。**

具體 KPI:
- 史塔克診所完成 5 份真實客戶評估
- 5 份報告都產出**線上連結**(不只 PDF),並寄給客戶
- 至少 3 位客戶**真的點開連結看過**(用 analytics 驗證)
- 1 位同行(可由診所同事扮演)使用過 3 次以上,給出書面 feedback

### 1.3 不在這 1 個月內做的事

明確排除:

- ❌ OCR 自動辨識(延後到 Phase 2)
- ❌ Stripe 計費系統(延後)
- ❌ 多診所完整租戶隔離(只做最小版)
- ❌ 客戶 APP(只做網頁版)
- ❌ 教練影片整合(只做 YouTube 連結)
- ❌ PDF 高品質重新美化(改用 Puppeteer 出 PDF 但不重新設計)
- ❌ FPS 中醫證型評估(這是進階版功能)

---

## 2. 核心轉變:從評估工具到 SaaS

### 2.1 三個關鍵轉變

```
轉變 1:單一使用者 → 多角色
  原本:只有「治療師」一種角色
  新版:治療師(內部)+ 客戶(外部,只看自己的報告)

轉變 2:封閉系統 → 可分享連結
  原本:資料只能透過治療師的 PDF 給客戶
  新版:每份評估有 shareCode,產生 /report/[shareCode] 公開頁

轉變 3:純資料記錄 → 客戶體驗
  原本:重點是「資料存得對不對」
  新版:重點是「客戶看了會不會覺得有價值」
```

### 2.2 為什麼是「線上互動報告」,不是「美化 PDF」

| 比較 | 美化 PDF | 線上互動報告 |
|------|---------|------------|
| 客戶感受 | 「我拿到一張漂亮的紙」 | 「我有專屬健康管家」 |
| 回客率 | 取決於記憶 | 系統可以提醒 |
| 客戶看得懂 12 項數值嗎 | 不容易 | 每項可點開解釋 |
| 治療師可以做的差異化 | 跟同行差不多 | 明顯領先 |
| SaaS 賣點 | 不夠強 | 強 |

**結論:這個月的開發重心是線上報告,PDF 只做夠用的版本**。

---

## 3. 4 週路線圖

```
Week 1:核心功能(治療師流程)
   Task 02: 處方知識庫骨架(JSON 結構)
   Task 03: 第 8 頁「處方產生」介面
   Task 04: 處方資料寫入 DB
   驗證:你自己完整跑 1 份評估

Week 2:線上互動報告(客戶端)
   Task 05: /report/[shareCode] 路由與資料模型
   Task 06: 失衡視覺化區塊(進度條 + 簡化人體圖)
   Task 07: 處方分標籤呈現(筋膜/穴位/運動/儀器)
   Task 08: 響應式設計(手機優先)
   驗證:你做 1 份評估,自己用手機看連結

Week 3:基礎部署 + 認證
   Task 09: Google OAuth 替代 dev bypass
   Task 10: S3 (或 Cloudflare R2) 圖片儲存
   Task 11: Railway 部署
   Task 12: 自訂網域 + HTTPS
   驗證:診所內部 2 人能各自登入、評估資料互相獨立

Week 4:打磨 + 試用
   Task 13: 最小版多診所隔離(tenantId)
   Task 14: 真實做 5 份評估,蒐集 UX 問題
   Task 15: 修最痛的 3 個問題
   Task 16: PDF 重新整理(用 Puppeteer 後端渲染)
   驗證:1 位同行(內部同事扮演)實際試用 3 次
```

---

## 4. 每週詳細任務

### Week 1 · 核心功能

#### Task 02:處方知識庫(JSON 結構)

**目標**:設計「Moti 失衡項 → 四欄處方」的對應結構,以 JSON 形式存在程式碼裡(這個月不做後台編輯介面)。

**改動**:

1. 新增 `shared/prescriptionKB.ts`,定義型別與初始資料:

```typescript
export interface PrescriptionItem {
  id: string;                    // 唯一 ID,例如 "fascia-piriformis"
  category: "fascia" | "acupoint" | "exercise" | "device";
  title: string;                 // 例如「梨狀肌筋膜放鬆」
  description: string;           // 詳細說明
  duration?: string;              // 例如「3 分鐘」
  notes?: string;                 // 治療師提示
  // 之後可擴充:image, video, reference 等
}

export interface PrescriptionForRiskLevel {
  itemKey: MotiRiskKey;
  level: "warn" | "danger";       // 只對警惕/危險產出處方
  fascia: PrescriptionItem[];
  acupoint: PrescriptionItem[];
  exercise: PrescriptionItem[];
  device: PrescriptionItem[];
}

export const PRESCRIPTION_KB: PrescriptionForRiskLevel[] = [
  // 先填高優先 4 項:hkaRight, roundShoulder, lumbarLordosis, shoulderDiff
  // 其他 8 項先留空陣列,Phase 2 補
];
```

2. 高優先 4 項的具體處方內容,**Ian 會在動工後另外提供**。先放佔位符 `// TODO: Ian provides content`。

**驗收**:
- `pnpm check` 過
- import `PRESCRIPTION_KB` 取得結構化資料
- 高優先 4 項的型別檢查通過

---

#### Task 03:第 8 頁「處方產生」介面

**目標**:新增 Page 8 給治療師工作用 — 顯示這份評估的失衡項目,旁邊有四欄處方建議,治療師可勾選哪些要進報告。

**改動**:

1. `client/src/components/pages/Page8Prescription.tsx`(新檔)
2. `client/src/pages/EvaluationForm.tsx` 進度條 7 → 8
3. `shared/evaluation.ts` 新增 `Prescription` 型別:

```typescript
export interface PrescriptionSelection {
  riskItemKey: MotiRiskKey;
  selectedFasciaIds: string[];
  selectedAcupointIds: string[];
  selectedExerciseIds: string[];
  selectedDeviceIds: string[];
  customNotes: string;            // 治療師額外備註
}

export interface EvaluationFormData {
  // ...existing
  prescriptions: PrescriptionSelection[];
}
```

4. `drizzle/schema.ts` 新增 `prescriptions: json("prescriptions")` 欄位
5. Page 8 UI:
   - 上方顯示「本次評估的失衡項目」(列出 warn/danger 的項目)
   - 對每個失衡項目,顯示四欄 cards(從 PRESCRIPTION_KB 抓對應建議)
   - 每張 card 有「✓ 加入處方」按鈕
   - 最下方有「治療師備註」textarea

**UX 約束**:
- 沿用既有橘色主題與圓角設計
- 處方建議卡片要看起來「有資訊密度」,不是空殼
- 對「沒處方知識庫」的項目(目前 8 項),顯示「處方知識庫建構中」灰色佔位

**驗收**:
- Page 8 顯示這份評估的失衡項目
- 對有處方的項目,可以勾選四欄
- 儲存後,prescriptions 資料寫入 DB
- 重新整理,選擇還在

---

#### Task 04:處方資料寫入 DB + tRPC 整合

**目標**:Page 8 的勾選結果與 PRESCRIPTION_KB 結合,變成「實際處方」存進 DB。

**改動**:
- `server/routers.ts` 的 evaluationInputSchema 加 `prescriptions`
- `client/src/pages/EvaluationForm.tsx` 的 save/load mapping 加 `prescriptions`
- `client/src/contexts/EvaluationFormContext.tsx` 加 `updatePrescription` action

**驗收**:
- 完整跑 1 份評估,Page 1-8 都填,儲存
- 重新開那份評估,Page 8 的勾選正確還原
- 資料庫直接 query 看到 prescriptions JSON 正確

---

### Week 2 · 線上互動報告

#### Task 05:`/report/[shareCode]` 路由與資料模型

**目標**:每份評估產生一個公開 shareCode,客戶用這個連結看自己的報告。

**改動**:

1. `drizzle/schema.ts` 在 `evaluations` 新增:
   - `shareCode: varchar("shareCode", { length: 32 })` (nanoid)
   - `sharedAt: timestamp` (產生連結的時間)
   - `viewCount: int` (簡單計數,客戶看了幾次)

2. `server/routers.ts` 新增 publicProcedure(無認證):
   - `report.getByShareCode(shareCode)`:回傳評估資料,但**過濾敏感欄位**(例如不回傳治療師備註)

3. `client/src/pages/PublicReport.tsx`(新檔):
   - 路由 `/report/:shareCode`
   - 完全獨立的 layout(不顯示治療師導航列)

4. `client/src/App.tsx` 新增路由

**驗收**:
- 治療師頁面有「複製分享連結」按鈕,產生 `localhost:3000/report/xxx`
- 開無痕視窗(模擬未登入客戶)貼連結,看到報告頁
- 看不到「儲存」「生成 PDF」這類治療師按鈕

---

#### Task 06:失衡視覺化

**目標**:用視覺化方式呈現 12 項失衡,讓客戶看了一眼就懂。

**UI 元素**:

1. **頂部 hero**:
   - 大字「您的體態評估報告」
   - 「整體失衡風險指數 43 / 100」用環形進度條視覺化
   - 「警惕」三個字用顯眼顏色

2. **12 項失衡網格**(響應式,手機 1 欄、桌機 2 欄):
   - 每張卡片:項目名稱 + 數值 + 失衡等級徽章 + 進度條
   - 點開卡片,展開「為什麼會這樣」+「日常影響」說明
   - 文案先放 placeholder,Ian 之後提供

3. **簡化人體圖**:
   - 不用 3D,用 SVG 簡化版前/側/背三視圖
   - 在問題部位標紅點,點擊連結到對應卡片

**技術選擇**:
- 用 framer-motion(專案已有)做進場動畫
- 響應式用 Tailwind 內建斷點
- 不引入新的圖表庫,recharts(專案已有)夠用

**驗收**:
- 手機開啟 /report/xxx 完整呈現,不破版
- 進度條 / 環形圖動畫流暢
- 客戶看不懂可以點開卡片看解釋

---

#### Task 07:處方分標籤呈現

**目標**:客戶能清楚看到「我該做什麼」。

**UI**:

```
┌──────────────────────────────────────┐
│ 您的個人化處方                          │
├──────────────────────────────────────┤
│ [筋膜放鬆] [穴位調理] [運動處方] [儀器] │
│ ▔▔▔▔▔▔                              │
│                                       │
│ ▸ 梨狀肌筋膜放鬆                       │
│   3 分鐘,每天早晚                      │
│   [點開看做法]                         │
│                                       │
│ ▸ 髂脛束滾筒放鬆                       │
│   2 分鐘                              │
│                                       │
└──────────────────────────────────────┘
```

- 用 Radix Tabs(專案已有 shadcn/ui)
- 每個 item 預設摺疊,點開看詳情
- 詳情包含 description + 圖片(預留位置,先空白)

---

#### Task 08:響應式設計與品牌化

- 手機優先設計(因為客戶大多用手機)
- 史塔克 logo + 橘色主題
- 簡單的浮水印「Powered by Stark Evaluation」(SaaS 賣點)

---

### Week 3 · 部署 + 認證

#### Task 09:Google OAuth

替代 dev bypass。用 Google OAuth 2.0(免費、客戶都有 Google 帳號)。

關鍵改動:
- `server/_core/sdk.ts` 是 Manus 的不要動
- 新增 `server/auth/google.ts` 平行實作
- 環境變數 `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- 治療師端用 Google 登入
- 客戶端**不用登入**,shareCode 即可看報告

#### Task 10:S3 / Cloudflare R2 圖片儲存

把 `ImageUpload` 改成上傳到 R2(Cloudflare R2 對 S3 API 相容,但便宜很多)。

關鍵改動:
- 用 `@aws-sdk/client-s3`(專案已有)接 R2
- `ImageUpload.tsx` 傳 `onUpload={uploadToR2}` 取代預設的 base64
- 既有 base64 資料保留,新評估走 R2

#### Task 11-12:Railway 部署 + 網域

- Railway 一鍵部署 Node + MySQL
- 接自訂網域(例如 stark.app)
- HTTPS 自動(Railway 內建)

---

### Week 4 · 打磨

#### Task 13:最小版多診所隔離

只做最低限度:
- `evaluations` 表加 `clinicId`
- 治療師登入後,只看到自己 clinic 的資料
- 不做完整邀請/角色系統,「同事用同一個 clinicId」就行

#### Task 14-15:真實試用 + 修問題

不寫程式,做評估、收 feedback、修最痛的。

#### Task 16:PDF 重新整理

從 html2canvas → Puppeteer 後端渲染。PDF 品質提升,但設計不重做(那是 Phase 2)。

---

## 5. 架構決策

### 5.1 為什麼處方知識庫先做 JSON,不做資料庫表

- 月底前要驗證的是「處方內容客戶買單嗎」,不是「治療師能不能編輯處方庫」
- JSON 改動快、Git 追蹤、不需要管理介面
- Phase 2 再把它搬到 DB + 後台

### 5.2 為什麼客戶端報告用 shareCode 不用登入

- 客戶不會為了看一份報告去註冊帳號
- shareCode = nanoid(20 字元),足夠安全且不可猜測
- 風險:連結若外洩,他人可看 → 可接受,因為報告本身不含敏感醫療資訊
- Phase 2 可加「需要輸入手機末 3 碼驗證」之類

### 5.3 為什麼用 Cloudflare R2 不用 AWS S3

- R2 沒有 egress fee(S3 有,客戶看圖會被收流量費)
- R2 對 S3 API 相容,程式碼幾乎一樣
- 月費對小流量幾乎 $0

### 5.4 為什麼不重新美化 PDF

- 客戶會看的是線上版,不是 PDF
- PDF 只有兩種用途:列印(治療師自己)+ 法律存檔
- 這兩種用途不需要超精美設計
- 把精力投在線上版,CP 值高 5 倍以上

---

## 6. 紅線與限制

### 6.1 程式碼不可動的目錄

- `server/_core/` — Manus 平台基礎建設
- `client/src/_core/` — Manus 平台前端 hooks

### 6.2 不要做的事

- 不要在這個月接 Anthropic / OpenAI API(下個月做 AI 建議處方)
- 不要重寫 Page 1-7(優化可以,重寫不行)
- 不要做完整的 SaaS 計費(下個月)
- 不要把 FPS 中醫證型評估塞進來(進階版)

### 6.3 commit 紀律

- 每個 Task 完成才 commit(不要中途 commit)
- commit message 用 conventional commits:`feat:` `fix:` `chore:` `refactor:`
- 動 schema 一定要產 migration,不要手改 SQL

---

## 7. 驗證機制(每週的決定點)

### Week 1 結束

**問自己**:我能跑完一份評估,從 Page 1 到 Page 8 嗎?
- ✅ → 進 Week 2
- ❌ → 修問題,Week 2 縮減範圍

### Week 2 結束

**問自己**:用手機開那份報告連結,我覺得這個比 PDF 厲害嗎?
- ✅ → 進 Week 3
- ❌ → 找出最弱的環節,修一輪,可能要動 Task 06/07 設計

### Week 3 結束

**問自己**:能上線了嗎?同事可以登入嗎?
- ✅ → 進 Week 4
- ❌ → 修部署問題,Week 4 縮減範圍

### Week 4 結束

**問自己**:我有 1 份真實 feedback 嗎?
- ✅ → Phase 2 開始(OCR、計費、進階功能)
- ❌ → 為什麼沒人想用?重新審視產品定位

---

## 8. 重要原則

### 對 Claude Code 的紀律重申

1. **動手前先讀檔案**:任何 Task 開始前,先讀相關檔案理解現狀
2. **不憑記憶寫**:確認既有元件、型別、模式後再動手
3. **動手前先給計畫**:每個 Task 動手前,列出檔案清單給 Ian 確認
4. **不要批量改動**:一次一個 Task,完成驗收才開始下一個
5. **不自動 commit**:Ian 驗收 OK 才 commit
6. **共用型別同步**:改 `shared/evaluation.ts` 時同步檢查 schema/routers/Pages/pdfGenerator

### 對 Ian 的紀律提醒

1. **不要在 Week X 想 Week X+2 的事**:Week 1 不要煩計費怎麼做
2. **每週 5 是驗證日,不寫程式**:強迫你跳出寫 code 模式,以「使用者」角度看
3. **覺得「快了快了」是危險信號**:代表你略過驗證,趕進度
4. **Phase 2 才是賺錢的階段,Phase 1 是學習**:這個月不要期待「賣得動」

---

## 9. 下一步

1. Ian 確認這份計畫無誤
2. Claude Code 進入 Task 02:處方知識庫骨架
3. Ian 提供高優先 4 項的具體處方內容(筋膜手法、穴位、運動、儀器參數)

文件結束。
