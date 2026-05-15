# 史塔克初評報告系統 TODO

## 設計系統與基礎架構
- [x] 建立橘色主題配色系統（CSS 變數）
- [x] 設定字體與排版樣式
- [x] 建立圓角邊框與卡片樣式

## 多頁表單導航與共用元件
- [x] 開發多頁表單導航元件（7 頁進度追蹤）
- [x] 建立共用表單輸入元件（文字、日期、選擇）
- [x] 建立共用表格元件（功能性動作檢測用）
- [x] 建立評分選擇元件（A-E、0-3 評分）

## 第 1 頁：基本資料與病史
- [x] 基本資料區塊（姓名、生日、職業、慣用手）
- [x] 目前/過去/最早症狀區塊
- [x] 病史區塊（受傷史、骨折史、手術史）
- [x] 醫學診斷、用藥、運動習慣、睡眠狀況、目標與期待

## 第 2 頁：Moti Physio 3D 姿勢檢測報告
- [x] 圖片上傳區塊（第一頁報告）
- [x] 圖片上傳區塊（第二頁報告）

## 第 3-4 頁：功能性動作檢測
- [x] 頸部屈曲/後仰檢測表格
- [x] 頸部左/右旋轉檢測表格
- [x] 肩關節屈曲/伸直檢測表格
- [x] 肩關節外展檢測表格
- [x] 軀幹前彎/後仰檢測表格
- [x] 軀幹旋轉檢測表格
- [x] 單腳站檢測表格
- [x] 雙手高舉深蹲檢測表格

## 第 5 頁：紅繩動力鍊檢測
- [x] 下肢項目評分表格（SPL、SB、ABD、ADD、PB、SKF、PHF）
- [x] 核心項目評分表格（SLS、PLS、KLS）
- [x] 上肢項目評分表格（6 項）
- [x] 頸部項目評分表格（5 項）
- [x] 其他動作評分欄位

## 第 6 頁：RONFIC 評估結果
- [x] RONFIC MINIPLUS 評估結果圖片上傳
- [x] RONFIC XIM 評估結果圖片上傳

## 第 7 頁：訓練計畫與備註
- [x] 訓練計畫表格（課堂 + 訓練內容）
- [x] 備註欄/評估照片上傳區塊
- [x] 客戶簽名欄
- [x] 教練簽名欄

## 後端功能
- [x] 資料庫 Schema 設計與建立
- [x] 評估表 CRUD API
- [x] 圖片上傳 API（S3 整合）
- [x] 電子簽名儲存 API

## PDF 生成
- [x] PDF 模板設計（還原原始風格）
- [x] PDF 生成 API
- [x] PDF 下載功能

## 測試與優化
- [x] 表單驗證測試
- [x] PDF 輸出測試
- [ ] 響應式設計優化

## 範本功能
- [x] 範本資料庫 Schema 設計
- [x] 範本 CRUD API
- [x] 範本管理頁面（列表、新增、編輯、刪除）
- [x] 新建評估時的範本選擇功能
- [x] 從現有評估儲存為範本功能
- [x] 範本套用到表單功能

## PDF 樣式優化
- [x] 分析原始 PDF 設計風格（配色、字體、表格樣式）
- [x] 優化 PDF 頁首設計（Logo、標題、日期）
- [x] 優化基本資料區塊排版
- [x] 優化功能性動作檢測表格樣式
- [x] 優化紅繩動力鍊檢測表格樣式
- [x] 優化訓練計畫區塊排版
- [x] 優化簽名區塊設計
- [x] 調整整體頁面邊距與間距

## Logo 整合
- [x] 從官方網站獲取 Logo 圖片
- [x] 整合 Logo 到網頁介面
- [x] 整合 Logo 到 PDF 輸出

## 問題修復
- [x] PDF 匯出功能無法使用
- [x] 說明儲存功能的資料儲存位置

## PDF 下載功能改進
- [x] 修改 PDF 匯出為直接下載檔案（而非開啟新分頁）

## PDF 下載問題修復（第二次）
- [x] 改用直接連結方式下載 PDF（而非 fetch + blob）
- [x] 確保跨瀏覽器相容性
- [x] 新增「下載 PDF」按鈕作為備用下載方式

## 下載按鈕顯示問題修復
- [x] 修復「下載 PDF」按鈕沒有顯示的問題
- [x] 新增 PDF 下載連結顯示區（含下載按鈕、複製連結、連結顯示）

## 正式網址 PDF 下載問題修復
- [ ] 在正式網址測試 PDF 下載功能
- [ ] 診斷並修復無法下載的問題

## 正式環境 PDF 生成問題修復
- [x] 診斷 Puppeteer 在正式環境無法運行的問題
- [x] 改用前端列印方式生成 PDF
- [x] 測試正式環境 PDF 生成功能

