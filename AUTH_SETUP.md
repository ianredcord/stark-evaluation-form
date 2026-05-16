# Auth Setup Guide

Phase 2 接入 Google + LINE OAuth 的完整步驟。MVP 階段先用
`ENABLE_DEV_AUTH_BYPASS=true`,當你準備好 credentials 後依本文件操作。

---

## 為什麼選 Google + LINE

| Provider | 適合場景 |
|----------|---------|
| **Google** | 史塔克診所 + 合作診所有 Google Workspace 帳號。跨裝置同步、安全性高、業界標準。 |
| **LINE** | 治療師習慣用 LINE 跟客戶聯絡。登入後未來可直接從 STARK 後台 push 訊息給客戶(Phase 2.5)。 |

兩個並行 — 治療師選自己順手的。客戶端**不需要登入**(走 shareCode + 生日驗證)。

---

## 整體架構

```
[User Browser]
     ↓
[/auth/login]
     ↓
[STARK Server] -- /api/auth/google -->  Google OAuth Server
              -- /api/auth/line   -->  LINE Login Server
              <-- callback with code --
              ↓
     交換 access_token → 取得 email / displayName
              ↓
     upsert into users table
              ↓
     設定 session cookie (JWT)
              ↓
     redirect → /clients
```

需要的 server-side 程式:
- `server/auth/google.ts` — handle `/api/auth/google` + `/api/auth/google/callback`
- `server/auth/line.ts` — handle `/api/auth/line` + `/api/auth/line/callback`
- 共用的 `server/auth/session.ts` 已存在(`server/_core/auth.ts`),只要在 callback 結尾 setSessionCookie

建議用 **`arctic`** 套件(輕量,只處理 OAuth flow,不綁 framework):

```bash
pnpm add arctic
```

不要用 NextAuth — 那是 Next.js 專用,我們是 Express。

---

## Step 1:Google OAuth 申請

### 1.1 建立 Google Cloud Project

1. 開 https://console.cloud.google.com/
2. 上方 project selector → **New Project**
3. Project name:`stark-evaluation-form`
4. 建好後 enter project

### 1.2 啟用 OAuth Consent Screen

1. 左邊選單 → **APIs & Services → OAuth consent screen**
2. User Type:**External**(讓任何 Google 帳號都能登入)
3. 必填欄位:
   - **App name**:STARK 運動科學評估系統
   - **User support email**:你的 email
   - **App logo**:上傳 STARK logo(可選)
   - **Application home page**:https://stark-evaluation-form-production.up.railway.app
   - **Authorized domains**:`up.railway.app`(production)+ `localhost`(本地)
   - **Developer contact**:你的 email
4. **Scopes**:不用加(預設 openid / profile / email 已夠)
5. **Test users**:加你自己 + 同事的 Gmail(production 前用)
6. 之後改 **Publishing status → In production**(對外開放後)

### 1.3 建 OAuth Client ID

1. 左邊選單 → **APIs & Services → Credentials**
2. 上方 **+ CREATE CREDENTIALS → OAuth client ID**
3. Application type:**Web application**
4. Name:`stark-server`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:3001
   https://stark-evaluation-form-production.up.railway.app
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/google/callback
   http://localhost:3001/api/auth/google/callback
   https://stark-evaluation-form-production.up.railway.app/api/auth/google/callback
   ```
7. Create → 拿到 **Client ID** 和 **Client Secret**(**Secret 不要外洩,不要 commit**)

### 1.4 設定環境變數

**本地**(`.env`,**不要 commit**):
```bash
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

**Railway production**:
```bash
GOOGLE_CLIENT_ID=同上
GOOGLE_CLIENT_SECRET=同上
GOOGLE_REDIRECT_URI=https://stark-evaluation-form-production.up.railway.app/api/auth/google/callback
ENABLE_DEV_AUTH_BYPASS=false   # 接通後關掉
```

---

## Step 2:LINE Login 申請

### 2.1 建立 LINE Developers Provider + Channel

