# Railway 部署備忘錄

> Production 部署架構與環境變數參考。
> 不含密碼,密碼在 Railway 後台。

---

## 部署架構

```
┌──────────────────────────────────────────┐
│ Railway Project: thriving-reflection      │
│                                           │
│   ┌────────────────────────────────┐    │
│   │ stark-evaluation-form           │    │
│   │ (Node.js Express server)        │    │
│   │ Port: 8080 (auto-detected)      │    │
│   │ Region: US West                 │    │
│   │ Domain:                         │    │
│   │   stark-evaluation-form-        │    │
│   │   production.up.railway.app     │    │
│   └────────┬────────────────────────┘    │
│            │                              │
│            │ Reference: ${{MySQL.URL}}    │
│            ↓                              │
│   ┌────────────────────────────────┐    │
│   │ MySQL Service                   │    │
│   │ Version: 8                      │    │
│   │ Volume: mysql-volume            │    │
│   │ Internal: *.railway.internal    │    │
│   │ Public: yamanote.proxy.rlwy.net │    │
│   └────────────────────────────────┘    │
│                                           │
└──────────────────────────────────────────┘
```

## 環境變數清單(Production)

| 變數 | 值 | 備註 |
|------|-----|------|
| DATABASE_URL | `${{MySQL.MYSQL_URL}}` | Railway reference,密碼自動同步 |
| JWT_SECRET | (48-byte base64) | 安全亂數,只在 Railway 後台 |
| NODE_ENV | production | 顯式設定 |
| VITE_APP_ID | stark | 識別字串 |
| OWNER_OPEN_ID | ianredcord | 系統管理員(對應 dev bypass user) |
| ENABLE_DEV_AUTH_BYPASS | true | Hotfix 3,Week 3 移除 |

⚠️ 不設的變數(留 undefined,程式碼 `?? ""` 處理):
- OAUTH_SERVER_URL
- BUILT_IN_FORGE_API_URL
- BUILT_IN_FORGE_API_KEY

⚠️ PORT 由 Railway 自動注入,不要手動設

## 自動部署流程

```
本地 git push origin main
    ↓
GitHub repo: ianredcord/stark-evaluation-form
    ↓
Railway 偵測 main branch push
    ↓
自動觸發 build
    ├── pnpm install (含 puppeteer Chromium 下載)
    ├── pnpm build
    │   ├── vite build (前端)
    │   └── esbuild (後端打包到 dist/)
    └── Push image
    ↓
自動觸發 deploy
    ├── 啟動 Container
    └── pnpm start → node dist/index.js
    ↓
Service 變 Active (~6-10 分鐘總計)
```

## Migration 流程

Production DB migration 不會自動跑,要手動觸發:

```bash
# 從本地連 Railway public DB
DATABASE_URL="mysql://root:<password>@yamanote.proxy.rlwy.net:<port>/railway" \
  pnpm db:push

# password 從 Railway → MySQL service → Variables → MYSQL_PUBLIC_URL 取得
# 用完不要把這串字寫進任何檔案
```

紀律:
- 不要把 `MYSQL_PUBLIC_URL` 寫進專案 `.env`(會 commit 上去)
- 用 inline 環境變數方式跑指令(`DATABASE_URL="..." pnpm db:push`)
- 跑完後 `history -c` 清掉 zsh history(zsh history 會記錄密碼)
- 剪貼簿用完清空(`pbcopy < /dev/null`)

## 監看部署

```
1. Build log:
   Railway dashboard → service → Deployments → 點某筆 → Build logs

2. Runtime log:
   Railway dashboard → service → Deployments → 點某筆 → Deploy logs
   (或 Observability tab)

3. HTTP 測試:
   curl -sI https://stark-evaluation-form-production.up.railway.app
   curl -s https://stark-evaluation-form-production.up.railway.app/api/trpc/auth.me
```

## 已知問題與限制

### Hobby plan 限制

- $5/月,含 $5 usage credit
- 超過 $5 用量會額外計費(目前估計月用量 $3-7)
- 1 vCPU、限制較多但對小流量 OK

### Region 在 US West

- 從台灣訪問延遲 ~200ms
- Edge node 在新加坡(`x-railway-edge: asia-southeast1-eqsg3a`)
- 對 SaaS MVP 階段可接受
- 換 region 需要重建整個 project,Phase 2 再評估

### Hotfix 3 安全注意

- `ENABLE_DEV_AUTH_BYPASS=true` 等於任何訪問者都能進系統
- 目前 URL 不公開,只給診所同事內部測試
- Week 3 接 Google OAuth 後移除這個變數

## 緊急處理

### Service 掛了

1. Railway dashboard → Deployments → 看最新 deployment 狀態
2. 如果 "Failed" → 看 Deploy logs 找錯誤
3. 可以 Rollback 到上一個 active deployment(Deployments → 舊筆 → Rollback)

### DB 連不上

1. 確認 MySQL service 仍 Active
2. 確認 `DATABASE_URL` 還是 Reference 模式
3. Restart service(在 Deployments tab redeploy)

### 環境變數誤改

1. Railway 變數有歷史紀錄(Variables tab)
2. 可以從歷史 revert

文件結束。