## PDF 完整 7 頁修復
- [x] 診斷 PDF 只有 2 頁的問題
- [x] 補充第 2 頁：Moti Physio 3D 姿勢檢測報告
- [x] 補充第 3 頁：功能性動作檢測（上半身）
- [x] 補充第 4 頁：功能性動作檢測（下半身/核心）
- [x] 補充第 5 頁：紅繩動力鍈檢測
- [x] 補充第 6 頁：RONFIC 評估結果
- [x] 測試完整 7 頁 PDF 生成和下載

## PDF 資料綁定問題修復
- [x] 修復第 2 頁姿勢檢測報告圖片顯示（已整合圖片 URL）
- [x] 修復第 3-4 頁功能性動作檢測資料顯示（已正確綁定資料結構）
- [x] 修復第 5 頁紅繩動力鍈檢測資料顯示（已正確綁定資料結構）
- [x] 修復第 6 頁 RONFIC 評估結果圖片顯示（已整合圖片 URL）
- [x] 修復第 7 頁訓練計畫資料顯示（已正確綁定資料結構）
- [x] 修復客戶簽名顯示（用戶需點擊確認按鈕儲存簽名）
- [x] 修復教練簽名顯示（用戶需點擊確認按鈕儲存簽名）

## PDF 第 3 頁格式修正
- [x] 修正 PDF 第 3 頁格式與填表頁面一致
- [x] 加入分組標題（頸部屈曲/後仰、頸部左/右旋轉、肩關節屈曲/伸直、肩關節外展）
- [x] 修正項目名稱（屈曲、後仰、左轉、右轉、左手、右手）
- [x] 正確顯示表現/疼痛欄位的值
- [x] 正確顯示促進因素（A-E）

## PDF 第 4 頁格式修正（下半身/核心）
- [x] 檢查第 4 頁填表頁面的分組結構
- [x] 修正 PDF 第 4 頁格式與填表頁面一致
- [x] 加入分組標題（軄幹前彎、軄幹後仰、軄幹旋轉、單腳站、雙手高舉深蹲）
- [x] 修正項目名稱（前彎、後仰、左轉、右轉、左腳、右腳、深蹲）
- [x] 測試 PDF 輸出

## PDF 第 5 頁格式修正（紅繩動力鍈檢測）
- [x] 檢查第 5 頁填表頁面的結構
- [x] 修正 PDF 第 5 頁格式與填表頁面一致
- [x] 修正下肢項目表格格式（R/L 分行、勾選框、英文+中文副標題）
- [x] 修正核心項目表格格式（Pain 勾選框、呼吸/骨盆底肌教學、秒數 X 次數）
- [x] 修正上肢項目表格格式（R/L 分行、英文+中文副標題）
- [x] 修正頸部項目表格格式（Pain 和 Stimula 勾選框）
- [x] 測試 PDF 輸出

## PDF 第 6 頁格式修正（RONFIC 評估結果）
- [x] 檢查第 6 頁填表頁面的結構
- [x] 修正 PDF 第 6 頁格式與填表頁面一致
- [x] 修正 MINIPLUS 圖片區塊格式（橘色邊框圓角標題 + 虛線邊框圖片區）
- [x] 修正 XIM 圖片區塊格式（橘色邊框圓角標題 + 虛線邊框圖片區）
- [x] 測試 PDF 輸出

## PDF 第 7 頁格式修正（訓練計畫）
- [x] 檢查第 7 頁填表頁面的結構
- [x] 修正 PDF 第 7 頁格式與填表頁面一致
- [x] 修正訓練計畫表格格式（橘色邊框圓角標題 + 課堂/訓練內容表格）
- [x] 修正備註/評估照片區塊格式（橘色邊框圓角標題 + 備註文字區 + 虛線邊框圖片區）
- [x] 修正簽名區塊格式（客戶簽名 + 教練簽名並排顯示）
- [x] 測試 PDF 輸出

## PDF 檔案大小優化
- [x] 分析目前 PDF 生成器的設定
- [x] 降低 html2canvas 的 scale 參數（從 2 降到 1）
- [x] 降低 JPEG 圖片品質（從 PNG 改為 JPEG 60%）
- [x] 測試優化後的 PDF 檔案大小（77MB → 315KB，遠低於 1MB 目標）

## PDF 清晰度優化
- [x] 分析 PDF 模糊的原因（scale=1 和 JPEG 60% 品質太低）
- [x] 提高 html2canvas 的 scale 參數（從 1 提高到 1.5）
- [x] 提高 JPEG 圖片品質（從 60% 提高到 80%）
- [x] 測試優化後的 PDF 品質和檔案大小（743KB，文字清晰可讀）

## PDF 第 3-4 頁合併
- [x] 檢查目前 PDF 第 3-4 頁的模板結構
- [x] 合併功能性動作檢測（上半身）和（下半身/核心）為一頁（左右兩欄排版）
- [x] 調整排版讓內容更滿版
- [x] 測試合併後的 PDF 輸出（7 頁 → 6 頁，648KB）