1. 開 https://developers.line.biz/console/
2. 用你的 LINE 帳號登入
3. **Create a new provider**:`STARK Health`(出現在登入畫面上)
4. 進 provider → **Create a new channel** → **LINE Login**
5. 必填:
   - **Channel name**:STARK 運動科學評估
   - **Channel description**:史塔克診所運動科學評估系統登入
   - **App types**:**Web app**(勾選)
   - **Email address**:你的 email
6. 同意條款 → Create

### 2.2 設定 Callback URL

1. Channel 內 → **LINE Login** tab
2. **Callback URL**:
   ```
   http://localhost:3001/api/auth/line/callback
   https://stark-evaluation-form-production.up.railway.app/api/auth/line/callback
   ```
3. **OpenID Connect** → **Email address permission** → 申請(LINE 會要求填表單,~1 天審核)
4. **Scopes**:勾 `profile` + `openid` + `email`(email 要等審核過)

### 2.3 拿 credentials

1. Channel 內 → **Basic settings** tab
2. 紀錄:
   - **Channel ID**(用於環境變數)
   - **Channel secret**(隱藏文字框)
3. **不要分享給任何人,不要 commit**

### 2.4 設定環境變數

**本地**:
```bash
LINE_CHANNEL_ID=xxxxxxxxxx
LINE_CHANNEL_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINE_REDIRECT_URI=http://localhost:3001/api/auth/line/callback
```

**Railway production**:
```bash
LINE_CHANNEL_ID=同上
LINE_CHANNEL_SECRET=同上
LINE_REDIRECT_URI=https://stark-evaluation-form-production.up.railway.app/api/auth/line/callback
```

---

## Step 3:Server 實作清單

由 Claude Code 來做(等你拿到 credentials 後告訴我「Phase 2 開工」)。預估 1-2 天。

```
□ pnpm add arctic
□ server/auth/google.ts
  - GET /api/auth/google → redirect to Google with state
  - GET /api/auth/google/callback → 交換 token → upsert user → setCookie → redirect /clients
□ server/auth/line.ts
  - GET /api/auth/line → redirect to LINE
  - GET /api/auth/line/callback → 同上
□ users table 加欄位
  - googleId varchar(64) unique
  - lineId varchar(64) unique
  - avatarUrl text
  - migration 0006
□ Login.tsx 兩個按鈕拔掉 disabled
□ Set ENABLE_DEV_AUTH_BYPASS=false on Railway(production)
□ Settings 安全章節「目前登入方式」改顯示真實 provider
□ /api/auth/logout 清 cookie + redirect /
```

---

## Step 4:安全紀律

| 規則 | 為什麼 |
|------|--------|
| `.env` 加進 `.gitignore`(已加) | 不外洩 credentials |
| Client Secret 永遠不放 client bundle | 它只在 server 用 |
| Redirect URI 完全匹配(包含 trailing slash)| OAuth provider 嚴格比對 |
| State parameter(arctic 自動處理)| 防 CSRF |
| PKCE(arctic 自動處理 — Google 必須)| 防 code interception |
| Production secrets 用 Railway variables(不放程式)| 部署紀律 |
| 改 Google scope 要重新 publish OAuth consent | 否則 user 同意畫面不會更新 |
| LINE email 要等審核(可能 1-7 天)| 申請通常會過,但要排時間 |

---

## 之後:Logout / 帳號切換

`/api/auth/logout` 既存(`COOKIE_NAME` 清掉)。前端 sidebar 加一個 logout 按鈕,點了打 `/api/auth/logout` → redirect `/`。

---

## 之後:綁定多個 provider

進階場景:同一個治療師用 Google 也用 LINE 進來,要識別為同一個 user。

- 用 email 當主要 identity
- users table 用 email unique
- 第二次 login 用同 email → 接到既有 user
- 加 `linkedProviders json`:`["google", "line"]`

這套 Phase 2.5 處理,MVP 不做。

---

## 你現在要做的(按順序)

1. **跑 Google 申請**(Step 1)— ~30 分鐘
2. **跑 LINE 申請**(Step 2,**email 審核要等 1-7 天**)— ~20 分鐘 + 等審核
3. credentials 都拿到後,跟 Claude Code 說「**Auth 接好了,Phase 2 開工**」
4. Claude Code 執行 Step 3 server 實作 + 拔 disabled

期間 production 維持 dev bypass,正常使用沒影響。
