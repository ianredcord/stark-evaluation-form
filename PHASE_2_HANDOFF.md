# Phase 2 Handoff — Remove Manus `_core/`

> 接手指南。新 session 第一件事 `cat PHASE_2_HANDOFF.md`,然後決定要不要動工。

## TL;DR

Production 穩定中。Phase 1(runtime auto-migrate)已驗證可用。Phase 2 是把 Manus 平台留下的 `_core/` 整套換成我們自己的實作 —— **不急,先讓 production 跑幾天確認沒問題再動**。

---

## 目前 Production 狀態(2026-05-16)

- GitHub: `ianredcord/stark-evaluation-form`,主分支 `main`
- Railway project: `thriving-reflection`,domain 自動部署於每次 main push
- 已合併 14 個 PR(landing / atomic design / OAuth / RBAC / runtime migrator)
- DB: MySQL 8(Railway managed),migration 跑到 `0006_small_sphinx.sql`
- 登入:Google OAuth via `arctic` 3.7.0(server/auth/google.ts,**不**經過 `_core/oauth.ts`)
- 權限:5-tier RBAC(super_admin / admin / therapist / assistant / viewer)+ status(active / disabled)
- Owner 自動升級:`OWNER_EMAIL_DOMAIN=stark.works` env 控制
- 驗證:`auth.me` 回傳 `role: "super_admin"`、`status: "active"` 正常

### Railway ENV(不要動)

```
DATABASE_URL=mysql://...
JWT_SECRET=...
NODE_ENV=production
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://<railway-domain>/api/auth/google/callback
OWNER_EMAIL_DOMAIN=stark.works
ENABLE_DEV_AUTH_BYPASS=true   # Phase 2 完成 + OAuth 驗證 OK 後改 false
VITE_APP_ID=...
OWNER_OPEN_ID=google:...      # 你的 Google sub,作為 super_admin fallback
```

---

## Phase 2 範圍:替換 `server/_core/*`

目標:**完全移除** `server/_core/` 整個資料夾,不再依賴 Manus 平台 runtime。

### 必須替換的 8 個檔案

| 檔案 | 目前作用 | 替換方案 |
|---|---|---|
| `server/_core/index.ts` | Express app 入口 + 註冊 OAuth/tRPC 路由 | 拆成 `server/index.ts`,用 express 直接組裝 |
| `server/_core/sdk.ts` | `createSessionToken` JWT 簽 | 用 `jose` 直接寫,~30 行 |
| `server/_core/cookies.ts` | `getSessionCookieOptions(req)` | 直接 inline 或寫個小 helper |
| `server/_core/env.ts` | `ENV.ownerOpenId` 等讀取 | 直接 `process.env.*` |
| `server/_core/trpc.ts` | tRPC initTRPC + Context type | 標準 tRPC v11 setup |
| `server/_core/context.ts` | createContext 從 req 解 cookie 驗 JWT | 配合上面的 sdk 重寫 |
| `server/_core/vite.ts` | Vite dev middleware + SSR 處理 | 抄 `vite` 官方 express integration |
| `server/_core/systemRouter.ts` | system.* tRPC route(version 等) | 移到 `server/routers.ts` 或刪 |
| `server/_core/oauth.ts` | 舊版 OAuth(我們沒在用) | 直接刪 |
| `server/_core/dataApi.ts` `llm.ts` `imageGeneration.ts` `map.ts` `notification.ts` `voiceTranscription.ts` | Manus 平台 SDK | 都沒用到,直接刪 |

### Client 端 `_core/`

`client/src/_core/` 也要清。主要是 trpc client + auth hook,大多 import 自 `_core/sdk` 系列。

### shared/_core/

`shared/_core/` 多是 const + types,可直接搬到 `shared/` 根目錄。

---

## 已知陷阱(這兩次都搞掛 production)

### 1. Schema migration 必須先有自動 apply 機制
**PR #9 教訓**:加了 `users.status` 欄位 + Drizzle code 直接用,但 migration 沒跑 → 每次 `auth.me` 都 `Unknown column 'status'` → 整站 500。  
**修法**:Phase 1 在 `package.json` `start` script 鏈 `node dist/migrate.js && node dist/index.js`。Phase 2 千萬別拆掉這條 chain。

### 2. Railway `preDeployCommand` 會讓 service 啟不起來
**PR #11 教訓**:`railway.json` 加 `preDeployCommand: "pnpm db:migrate"` → 502。原因不明,Railway docs 寫得到但實際行為不一致。  
**修法**:用 `start` script chain,**不要碰** railway.json 的 preDeployCommand。

---

## Phase 2 建議步驟

1. **開新 worktree** `.claude/worktrees/phase2-decore` 從 `main` 切
2. **先寫 server 端**:
   - `server/index.ts` 取代 `_core/index.ts`
   - `server/auth/session.ts` 寫 JWT helpers(用 `jose`)
   - `server/auth/cookies.ts` 寫 cookie helpers
   - `server/trpc.ts` 標準 tRPC setup
3. **改 import**:全 repo grep `from "@/_core` / `from "../_core` 一個一個換
4. **改 build script**:`esbuild server/index.ts` 取代 `server/_core/index.ts`
5. **本機跑通**`pnpm dev` 確認 Google OAuth + tRPC + 評估表 CRUD 都正常
6. **本機跑通**`pnpm build && pnpm start`(模擬 Railway)
7. **PR 上去,先看 Railway preview**,沒問題再 merge
8. **最後刪 `_core/` 整個資料夾** + `client/src/_core` + `shared/_core`

### 何時可以動?

- ✅ 至少看 production 穩跑 7 天沒有 500
- ✅ 沒有 pending 客戶評估流程在跑
- ✅ 有完整 1-2 小時 block(不是片段時間)

---

## 還沒做完的清單(不在 Phase 2 範圍,但記著)

- LINE Login server route(Login.tsx 按鈕已 disabled,UI 在,寫 server 就行)
- Page 1-7 從 `EvaluationFormContext` 改成 tRPC(目前舊 wizard 還在用 context)
- Puppeteer PDF(目前用 `window.print()`)
- OAuth Consent Screen 發佈(目前 Testing mode 只有 ian@stark.works)
- `ENABLE_DEV_AUTH_BYPASS=false`(Phase 2 之後關)
- WCAG AA 掃一遍

---

## 新 session 開場 prompt(複製貼上)

```
請先 cat PHASE_2_HANDOFF.md 然後盤點以下幾件事再開工:

1. production 目前狀態(curl https://<railway-domain>/api/auth/me 看)
2. server/_core/ 還有哪些檔案被 import
3. shared/_core/ 和 client/src/_core/ 的內容
4. 建議的 Phase 2 切分順序(我希望最多 3 個 PR)

盤點完先給我計畫,我同意後再動工。不要直接開幹。
```