## PDF 第 3-4 頁排版調整
- [x] 將功能性動作檢測頁面從左右排列改為上下排列
- [x] 上半身區塊在上方，下半身/核心區塊在下方
- [x] 保持全寬表格以提高可讀性
- [x] 測試 PDF 輸出格式


## 評估照片上傳欄位擴充
- [x] 分析現有第 7 頁評估照片上傳結構
- [x] 新增兩個額外的照片上傳欄位（總共 3 個並排）
- [x] 更新表單資料結構支援多張照片
- [x] 更新 PDF 模板顯示三張評估照片
- [x] 測試照片上傳和 PDF 輸出功能

## SaaS Week 1：處方建議系統（Task 02-04）
- [x] Task 02：建立 `shared/prescriptionKB.ts` 處方知識庫骨架
- [x] Task 02：高優先 4 項（hkaRight/roundShoulder/lumbarLordosis/shoulderDiff）warn+danger 範例內容
- [x] Task 03：新增第 8 頁「處方建議」UI（自動帶出失衡項目 + 四欄處方卡片）
- [x] Task 03：更新 FormNavigation 至 8 頁（含「處方建議」標籤）
- [x] Task 04：`shared/evaluation.ts` 加 `PrescriptionSelection` 型別
- [x] Task 04：`drizzle/schema.ts` 加 `prescriptions json` 欄 + migration 0005
- [x] Task 04：`server/routers.ts` evaluationInputSchema 加 prescriptions
- [x] Task 04：EvaluationFormContext 加 `updatePrescriptions` action
- [x] Task 04：EvaluationForm.tsx save/load mapping 含 prescriptions
- [ ] Task 04：實機驗收 — 完整跑 1 份 Page 1-8 評估，重新整理勾選還在
- [ ] 處方知識庫補完其他 8 項失衡（Phase 2）

## SaaS Week 4：多診所隔離（Task 13）
- [x] `users` / `evaluations` / `evaluationTemplates` 加 `clinicId varchar(64)` 欄（migration 0007）
- [x] `db.ts` 加 `getEvaluationsForClinic` / `getTemplatesForClinic`（自己 ∪ 同診所）
- [x] `routers.ts` 抽出 `canAccessEvaluation()` 共用權限檢查（owner / 同診所 / admin）
- [x] evaluation/template 的 list/get/update/delete/createFromEvaluation 全面切到診所視野
- [x] create 時自動帶上 `ctx.user.clinicId`
- [x] dev bypass 支援 `OWNER_CLINIC_ID` 環境變數
- [x] `upsertUser` 同步寫入 clinicId
- [x] 更新測試 mock（`getEvaluationsForClinic`、user.clinicId）
- [ ] 實機驗收 — 兩位使用者設同 clinicId 應互看評估，不同則隔離

## PDF 補完第 8 頁處方建議
- [x] `client/src/lib/pdfGenerator.ts` 加 `renderPrescriptionSection` helper
- [x] PDF 模板加入第 8 頁（處方建議）— 4 欄選中項目 + 治療師備註
- [x] EvaluationForm 匯出 PDF 時帶上 prescriptions 欄位
- [x] 條件性渲染：無勾選時不產生第 8 頁

## 治療師體驗增強
- [x] EvaluationForm header 加「預覽報告」按鈕（產生 shareCode 並開新分頁）

## 測試補完
- [x] 新增 `server/report.test.ts`：7 個測試（getByShareCode 過濾欄位、view count、shareCode 驗證、generateShareLink 冪等與權限）
- [x] 全套測試 27/27 通過

## SaaS Week 2：客戶端線上互動報告（Task 05-08）
- [x] Task 05：`drizzle/schema.ts` 加 `shareCode/sharedAt/viewCount` 欄 + migration 0006
- [x] Task 05：`server/db.ts` 加 `getEvaluationByShareCode/setShareCode/incrementViewCount`
- [x] Task 05：`server/routers.ts` 新增 `report.getByShareCode` publicProcedure（過濾敏感欄位）
- [x] Task 05：`server/routers.ts` 新增 `evaluation.generateShareLink` mutation
- [x] Task 05：`/report/:shareCode` 路由與 PublicReport.tsx
- [x] Task 05：治療師端 EvaluationForm 加「分享連結」按鈕（複製到剪貼簿）
- [x] Task 06：RiskRing 環形進度條（整體失衡風險指數）
- [x] Task 06：ImbalanceCard 12 項失衡卡片（進度條、等級徽章、可展開「為什麼/影響」）
- [x] Task 06：BodyMap 簡化人體圖（前/側/背三視圖 + 紅點標記）
- [x] Task 07：PrescriptionTabs 處方四欄分頁（筋膜/穴位/運動/儀器）
- [x] Task 08：手機優先響應式設計 + 史塔克 logo + 橘色主題
- [x] Task 08：頁腳 "Powered by Stark Evaluation"
- [ ] Task 05：實機驗收 — 治療師複製連結，無痕視窗用手機瀏覽器看
- [ ] 客戶端文案微調（目前 explanation 為合理 placeholder,Ian 可覆蓋）
