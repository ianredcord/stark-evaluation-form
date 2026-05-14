import puppeteer from "puppeteer";
import type { Evaluation } from "../drizzle/schema";

/**
 * 生成評估表 PDF
 */
export async function generateEvaluationPDF(evaluation: Evaluation): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    
    // 設定頁面大小為 A4
    await page.setViewport({ width: 794, height: 1123 });
    
    // 生成 HTML 內容
    const htmlContent = generateHTMLContent(evaluation);
    
    // 載入 HTML
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    
    // 生成 PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "8mm",
        right: "8mm",
        bottom: "8mm",
        left: "8mm",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * 生成 HTML 內容 - 還原原始紙本設計風格
 */
function generateHTMLContent(evaluation: Evaluation): string {
  const functionalMovement = evaluation.functionalMovement as any || {};
  const redcordAssessment = evaluation.redcordAssessment as any || {};
  const trainingPlans = evaluation.trainingPlans as any[] || [];
  const photos = evaluation.photos as string[] || [];

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>史塔克初次評估表</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "Noto Sans TC", "Microsoft JhengHei", "微軟正黑體", sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #333;
      background: #FDEEE5;
    }
    
    .page {
      page-break-after: always;
      padding: 20px;
      background: #FDEEE5;
      min-height: 100vh;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    /* 頁首設計 - 還原原始風格 */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 15px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-image {
      height: 60px;
      width: auto;
    }
    
    .header-right {
      text-align: right;
    }
    
    .report-title {
      font-size: 24pt;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
    }
    
    .date-info {
      font-size: 12pt;
      color: #333;
    }
    
    .date-line {
      display: inline-block;
      border-bottom: 1px solid #333;
      min-width: 120px;
      margin-left: 5px;
    }
    
    /* 基本資料區塊 */
    .basic-info-row {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .basic-info-item {
      flex: 1;
      background: white;
      border: 2px solid #D35400;
      border-radius: 10px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
    }
    
    .basic-info-label {
      font-size: 10pt;
      color: #333;
      white-space: nowrap;
      margin-right: 5px;
    }
    
    .basic-info-value {
      flex: 1;
      font-size: 10pt;
      color: #333;
    }
    
    /* 區塊樣式 - 橘色圓角邊框 */
    .section {
      background: white;
      border: 2px solid #D35400;
      border-radius: 15px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    
    .section-dashed {
      background: white;
      border: 2px dashed #D35400;
      border-radius: 15px;
      margin-bottom: 12px;
      padding: 15px;
    }
    
    .section-content {
      padding: 12px 15px;
    }
    
    /* 症狀區塊內的標籤 */
    .symptom-row {
      margin-bottom: 8px;
    }
    
    .symptom-row:last-child {
      margin-bottom: 0;
    }
    
    .symptom-label {
      font-size: 10pt;
      color: #333;
      font-weight: 500;
    }
    
    .symptom-value {
      font-size: 10pt;
      color: #333;
      margin-left: 5px;
    }
    
    /* 頁面標題樣式 - 圓角矩形框 */
    .page-title {
      display: inline-block;
      border: 2px solid #D35400;
      border-radius: 8px;
      padding: 8px 30px;
      font-size: 18pt;
      font-weight: 700;
      color: #D35400;
      letter-spacing: 8px;
      margin: 20px auto;
      background: white;
    }
    
    .page-title-container {
      text-align: center;
      margin-bottom: 20px;
    }
    
    /* 圖片區塊 */
    .image-section {
      background: white;
      border: 2px dashed #D35400;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 15px;
      min-height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .image-section img {
      max-width: 100%;
      max-height: 320px;
      object-fit: contain;
    }
    
    .image-placeholder {
      color: #D35400;
      font-size: 14pt;
      font-weight: 500;
    }
    
    /* 功能性動作檢測表格 */
    .functional-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      background: white;
    }
    
    .functional-table th {
      background: #FEE8D6;
      border: 1px solid #D35400;
      padding: 10px 8px;
      font-weight: 600;
      color: #333;
    }
    
    .functional-table td {
      border: 1px solid #D35400;
      padding: 8px;
      vertical-align: top;
    }
    
    .functional-table .movement-cell {
      width: 200px;
      text-align: left;
    }
    
    .functional-table .performance-cell {
      width: 80px;
      text-align: center;
    }
    
    .functional-table .factor-cell {
      width: 100px;
      text-align: center;
    }
    
    .functional-table .condition-cell {
      text-align: left;
    }
    
    .movement-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }
    
    .movement-subtitle {
      font-size: 8pt;
      color: #666;
    }
    
    .sub-movement {
      padding-left: 15px;
      font-size: 9pt;
    }
    
    .factor-letters {
      letter-spacing: 3px;
    }
    
    .factor-selected {
      color: #D35400;
      font-weight: 700;
    }
    
    /* 紅繩動力鍊檢測表格 */
    .redcord-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      background: white;
    }
    
    .redcord-table th {
      background: #FEE8D6;
      border: 1px solid #D35400;
      padding: 6px 4px;
      font-weight: 600;
      color: #333;
    }
    
    .redcord-table td {
      border: 1px solid #D35400;
      padding: 4px;
      text-align: center;
    }
    
    .redcord-table .category-header {
      background: #FFF5EE;
      font-weight: 600;
      text-align: left;
      padding-left: 10px;
    }
    
    .redcord-table .item-name {
      text-align: left;
      padding-left: 15px;
    }
    
    .redcord-table .checkbox {
      width: 14px;
      height: 14px;
      border: 1px solid #D35400;
      display: inline-block;
      margin-right: 3px;
    }
    
    .redcord-table .checkbox.checked {
      background: #D35400;
    }
    
    .score-indicator {
      font-weight: 700;
    }
    
    /* 訓練計畫表格 */
    .training-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      background: white;
    }
    
    .training-table th {
      background: white;
      border: 1px solid #D35400;
      padding: 12px;
      font-weight: 600;
      color: #333;
    }
    
    .training-table td {
      border: 1px solid #D35400;
      padding: 15px 12px;
      text-align: left;
    }
    
    .training-table .session-cell {
      width: 120px;
      text-align: center;
    }
    
    /* 備註區塊 */
    .notes-section {
      background: white;
      border: 2px solid #D35400;
      border-radius: 25px;
      padding: 20px;
      min-height: 280px;
      margin-bottom: 20px;
    }
    
    .notes-title {
      display: inline-block;
      border: 2px solid #D35400;
      border-radius: 8px;
      padding: 6px 20px;
      font-size: 14pt;
      font-weight: 700;
      color: #333;
      letter-spacing: 5px;
      margin-bottom: 15px;
      background: white;
    }
    
    .notes-content {
      font-size: 10pt;
      line-height: 1.8;
    }
    
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 15px;
    }
    
    .photo-item {
      border: 1px solid #D35400;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .photo-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }
    
    /* 簽名區塊 */
    .signature-row {
      display: flex;
      gap: 40px;
      margin-top: 20px;
    }
    
    .signature-item {
      flex: 1;
      display: flex;
      align-items: center;
    }
    
    .signature-label {
      font-size: 11pt;
      color: #333;
      white-space: nowrap;
      margin-right: 10px;
    }
    
    .signature-line {
      flex: 1;
      border-bottom: 1px solid #333;
      min-height: 40px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 5px;
    }
    
    .signature-line img {
      max-height: 35px;
      max-width: 150px;
      object-fit: contain;
    }
    
    /* 輔助類 */
    .text-center {
      text-align: center;
    }
    
    .mb-10 {
      margin-bottom: 10px;
    }
    
    .mb-15 {
      margin-bottom: 15px;
    }
    
    .mt-15 {
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <!-- 第 1 頁：基本資料 -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="https://www.stark.works/cdn/shop/files/logo_stark.png" alt="史塔克 STARK WORKS" class="logo-image" />
      </div>
      <div class="header-right">
        <div class="report-title">初評報告</div>
        <div class="date-info">日期：<span class="date-line">${evaluation.date || ""}</span></div>
      </div>
    </div>
    
    <!-- 基本資料橫排 -->
    <div class="basic-info-row">
      <div class="basic-info-item">
        <span class="basic-info-label">姓名：</span>
        <span class="basic-info-value">${evaluation.clientName || ""}</span>
      </div>
      <div class="basic-info-item">
        <span class="basic-info-label">生日：</span>
        <span class="basic-info-value">${evaluation.birthday || ""}</span>
      </div>
      <div class="basic-info-item">
        <span class="basic-info-label">職業：</span>
        <span class="basic-info-value">${evaluation.occupation || ""}</span>
      </div>
      <div class="basic-info-item">
        <span class="basic-info-label">慣用手：</span>
        <span class="basic-info-value">${evaluation.dominantHand === "right" ? "右手" : evaluation.dominantHand === "left" ? "左手" : ""}</span>
      </div>
    </div>
    
    <!-- 目前症狀 -->
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">目前症狀部位：</span>
          <span class="symptom-value">${evaluation.currentSymptomLocation || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">引起症狀動作：</span>
          <span class="symptom-value">${evaluation.currentSymptomTrigger || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">針對此症狀的治療：</span>
          <span class="symptom-value">${evaluation.currentSymptomTreatment || ""}</span>
        </div>
      </div>
    </div>
    
    <!-- 過去症狀 -->
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">過去症狀部位：</span>
          <span class="symptom-value">${evaluation.pastSymptomLocation || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">引起症狀動作：</span>
          <span class="symptom-value">${evaluation.pastSymptomTrigger || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">針對此症狀的治療：</span>
          <span class="symptom-value">${evaluation.pastSymptomTreatment || ""}</span>
        </div>
      </div>
    </div>
    
    <!-- 最早症狀 -->
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">最早症狀部位：</span>
          <span class="symptom-value">${evaluation.earliestSymptomLocation || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">引起症狀動作：</span>
          <span class="symptom-value">${evaluation.earliestSymptomTrigger || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">針對此症狀的治療：</span>
          <span class="symptom-value">${evaluation.earliestSymptomTreatment || ""}</span>
        </div>
      </div>
    </div>
    
    <!-- 病史 -->
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">受傷史：</span>
          <span class="symptom-value">${evaluation.injuryHistory || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">骨折史：</span>
          <span class="symptom-value">${evaluation.fractureHistory || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">手術史：</span>
          <span class="symptom-value">${evaluation.surgeryHistory || ""}</span>
        </div>
      </div>
    </div>
    
    <!-- 醫學診斷 -->
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">醫學診斷：</span>
          <span class="symptom-value">${evaluation.medicalDiagnosis || ""}</span>
        </div>
      </div>
    </div>
    
    <!-- 用藥 -->
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">用藥：</span>
          <span class="symptom-value">${evaluation.medication || ""}</span>
        </div>
      </div>
    </div>
    
    <!-- 運動習慣 -->
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">運動習慣：</span>
          <span class="symptom-value">${evaluation.exerciseHabits || ""}</span>
        </div>
      </div>
    </div>
    
    <!-- 睡眠狀況 -->
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">睡眠狀況：</span>
          <span class="symptom-value">${evaluation.sleepCondition || ""}</span>
        </div>
      </div>
    </div>
    
    <!-- 目標與期待 -->
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">目標與期待：</span>
          <span class="symptom-value">${evaluation.goalsAndExpectations || ""}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 第 2 頁：Moti Physio 3D 姿勢檢測報告 -->
  <div class="page">
    <div class="image-section">
      ${evaluation.motiPhysioPage1 
        ? `<img src="${evaluation.motiPhysioPage1}" alt="Moti Physio 報告第一頁" />`
        : '<div class="image-placeholder">Moti Physio 3D 姿勢檢測報告第一頁</div>'
      }
    </div>
    
    <div class="image-section">
      ${evaluation.motiPhysioPage2 
        ? `<img src="${evaluation.motiPhysioPage2}" alt="Moti Physio 報告第二頁" />`
        : '<div class="image-placeholder">Moti Physio 3D 姿勢檢測報告第二頁</div>'
      }
    </div>
  </div>
  
  <!-- 第 3 頁：功能性動作檢測 (上半身) -->
  <div class="page">
    <div class="page-title-container">
      <div class="page-title">功 能 性 動 作 檢 測</div>
    </div>
    
    <table class="functional-table">
      <thead>
        <tr>
          <th class="movement-cell">動作</th>
          <th class="performance-cell">表現/疼痛</th>
          <th class="factor-cell">促進因素</th>
          <th class="condition-cell">狀況</th>
        </tr>
      </thead>
      <tbody>
        ${generateFunctionalMovementRows(functionalMovement, "upper")}
      </tbody>
    </table>
  </div>
  
  <!-- 第 4 頁：功能性動作檢測 (下半身/核心) -->
  <div class="page">
    <div class="page-title-container">
      <div class="page-title">功 能 性 動 作 檢 測</div>
    </div>
    
    <table class="functional-table">
      <thead>
        <tr>
          <th class="movement-cell">動作</th>
          <th class="performance-cell">表現/疼痛</th>
          <th class="factor-cell">促進因素</th>
          <th class="condition-cell">狀況</th>
        </tr>
      </thead>
      <tbody>
        ${generateFunctionalMovementRows(functionalMovement, "lower")}
      </tbody>
    </table>
  </div>
  
  <!-- 第 5 頁：紅繩動力鍊檢測 -->
  <div class="page">
    <div class="page-title-container">
      <div class="page-title">紅 繩 動 力 鍊 檢 測</div>
    </div>
    
    ${generateRedcordTableHTML(redcordAssessment)}
  </div>
  
  <!-- 第 6 頁：RONFIC 評估結果 -->
  <div class="page">
    <div class="page-title-container">
      <div class="page-title">RONFIC MINIPLUS 評估結果</div>
    </div>
    
    <div class="image-section" style="min-height: 300px;">
      ${evaluation.ronficMiniplusResult 
        ? `<img src="${evaluation.ronficMiniplusResult}" alt="RONFIC MINIPLUS 評估結果" />`
        : '<div class="image-placeholder">RONFIC MINIPLUS 評估結果</div>'
      }
    </div>
    
    <div class="page-title-container">
      <div class="page-title">RONFIC XIM 評估結果</div>
    </div>
    
    <div class="image-section" style="min-height: 300px;">
      ${evaluation.ronficXimResult 
        ? `<img src="${evaluation.ronficXimResult}" alt="RONFIC XIM 評估結果" />`
        : '<div class="image-placeholder">RONFIC XIM 評估結果</div>'
      }
    </div>
  </div>
  
  <!-- 第 7 頁：訓練計畫與備註 -->
  <div class="page">
    <div class="page-title-container">
      <div class="page-title">訓 練 計 畫</div>
    </div>
    
    <table class="training-table">
      <thead>
        <tr>
          <th class="session-cell">課堂</th>
          <th>訓練內容</th>
        </tr>
      </thead>
      <tbody>
        ${trainingPlans.length > 0 
          ? trainingPlans.map((plan: any) => `
            <tr>
              <td class="session-cell">${plan.session || ""}</td>
              <td>${plan.content || ""}</td>
            </tr>
          `).join("")
          : `
            <tr><td class="session-cell"></td><td></td></tr>
            <tr><td class="session-cell"></td><td></td></tr>
            <tr><td class="session-cell"></td><td></td></tr>
            <tr><td class="session-cell"></td><td></td></tr>
            <tr><td class="session-cell"></td><td></td></tr>
          `
        }
      </tbody>
    </table>
    
    <div class="mt-15">
      <div class="page-title-container">
        <div class="notes-title">備 註 欄 / 評 估 照 片</div>
      </div>
      
      <div class="notes-section">
        <div class="notes-content">${evaluation.notes || ""}</div>
        
        ${photos.length > 0 ? `
          <div class="photos-grid">
            ${photos.map((photo: string) => `
              <div class="photo-item">
                <img src="${photo}" alt="評估照片" />
              </div>
            `).join("")}
          </div>
        ` : ""}
      </div>
    </div>
    
    <div class="signature-row">
      <div class="signature-item">
        <span class="signature-label">客戶簽名：</span>
        <div class="signature-line">
          ${evaluation.clientSignature 
            ? `<img src="${evaluation.clientSignature}" alt="客戶簽名" />`
            : ""
          }
        </div>
      </div>
      <div class="signature-item">
        <span class="signature-label">教練簽名：</span>
        <div class="signature-line">
          ${evaluation.coachSignature 
            ? `<img src="${evaluation.coachSignature}" alt="教練簽名" />`
            : ""
          }
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 生成功能性動作檢測表格行
 */
function generateFunctionalMovementRows(data: any, section: "upper" | "lower"): string {
  const upperMovements = [
    { 
      category: "頸部屈曲/後仰", 
      subtitle: "Neck Flexion and Extension",
      items: [
        { name: "屈曲", key: "neck_flexion" },
        { name: "後仰", key: "neck_extension" }
      ]
    },
    { 
      category: "頸部左/右旋轉", 
      subtitle: "Neck Rotation",
      items: [
        { name: "左轉", key: "neck_left_rotation" },
        { name: "右轉", key: "neck_right_rotation" }
      ]
    },
    { 
      category: "肩關節屈曲/伸直", 
      subtitle: "Flexion / Extension",
      items: [
        { name: "左手", key: "shoulder_flexion_left" },
        { name: "右手", key: "shoulder_flexion_right" }
      ]
    },
    { 
      category: "肩關節外展", 
      subtitle: "Abduction / Adduction",
      items: [
        { name: "左手", key: "shoulder_abduction_left" },
        { name: "右手", key: "shoulder_abduction_right" }
      ]
    },
  ];

  const lowerMovements = [
    { 
      category: "軀幹前彎", 
      subtitle: "FLEXION",
      items: [
        { name: "", key: "trunk_flexion" }
      ]
    },
    { 
      category: "軀幹後仰", 
      subtitle: "",
      items: [
        { name: "", key: "trunk_extension" }
      ]
    },
    { 
      category: "軀幹旋轉", 
      subtitle: "External Rotation",
      items: [
        { name: "左轉", key: "trunk_left_rotation" },
        { name: "右轉", key: "trunk_right_rotation" }
      ]
    },
    { 
      category: "單腳站", 
      subtitle: "",
      items: [
        { name: "左腳", key: "single_leg_left" },
        { name: "右腳", key: "single_leg_right" }
      ]
    },
    { 
      category: "雙手高舉深蹲", 
      subtitle: "",
      items: [
        { name: "", key: "overhead_squat" }
      ]
    },
  ];

  const movements = section === "upper" ? upperMovements : lowerMovements;
  let html = "";

  movements.forEach(movement => {
    // 類別標題行
    html += `
      <tr>
        <td class="movement-cell" rowspan="${movement.items.length + 1}">
          <div class="movement-title">${movement.category}</div>
          ${movement.subtitle ? `<div class="movement-subtitle">${movement.subtitle}</div>` : ""}
        </td>
      </tr>
    `;
    
    // 子項目行
    movement.items.forEach(item => {
      const itemData = data[item.key] || {};
      const factors = itemData.factors || [];
      
      html += `
        <tr>
          <td class="performance-cell">${item.name}</td>
          <td class="factor-cell">
            <span class="factor-letters">
              ${["A", "B", "C", "D", "E"].map(f => 
                factors.includes(f) 
                  ? `<span class="factor-selected">${f}</span>` 
                  : f
              ).join(" ")}
            </span>
          </td>
          <td class="condition-cell">${itemData.condition || ""}</td>
        </tr>
      `;
    });
  });

  return html;
}

/**
 * 生成紅繩動力鍊檢測表格 HTML
 */
function generateRedcordTableHTML(data: any): string {
  interface RedcordItem {
    code: string;
    name: string;
    hasRL: boolean;
    special?: string;
  }

  interface RedcordCategory {
    name: string;
    items: RedcordItem[];
  }

  const categories: RedcordCategory[] = [
    {
      name: "下肢",
      items: [
        { code: "SPL", name: "臀大肌", hasRL: true },
        { code: "SB", name: "股後腿肌群", hasRL: true },
        { code: "ABD", name: "臀中肌", hasRL: true },
        { code: "ADD", name: "內收肌群", hasRL: true },
        { code: "PB", name: "腹部肌群", hasRL: true },
        { code: "SKF", name: "腿後腱肌群", hasRL: true },
        { code: "PHF", name: "腰大肌", hasRL: true },
      ],
    },
    {
      name: "核心",
      items: [
        { code: "SLS", name: "", hasRL: false, special: "Pain" },
        { code: "PLS", name: "", hasRL: false, special: "Pain" },
        { code: "KLS", name: "", hasRL: false, special: "Pain" },
      ],
    },
    {
      name: "上肢",
      items: [
        { code: "Scapular Depression", name: "下斜方肌", hasRL: true },
        { code: "Scapular Protraction", name: "前鋸肌", hasRL: true },
        { code: "Scapular Retraction", name: "菱形肌", hasRL: true },
        { code: "Shoulder Extension", name: "闊背肌", hasRL: true },
        { code: "Push up", name: "胸大肌/肱三頭肌", hasRL: true },
        { code: "Pull up", name: "後三角肌/二頭肌", hasRL: true },
      ],
    },
    {
      name: "頸部",
      items: [
        { code: "Cervical setting", name: "", hasRL: false, special: "Pain" },
        { code: "Cervical Retraction", name: "", hasRL: false, special: "Pain" },
        { code: "Cervical Rotation", name: "", hasRL: false, special: "Pain" },
        { code: "Cervical Extension", name: "", hasRL: false, special: "Pain" },
        { code: "Cervical Sidebending", name: "", hasRL: false, special: "Pain" },
      ],
    },
  ];

  let html = `
    <table class="redcord-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 180px;">Redcord 懸吊訓練</th>
          <th colspan="2" style="width: 40px;"></th>
          <th colspan="4" style="width: 100px;">評分</th>
          <th colspan="7" style="width: 140px;">6 Work load/ 其他配件</th>
          <th colspan="2" style="width: 80px;">訓練側：__次 x__ 組</th>
        </tr>
        <tr>
          <th style="width: 20px;">R</th>
          <th style="width: 20px;">L</th>
          <th>0(</th>
          <th>)1</th>
          <th>2</th>
          <th>3</th>
          <th>1</th>
          <th>2</th>
          <th>3</th>
          <th>4</th>
          <th>5</th>
          <th>6</th>
          <th>AXIS/Stimula</th>
          <th>__X__</th>
        </tr>
      </thead>
      <tbody>
  `;

  categories.forEach(category => {
    html += `<tr><td class="category-header" colspan="16">${category.name}</td></tr>`;
    
    category.items.forEach(item => {
      const itemData = data[item.code] || {};
      const rData = itemData.R || {};
      const lData = itemData.L || {};
      
      if (item.hasRL) {
        // R 行
        html += `
          <tr>
            <td class="item-name" rowspan="2">☐ ${item.code}${item.name ? ` (${item.name})` : ""}</td>
            <td>R</td>
            <td></td>
            <td>${rData.score === 0 ? "●" : "0("}</td>
            <td>${rData.score === 1 ? "●" : ")1"}</td>
            <td>${rData.score === 2 ? "●" : "2"}</td>
            <td>${rData.score === 3 ? "●" : "3"}</td>
            <td>${rData.workload === 1 ? "●" : "1"}</td>
            <td>${rData.workload === 2 ? "●" : "2"}</td>
            <td>${rData.workload === 3 ? "●" : "3"}</td>
            <td>${rData.workload === 4 ? "●" : "4"}</td>
            <td>${rData.workload === 5 ? "●" : "5"}</td>
            <td>${rData.workload === 6 ? "●" : "6"}</td>
            <td>AXIS/ Stimula</td>
            <td>__X__</td>
          </tr>
        `;
        // L 行
        html += `
          <tr>
            <td></td>
            <td>L</td>
            <td>${lData.score === 0 ? "●" : "0("}</td>
            <td>${lData.score === 1 ? "●" : ")1"}</td>
            <td>${lData.score === 2 ? "●" : "2"}</td>
            <td>${lData.score === 3 ? "●" : "3"}</td>
            <td colspan="8"></td>
          </tr>
        `;
      } else {
        // 單行（核心/頸部）
        html += `
          <tr>
            <td class="item-name">☐ ${item.code}</td>
            <td colspan="2"></td>
            <td colspan="4">☐ ${item.special || "Pain"}</td>
            <td colspan="6">${category.name === "核心" ? "呼吸/骨盆底肌教學" : ""}☐ Stimula</td>
            <td colspan="2">__ 秒 X__</td>
          </tr>
        `;
      }
    });
  });

  // 其他動作
  html += `
    <tr>
      <td class="category-header" colspan="16">其他動作</td>
    </tr>
    <tr>
      <td class="item-name">☐</td>
      <td colspan="2"></td>
      <td>0(</td>
      <td>)1</td>
      <td>2</td>
      <td>3</td>
      <td>1</td>
      <td>2</td>
      <td>3</td>
      <td>4</td>
      <td>5</td>
      <td>6</td>
      <td>AXIS/ Stimula</td>
      <td>__X__</td>
    </tr>
  `;

  html += `
      </tbody>
    </table>
  `;

  return html;
}
