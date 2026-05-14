import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  MOTI_THRESHOLDS,
  MOTI_LEVEL_LABEL,
  MotiRiskKey,
  MotiRiskValues,
} from "../../../shared/evaluation";

function renderMotiRiskSection(motiRiskValues: MotiRiskValues | undefined | null): string {
  if (!motiRiskValues) return "";

  const keys = Object.keys(MOTI_THRESHOLDS) as MotiRiskKey[];
  const allItemsEmpty = keys.every((k) => {
    const item = motiRiskValues[k];
    return !item || item.value === null || item.value === undefined;
  });
  const overall = motiRiskValues.overallRiskIndex;
  const overallEmpty = overall === null || overall === undefined;

  if (allItemsEmpty && overallEmpty) return "";

  const rows = keys
    .map((key) => {
      const def = MOTI_THRESHOLDS[key];
      const item = motiRiskValues[key];
      const value = item?.value;
      const levelKey = item?.level;
      const levelLabel =
        levelKey === "maintain" || levelKey === "warn" || levelKey === "danger"
          ? MOTI_LEVEL_LABEL[levelKey]
          : "";
      return `
        <tr>
          <td style="padding: 6px 10px; border: 1px solid #D35400;">${def.name}</td>
          <td style="padding: 6px 10px; border: 1px solid #D35400; text-align: center;">${
            value === null || value === undefined ? "" : `${value}${def.unit}`
          }</td>
          <td style="padding: 6px 10px; border: 1px solid #D35400; text-align: center;">${levelLabel}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="margin-top: 20px;">
      ${
        !overallEmpty
          ? `
        <div style="background: white; border: 2px solid #D35400; border-radius: 12px; padding: 12px 20px; margin-bottom: 12px; display: flex; align-items: baseline; justify-content: space-between;">
          <span style="color: #D35400; font-weight: 600; font-size: 12pt;">整體失衡風險指數</span>
          <span style="font-size: 24pt; font-weight: 700; color: #333;">${overall}<span style="font-size: 12pt; color: #888; font-weight: 400;"> / 100</span></span>
        </div>
      `
          : ""
      }
      <div style="background: #FEE8D6; border: 2px solid #D35400; border-radius: 15px; padding: 6px 15px; margin-bottom: 8px; text-align: center;">
        <span style="color: #D35400; font-weight: 600; font-size: 11pt;">Moti 12 項風險數值</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt; background: white;">
        <thead>
          <tr>
            <th style="background: #FEE8D6; border: 1px solid #D35400; padding: 8px; font-weight: 600;">項目</th>
            <th style="background: #FEE8D6; border: 1px solid #D35400; padding: 8px; font-weight: 600; width: 100px;">數值</th>
            <th style="background: #FEE8D6; border: 1px solid #D35400; padding: 8px; font-weight: 600; width: 100px;">失衡等級</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/**
 * 前端 PDF 生成器
 * 將 HTML 內容轉換為 PDF 檔案
 */
export async function generatePDFFromElement(
  elementId: string,
  filename: string = "evaluation.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}

/**
 * 從評估資料生成 PDF HTML 內容
 */
export function generatePDFHTML(evaluation: any): string {
  const functionalMovement = evaluation.functionalMovement || {};
  const redcord = evaluation.redcordAssessment || {};
  const trainingPlans = evaluation.trainingPlans || [];
  const photos = evaluation.photos || [];

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #333;
      background: #FDEEE5;
    }
    
    .page {
      page-break-after: always;
      padding: 20px;
      background: #FDEEE5;
      width: 210mm;
      min-height: 297mm;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    
    .logo-image {
      height: 60px;
      width: auto;
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
    
    .section {
      background: white;
      border: 2px solid #D35400;
      border-radius: 15px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    
    .section-content {
      padding: 12px 15px;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: 600;
      color: #D35400;
      margin-bottom: 10px;
    }
    
    .symptom-row {
      margin-bottom: 8px;
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
    
    .page-title-container {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .page-title {
      display: inline-block;
      border: 2px solid #D35400;
      border-radius: 8px;
      padding: 8px 30px;
      font-size: 18pt;
      font-weight: 700;
      color: #D35400;
      letter-spacing: 8px;
      background: white;
    }
    
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
    }
    
    .functional-table td {
      border: 1px solid #D35400;
      padding: 8px;
    }
    
    .functional-table .group-header td {
      background: rgba(254, 232, 214, 0.5);
      border-bottom: 1px solid #D35400;
      padding: 8px 12px;
    }
    
    .group-title {
      font-weight: 600;
      color: #333;
      font-size: 10pt;
    }
    
    .group-subtitle {
      font-size: 8pt;
      color: #888;
      margin-left: 8px;
    }
    
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
    }
    
    .redcord-table td {
      border: 1px solid #D35400;
      padding: 4px;
      text-align: center;
    }
    
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
    }
    
    .training-table td {
      border: 1px solid #D35400;
      padding: 15px 12px;
    }
    
    .notes-section {
      background: white;
      border: 2px solid #D35400;
      border-radius: 25px;
      padding: 20px;
      min-height: 200px;
      margin-bottom: 20px;
    }
    
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
    }
  </style>
</head>
<body>
  <!-- 第 1 頁：基本資料 -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="https://www.stark.works/cdn/shop/files/logo_stark.png" alt="史塔克" class="logo-image" />
      </div>
      <div class="header-right">
        <div class="report-title">初評報告</div>
        <div class="date-info">日期：${evaluation.date || ""}</div>
      </div>
    </div>
    
    <div class="basic-info-row">
      <div class="basic-info-item">
        <span class="basic-info-label">姓名：</span>
        <span>${evaluation.clientName || ""}</span>
      </div>
      <div class="basic-info-item">
        <span class="basic-info-label">生日：</span>
        <span>${evaluation.birthDate || ""}</span>
      </div>
      <div class="basic-info-item">
        <span class="basic-info-label">職業：</span>
        <span>${evaluation.occupation || ""}</span>
      </div>
      <div class="basic-info-item">
        <span class="basic-info-label">慣用手：</span>
        <span>${evaluation.dominantHand === "right" ? "右手" : evaluation.dominantHand === "left" ? "左手" : ""}</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-content">
        <div class="section-title">目前症狀</div>
        <div class="symptom-row">
          <span class="symptom-label">部位：</span>
          <span class="symptom-value">${evaluation.currentSymptomLocation || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">引起症狀動作：</span>
          <span class="symptom-value">${evaluation.currentSymptomTrigger || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">治療方式：</span>
          <span class="symptom-value">${evaluation.currentTreatment || ""}</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-content">
        <div class="section-title">過去症狀</div>
        <div class="symptom-row">
          <span class="symptom-label">部位：</span>
          <span class="symptom-value">${evaluation.pastSymptomLocation || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">引起症狀動作：</span>
          <span class="symptom-value">${evaluation.pastSymptomTrigger || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">治療方式：</span>
          <span class="symptom-value">${evaluation.pastTreatment || ""}</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-content">
        <div class="section-title">最早症狀</div>
        <div class="symptom-row">
          <span class="symptom-label">部位：</span>
          <span class="symptom-value">${evaluation.earliestSymptomLocation || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">引起症狀動作：</span>
          <span class="symptom-value">${evaluation.earliestSymptomTrigger || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">治療方式：</span>
          <span class="symptom-value">${evaluation.earliestTreatment || ""}</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-content">
        <div class="section-title">病史</div>
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
    
    <div class="section">
      <div class="section-content">
        <div class="symptom-row">
          <span class="symptom-label">醫學診斷：</span>
          <span class="symptom-value">${evaluation.medicalDiagnosis || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">目前用藥：</span>
          <span class="symptom-value">${evaluation.currentMedication || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">運動習慣：</span>
          <span class="symptom-value">${evaluation.exerciseHabits || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">睡眠狀況：</span>
          <span class="symptom-value">${evaluation.sleepCondition || ""}</span>
        </div>
        <div class="symptom-row">
          <span class="symptom-label">目標與期待：</span>
          <span class="symptom-value">${evaluation.goals || ""}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 第 2 頁：Moti Physio 3D 姿勢檢測報告 -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="https://www.stark.works/cdn/shop/files/logo_stark.png" alt="史塔克" class="logo-image" />
      </div>
      <div class="header-right">
        <div class="report-title">初評報告</div>
        <div class="date-info">日期：${evaluation.date || ""}</div>
      </div>
    </div>
    
    <div class="page-title-container">
      <div class="page-title">Moti Physio 3D 姿勢檢測報告</div>
    </div>
    
    <div class="image-section">
      ${evaluation.motiPhysioPage1 ? `<img src="${evaluation.motiPhysioPage1}" alt="姿勢檢測報告第一頁" />` : '<span style="color: #999;">報告第一頁（未上傳）</span>'}
    </div>
    
    <div class="image-section">
      ${evaluation.motiPhysioPage2 ? `<img src="${evaluation.motiPhysioPage2}" alt="姿勢檢測報告第二頁" />` : '<span style="color: #999;">報告第二頁（未上傳）</span>'}
    </div>

    ${renderMotiRiskSection(evaluation.motiRiskValues)}
  </div>

  <!-- 第 3 頁：功能性動作檢測（上半身 + 下半身/核心 合併） -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="https://www.stark.works/cdn/shop/files/logo_stark.png" alt="史塔克" class="logo-image" />
      </div>
      <div class="header-right">
        <div class="report-title">初評報告</div>
        <div class="date-info">日期：${evaluation.date || ""}</div>
      </div>
    </div>
    
    <div class="page-title-container">
      <div class="page-title">功能性動作檢測</div>
    </div>
    
    <!-- 上半身 -->
    <div style="margin-bottom: 12px;">
      <div style="background: #FEE8D6; border: 2px solid #D35400; border-radius: 15px; padding: 6px 15px; margin-bottom: 8px; text-align: center;">
        <span style="color: #D35400; font-weight: 600; font-size: 11pt;">上半身</span>
      </div>
      <table class="functional-table" style="font-size: 9pt;">
        <thead>
          <tr>
            <th style="width: 100px;">動作</th>
            <th style="width: 80px;">表現</th>
            <th style="width: 80px;">因素</th>
            <th>狀況</th>
          </tr>
        </thead>
          <tbody>
            <!-- 頸部屈曲/後仰 -->
          <tr class="group-header">
            <td colspan="4" style="padding: 5px 10px;">
              <span class="group-title">頸部屈曲/後仰</span>
              </td>
            </tr>
          <tr>
            <td>屈曲</td>
            <td style="text-align: center;">${functionalMovement.neckFlexion?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.neckFlexion?.promotingFactor || ""}</td>
            <td>${functionalMovement.neckFlexion?.condition || ""}</td>
          </tr>
          <tr>
            <td>後仰</td>
            <td style="text-align: center;">${functionalMovement.neckExtension?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.neckExtension?.promotingFactor || ""}</td>
            <td>${functionalMovement.neckExtension?.condition || ""}</td>
          </tr>
            
          <!-- 頸部左/右旋轉 -->
          <tr class="group-header">
            <td colspan="4" style="padding: 5px 10px;">
              <span class="group-title">頸部左/右旋轉</span>
            </td>
          </tr>
          <tr>
            <td>左轉</td>
            <td style="text-align: center;">${functionalMovement.neckRotationLeft?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.neckRotationLeft?.promotingFactor || ""}</td>
            <td>${functionalMovement.neckRotationLeft?.condition || ""}</td>
          </tr>
          <tr>
            <td>右轉</td>
            <td style="text-align: center;">${functionalMovement.neckRotationRight?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.neckRotationRight?.promotingFactor || ""}</td>
            <td>${functionalMovement.neckRotationRight?.condition || ""}</td>
          </tr>
            
          <!-- 肩關節屈曲/伸直 -->
          <tr class="group-header">
            <td colspan="4" style="padding: 5px 10px;">
              <span class="group-title">肩關節屈曲/伸直</span>
            </td>
          </tr>
          <tr>
            <td>左手</td>
            <td style="text-align: center;">${functionalMovement.shoulderFlexionLeft?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.shoulderFlexionLeft?.promotingFactor || ""}</td>
            <td>${functionalMovement.shoulderFlexionLeft?.condition || ""}</td>
          </tr>
          <tr>
            <td>右手</td>
            <td style="text-align: center;">${functionalMovement.shoulderFlexionRight?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.shoulderFlexionRight?.promotingFactor || ""}</td>
            <td>${functionalMovement.shoulderFlexionRight?.condition || ""}</td>
          </tr>
            
          <!-- 肩關節外展 -->
          <tr class="group-header">
            <td colspan="4" style="padding: 5px 10px;">
              <span class="group-title">肩關節外展</span>
            </td>
          </tr>
          <tr>
            <td>左手</td>
            <td style="text-align: center;">${functionalMovement.shoulderAbductionLeft?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.shoulderAbductionLeft?.promotingFactor || ""}</td>
            <td>${functionalMovement.shoulderAbductionLeft?.condition || ""}</td>
          </tr>
          <tr>
            <td>右手</td>
            <td style="text-align: center;">${functionalMovement.shoulderAbductionRight?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.shoulderAbductionRight?.promotingFactor || ""}</td>
            <td>${functionalMovement.shoulderAbductionRight?.condition || ""}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 下半身/核心 -->
    <div>
      <div style="background: #FEE8D6; border: 2px solid #D35400; border-radius: 15px; padding: 6px 15px; margin-bottom: 8px; text-align: center;">
        <span style="color: #D35400; font-weight: 600; font-size: 11pt;">下半身/核心</span>
      </div>
      <table class="functional-table" style="font-size: 9pt;">
        <thead>
          <tr>
            <th style="width: 100px;">動作</th>
            <th style="width: 80px;">表現</th>
            <th style="width: 80px;">因素</th>
            <th>狀況</th>
          </tr>
        </thead>
        <tbody>
          <!-- 軄幹前彎/後仰 -->
          <tr class="group-header">
            <td colspan="4" style="padding: 5px 10px;">
              <span class="group-title">軄幹前彎/後仰</span>
              </td>
          </tr>
          <tr>
            <td>前彎</td>
            <td style="text-align: center;">${functionalMovement.trunkFlexion?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.trunkFlexion?.promotingFactor || ""}</td>
            <td>${functionalMovement.trunkFlexion?.condition || ""}</td>
          </tr>
          <tr>
            <td>後仰</td>
            <td style="text-align: center;">${functionalMovement.trunkExtension?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.trunkExtension?.promotingFactor || ""}</td>
            <td>${functionalMovement.trunkExtension?.condition || ""}</td>
          </tr>
          
          <!-- 軄幹旋轉 -->
          <tr class="group-header">
            <td colspan="4" style="padding: 5px 10px;">
              <span class="group-title">軄幹旋轉</span>
            </td>
          </tr>
          <tr>
            <td>左轉</td>
            <td style="text-align: center;">${functionalMovement.trunkRotationLeft?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.trunkRotationLeft?.promotingFactor || ""}</td>
            <td>${functionalMovement.trunkRotationLeft?.condition || ""}</td>
          </tr>
          <tr>
            <td>右轉</td>
            <td style="text-align: center;">${functionalMovement.trunkRotationRight?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.trunkRotationRight?.promotingFactor || ""}</td>
            <td>${functionalMovement.trunkRotationRight?.condition || ""}</td>
          </tr>
          
          <!-- 單腳站 -->
          <tr class="group-header">
            <td colspan="4" style="padding: 5px 10px;">
              <span class="group-title">單腳站</span>
            </td>
          </tr>
          <tr>
            <td>左腳</td>
            <td style="text-align: center;">${functionalMovement.singleLegStandLeft?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.singleLegStandLeft?.promotingFactor || ""}</td>
            <td>${functionalMovement.singleLegStandLeft?.condition || ""}</td>
          </tr>
          <tr>
            <td>右腳</td>
            <td style="text-align: center;">${functionalMovement.singleLegStandRight?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.singleLegStandRight?.promotingFactor || ""}</td>
            <td>${functionalMovement.singleLegStandRight?.condition || ""}</td>
          </tr>
          
          <!-- 雙手高舉深蹲 -->
          <tr class="group-header">
            <td colspan="4" style="padding: 5px 10px;">
              <span class="group-title">雙手高舉深蹲</span>
            </td>
          </tr>
          <tr>
            <td>深蹲</td>
            <td style="text-align: center;">${functionalMovement.overheadSquat?.performance || ""}</td>
            <td style="text-align: center;">${functionalMovement.overheadSquat?.promotingFactor || ""}</td>
            <td>${functionalMovement.overheadSquat?.condition || ""}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- 第 5 頁：紅繩動力鍊檢測 -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="https://www.stark.works/cdn/shop/files/logo_stark.png" alt="史塔克" class="logo-image" />
      </div>
      <div class="header-right">
        <div class="report-title">初評報告</div>
        <div class="date-info">日期：${evaluation.date || ""}</div>
      </div>
    </div>
    
    <div class="page-title-container">
      <div class="page-title">紅繩動力鍊檢測</div>
    </div>
    
    <!-- 訓練側設定 -->
    <div style="text-align: right; margin-bottom: 8px; font-size: 10pt;">
      <span style="font-weight: 500;">訓練側：</span>
      <span>${redcord.trainingSide || ""}</span>
    </div>
    
    <div class="section" style="margin-bottom: 10px;">
      <table class="redcord-table">
        <thead>
          <tr>
            <th style="width: 160px;">Redcord 懸吊訓練</th>
            <th style="width: 30px;"></th>
            <th style="width: 60px;">評分</th>
            <th style="width: 100px;">6 Work load/ 其他配件</th>
            <th style="width: 80px;">訓練側</th>
          </tr>
        </thead>
        <tbody>
          <!-- 下肢區塊 -->
          <tr class="group-header" style="background: #FEF3E2;">
            <td colspan="5" style="padding: 6px 12px; font-weight: 600; color: #D35400;">下肢</td>
          </tr>
          <!-- SPL -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.spl?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">SPL</div>
                  <div style="font-size: 8pt; color: #666;">臀大肌</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.spl?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.spl?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.spl?.reps || ""} X ${redcord.spl?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.spl?.scoreL || ""}</td>
          </tr>
          <!-- SB -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.sb?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">SB</div>
                  <div style="font-size: 8pt; color: #666;">腿後腱肌群</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.sb?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.sb?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.sb?.reps || ""} X ${redcord.sb?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.sb?.scoreL || ""}</td>
          </tr>
          <!-- ABD -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.abd?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">ABD</div>
                  <div style="font-size: 8pt; color: #666;">臀中肌</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.abd?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.abd?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.abd?.reps || ""} X ${redcord.abd?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.abd?.scoreL || ""}</td>
          </tr>
          <!-- ADD -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.add?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">ADD</div>
                  <div style="font-size: 8pt; color: #666;">內收肌群</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.add?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.add?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.add?.reps || ""} X ${redcord.add?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.add?.scoreL || ""}</td>
          </tr>
          <!-- PB -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.pb?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">PB</div>
                  <div style="font-size: 8pt; color: #666;">腹部肌群</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.pb?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.pb?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.pb?.reps || ""} X ${redcord.pb?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.pb?.scoreL || ""}</td>
          </tr>
          <!-- SKF -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.skf?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">SKF</div>
                  <div style="font-size: 8pt; color: #666;">腿後腱肌群</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.skf?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.skf?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.skf?.reps || ""} X ${redcord.skf?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.skf?.scoreL || ""}</td>
          </tr>
          <!-- PHF -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.phf?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">PHF</div>
                  <div style="font-size: 8pt; color: #666;">腰大肌</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.phf?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.phf?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.phf?.reps || ""} X ${redcord.phf?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.phf?.scoreL || ""}</td>
          </tr>
          
          <!-- 核心區塊 -->
          <tr class="group-header" style="background: #FEF3E2;">
            <td colspan="5" style="padding: 6px 12px; font-weight: 600; color: #D35400;">核心</td>
          </tr>
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.sls?.checked ? '#D35400' : 'white'};"></span>
                <span style="font-weight: 500;">SLS</span>
              </div>
            </td>
            <td colspan="2" style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.sls?.pain ? '#D35400' : 'white'};"></span>
                Pain
              </span>
            </td>
            <td></td>
            <td style="text-align: center;">${redcord.sls?.seconds || ""}秒 X ${redcord.sls?.reps || ""}</td>
          </tr>
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.pls?.checked ? '#D35400' : 'white'};"></span>
                <span style="font-weight: 500;">PLS</span>
              </div>
            </td>
            <td colspan="2" style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.pls?.pain ? '#D35400' : 'white'};"></span>
                Pain
              </span>
            </td>
            <td style="text-align: center; font-size: 8pt;">
              <div>呼吸/骨盆底肌教學</div>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.pelvicFloorStimula ? '#D35400' : 'white'};"></span>
                Stimula
              </span>
            </td>
            <td style="text-align: center;">${redcord.pls?.seconds || ""}秒 X ${redcord.pls?.reps || ""}</td>
          </tr>
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.kls?.checked ? '#D35400' : 'white'};"></span>
                <span style="font-weight: 500;">KLS</span>
              </div>
            </td>
            <td colspan="2" style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.kls?.pain ? '#D35400' : 'white'};"></span>
                Pain
              </span>
            </td>
            <td></td>
            <td style="text-align: center;">${redcord.kls?.seconds || ""}秒 X ${redcord.kls?.reps || ""}</td>
          </tr>
          
          <!-- 上肢區塊 -->
          <tr class="group-header" style="background: #FEF3E2;">
            <td colspan="5" style="padding: 6px 12px; font-weight: 600; color: #D35400;">上肢</td>
          </tr>
          <!-- Scapular Depression -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.scapularDepression?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">Scapular Depression</div>
                  <div style="font-size: 8pt; color: #666;">下斜方肌</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.scapularDepression?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.scapularDepression?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.scapularDepression?.reps || ""} X ${redcord.scapularDepression?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.scapularDepression?.scoreL || ""}</td>
          </tr>
          <!-- Scapular Protraction -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.scapularProtraction?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">Scapular Protraction</div>
                  <div style="font-size: 8pt; color: #666;">前鋸肌</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.scapularProtraction?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.scapularProtraction?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.scapularProtraction?.reps || ""} X ${redcord.scapularProtraction?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.scapularProtraction?.scoreL || ""}</td>
          </tr>
          <!-- Scapular Retraction -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.scapularRetraction?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">Scapular Retraction</div>
                  <div style="font-size: 8pt; color: #666;">菱形肌</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.scapularRetraction?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.scapularRetraction?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.scapularRetraction?.reps || ""} X ${redcord.scapularRetraction?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.scapularRetraction?.scoreL || ""}</td>
          </tr>
          <!-- Shoulder Extension -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.shoulderExtension?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">Shoulder Extension</div>
                  <div style="font-size: 8pt; color: #666;">闊背肌</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.shoulderExtension?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.shoulderExtension?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.shoulderExtension?.reps || ""} X ${redcord.shoulderExtension?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.shoulderExtension?.scoreL || ""}</td>
          </tr>
          <!-- Push up -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.pushUp?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">Push up</div>
                  <div style="font-size: 8pt; color: #666;">胸大肌/肱三頭肌</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.pushUp?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.pushUp?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.pushUp?.reps || ""} X ${redcord.pushUp?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.pushUp?.scoreL || ""}</td>
          </tr>
          <!-- Pull up -->
          <tr>
            <td rowspan="2" style="vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.pullUp?.checked ? '#D35400' : 'white'};"></span>
                <div>
                  <div style="font-weight: 500;">Pull up</div>
                  <div style="font-size: 8pt; color: #666;">後三角肌/二頭肌</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-size: 9pt;">R</td>
            <td style="text-align: center;">${redcord.pullUp?.scoreR || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.pullUp?.workload || ""}</td>
            <td rowspan="2" style="text-align: center;">${redcord.pullUp?.reps || ""} X ${redcord.pullUp?.sets || ""}</td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 9pt;">L</td>
            <td style="text-align: center;">${redcord.pullUp?.scoreL || ""}</td>
          </tr>
          
          <!-- 頸部區塊 -->
          <tr class="group-header" style="background: #FEF3E2;">
            <td colspan="5" style="padding: 6px 12px; font-weight: 600; color: #D35400;">頸部</td>
          </tr>
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.cervicalSetting?.checked ? '#D35400' : 'white'};"></span>
                <span style="font-weight: 500;">Cervical setting</span>
              </div>
            </td>
            <td colspan="2" style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalSetting?.pain ? '#D35400' : 'white'};"></span>
                Pain
              </span>
            </td>
            <td style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalSetting?.stimula ? '#D35400' : 'white'};"></span>
                Stimula
              </span>
            </td>
            <td style="text-align: center;">${redcord.cervicalSetting?.value || ""}</td>
          </tr>
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.cervicalRetraction?.checked ? '#D35400' : 'white'};"></span>
                <span style="font-weight: 500;">Cervical Retraction</span>
              </div>
            </td>
            <td colspan="2" style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalRetraction?.pain ? '#D35400' : 'white'};"></span>
                Pain
              </span>
            </td>
            <td style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalRetraction?.stimula ? '#D35400' : 'white'};"></span>
                Stimula
              </span>
            </td>
            <td style="text-align: center;">${redcord.cervicalRetraction?.value || ""}</td>
          </tr>
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.cervicalRotation?.checked ? '#D35400' : 'white'};"></span>
                <span style="font-weight: 500;">Cervical Rotation</span>
              </div>
            </td>
            <td colspan="2" style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalRotation?.pain ? '#D35400' : 'white'};"></span>
                Pain
              </span>
            </td>
            <td style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalRotation?.stimula ? '#D35400' : 'white'};"></span>
                Stimula
              </span>
            </td>
            <td style="text-align: center;">${redcord.cervicalRotation?.value || ""}</td>
          </tr>
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.cervicalExtension?.checked ? '#D35400' : 'white'};"></span>
                <span style="font-weight: 500;">Cervical Extension</span>
              </div>
            </td>
            <td colspan="2" style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalExtension?.pain ? '#D35400' : 'white'};"></span>
                Pain
              </span>
            </td>
            <td style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalExtension?.stimula ? '#D35400' : 'white'};"></span>
                Stimula
              </span>
            </td>
            <td style="text-align: center;">${redcord.cervicalExtension?.value || ""}</td>
          </tr>
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #ccc; background: ${redcord.cervicalSidebending?.checked ? '#D35400' : 'white'};"></span>
                <span style="font-weight: 500;">Cervical Sidebending</span>
              </div>
            </td>
            <td colspan="2" style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalSidebending?.pain ? '#D35400' : 'white'};"></span>
                Pain
              </span>
            </td>
            <td style="text-align: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #ccc; background: ${redcord.cervicalSidebending?.stimula ? '#D35400' : 'white'};"></span>
                Stimula
              </span>
            </td>
            <td style="text-align: center;">${redcord.cervicalSidebending?.value || ""}</td>
          </tr>
          
          <!-- 其他動作區塊 -->
          <tr class="group-header" style="background: #FEF3E2;">
            <td colspan="5" style="padding: 6px 12px; font-weight: 600; color: #D35400;">其他動作</td>
          </tr>
          <tr>
            <td>${redcord.otherMovement?.name || ""}</td>
            <td colspan="2" style="text-align: center;">${redcord.otherMovement?.score || ""}</td>
            <td style="text-align: center;">${redcord.otherMovement?.workload || ""}</td>
            <td style="text-align: center;">${redcord.otherMovement?.value || ""}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
  </div>
  
  <!-- 第 6 頁：RONFIC 評估結果 -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="https://www.stark.works/cdn/shop/files/logo_stark.png" alt="史塔克" class="logo-image" />
      </div>
      <div class="header-right">
        <div class="report-title">初評報告</div>
        <div class="date-info">日期：${evaluation.date || ""}</div>
      </div>
    </div>
    
    <div class="page-title-container">
      <div class="page-title">R O N F I C 評 估 結 果</div>
    </div>
    
    <!-- RONFIC MINIPLUS -->
    <div class="section" style="margin-bottom: 30px;">
      <div style="display: flex; justify-content: center; margin-bottom: 15px;">
        <div style="display: inline-block; padding: 8px 30px; border: 2px solid #D35400; border-radius: 30px; background: white;">
          <span style="color: #D35400; font-weight: 600; font-size: 12pt; letter-spacing: 3px;">R O N F I C &nbsp; M I N I P L U S &nbsp; 評 估 結 果</span>
        </div>
      </div>
      <div style="background: #FEF9F3; border: 2px dashed #E8D5C4; border-radius: 12px; min-height: 280px; display: flex; align-items: center; justify-content: center; padding: 20px;">
        ${evaluation.ronficMiniplusResult ? 
          `<img src="${evaluation.ronficMiniplusResult}" alt="RONFIC MINIPLUS 結果" style="max-width: 100%; max-height: 260px; object-fit: contain;" />` : 
          `<div style="text-align: center; color: #999;">
            <div style="font-size: 36pt; margin-bottom: 10px;">📷</div>
            <div>點擊或拖曳上傳 RONFIC MINIPLUS 評估結果</div>
          </div>`
        }
      </div>
    </div>
    
    <!-- RONFIC XIM -->
    <div class="section">
      <div style="display: flex; justify-content: center; margin-bottom: 15px;">
        <div style="display: inline-block; padding: 8px 30px; border: 2px solid #D35400; border-radius: 30px; background: white;">
          <span style="color: #D35400; font-weight: 600; font-size: 12pt; letter-spacing: 3px;">R O N F I C &nbsp; X I M &nbsp; 評 估 結 果</span>
        </div>
      </div>
      <div style="background: #FEF9F3; border: 2px dashed #E8D5C4; border-radius: 12px; min-height: 280px; display: flex; align-items: center; justify-content: center; padding: 20px;">
        ${evaluation.ronficXimResult ? 
          `<img src="${evaluation.ronficXimResult}" alt="RONFIC XIM 結果" style="max-width: 100%; max-height: 260px; object-fit: contain;" />` : 
          `<div style="text-align: center; color: #999;">
            <div style="font-size: 36pt; margin-bottom: 10px;">📷</div>
            <div>點擊或拖曳上傳 RONFIC XIM 評估結果</div>
          </div>`
        }
      </div>
    </div>
  </div>
  
  <!-- 第 7 頁：訓練計畫 -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="https://www.stark.works/cdn/shop/files/logo_stark.png" alt="史塔克" class="logo-image" />
      </div>
      <div class="header-right">
        <div class="report-title">初評報告</div>
        <div class="date-info">日期：${evaluation.date || ""}</div>
      </div>
    </div>
    
    <!-- 訓練計畫標題 -->
    <div style="display: flex; justify-content: center; margin: 20px 0;">
      <div style="display: inline-block; padding: 8px 30px; border: 2px solid #D35400; border-radius: 30px; background: white;">
        <span style="color: #D35400; font-weight: 600; font-size: 14pt; letter-spacing: 5px;">訓 練 計 畫</span>
      </div>
    </div>
    
    <!-- 訓練計畫表格 -->
    <div class="section" style="margin-bottom: 25px;">
      <table style="width: 100%; border-collapse: collapse; border: 2px solid #E8D5C4; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #FEF9F3;">
            <th style="width: 120px; padding: 12px; text-align: center; font-weight: 500; color: #333; border-right: 1px solid #E8D5C4; border-bottom: 1px solid #E8D5C4;">課堂</th>
            <th style="padding: 12px; text-align: center; font-weight: 500; color: #333; border-bottom: 1px solid #E8D5C4;">訓練內容</th>
          </tr>
        </thead>
        <tbody>
          ${trainingPlans.length > 0 ? trainingPlans.map((plan: any, index: number) => `
            <tr style="background: white;">
              <td style="padding: 10px; text-align: center; border-right: 1px solid #E8D5C4; border-bottom: 1px solid #E8D5C4;">${plan.session || `第 ${index + 1} 堂`}</td>
              <td style="padding: 10px; border-bottom: 1px solid #E8D5C4;">${plan.content || ""}</td>
            </tr>
          `).join("") : `
            <tr style="background: white;"><td style="padding: 10px; text-align: center; border-right: 1px solid #E8D5C4; border-bottom: 1px solid #E8D5C4;">第 1 堂</td><td style="padding: 10px; border-bottom: 1px solid #E8D5C4;"></td></tr>
            <tr style="background: white;"><td style="padding: 10px; text-align: center; border-right: 1px solid #E8D5C4; border-bottom: 1px solid #E8D5C4;">第 2 堂</td><td style="padding: 10px; border-bottom: 1px solid #E8D5C4;"></td></tr>
            <tr style="background: white;"><td style="padding: 10px; text-align: center; border-right: 1px solid #E8D5C4; border-bottom: 1px solid #E8D5C4;">第 3 堂</td><td style="padding: 10px; border-bottom: 1px solid #E8D5C4;"></td></tr>
            <tr style="background: white;"><td style="padding: 10px; text-align: center; border-right: 1px solid #E8D5C4; border-bottom: 1px solid #E8D5C4;">第 4 堂</td><td style="padding: 10px; border-bottom: 1px solid #E8D5C4;"></td></tr>
            <tr style="background: white;"><td style="padding: 10px; text-align: center; border-right: 1px solid #E8D5C4;">第 5 堂</td><td style="padding: 10px;"></td></tr>
          `}
        </tbody>
      </table>
    </div>
    
    <!-- 備註欄/評估照片標題 -->
    <div style="display: flex; justify-content: center; margin: 20px 0;">
      <div style="display: inline-block; padding: 8px 30px; border: 2px solid #D35400; border-radius: 30px; background: white;">
        <span style="color: #D35400; font-weight: 600; font-size: 14pt; letter-spacing: 5px;">備 註 欄 / 評 估 照 片</span>
      </div>
    </div>
    
    <!-- 備註內容 -->
    <div style="background: white; border: 2px solid #E8D5C4; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <div style="margin-bottom: 15px;">
        <div style="font-weight: 500; color: #333; margin-bottom: 8px;">備註</div>
        <div style="background: #FEF9F3; border: 1px solid #E8D5C4; border-radius: 8px; padding: 12px; min-height: 60px;">
          ${evaluation.notes || '<span style="color: #999;">請輸入備註內容</span>'}
        </div>
      </div>
      
      <div>
        <div style="font-weight: 500; color: #333; margin-bottom: 8px;">評估照片</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          ${[0, 1, 2].map((index) => {
            const photo = photos[index];
            return photo ? `
              <div style="aspect-ratio: 4/5; border: 2px solid #D35400; border-radius: 8px; overflow: hidden;">
                <img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : `
              <div style="aspect-ratio: 4/5; background: #FEF9F3; border: 2px dashed #E8D5C4; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #999; font-size: 24px;">+</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
    
    <!-- 簽名區 -->
    <div style="display: flex; gap: 20px; margin-top: 20px;">
      <!-- 客戶簽名 -->
      <div style="flex: 1; background: white; border: 2px solid #E8D5C4; border-radius: 12px; padding: 15px;">
        <div style="font-weight: 500; color: #333; margin-bottom: 10px;">客戶簽名</div>
        <div style="background: #FEF9F3; border: 1px solid #E8D5C4; border-radius: 8px; height: 100px; display: flex; align-items: center; justify-content: center;">
          ${evaluation.clientSignature ? 
            `<img src="${evaluation.clientSignature}" alt="客戶簽名" style="max-width: 100%; max-height: 90px; object-fit: contain;" />` : 
            '<span style="color: #999;">請在此簽名</span>'
          }
        </div>
      </div>
      
      <!-- 教練簽名 -->
      <div style="flex: 1; background: white; border: 2px solid #E8D5C4; border-radius: 12px; padding: 15px;">
        <div style="font-weight: 500; color: #333; margin-bottom: 10px;">教練簽名</div>
        <div style="background: #FEF9F3; border: 1px solid #E8D5C4; border-radius: 8px; height: 100px; display: flex; align-items: center; justify-content: center;">
          ${evaluation.coachSignature ? 
            `<img src="${evaluation.coachSignature}" alt="教練簽名" style="max-width: 100%; max-height: 90px; object-fit: contain;" />` : 
            '<span style="color: #999;">請在此簽名</span>'
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
 * 使用 jsPDF + html2canvas 直接生成 PDF 檔案並下載（逐頁渲染版本）
 */
export async function printToPDF(evaluation: any, filename: string = "evaluation.pdf"): Promise<void> {
  const htmlContent = generatePDFHTML(evaluation);
  
  // 開啟新視窗顯示 PDF 預覽
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  
  if (!printWindow) {
    throw new Error("無法開啟列印視窗，請檢查瀏覽器是否阻擋彈出視窗");
  }
  
  // 寫入 HTML 內容
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.document.title = filename.replace('.pdf', '');
  
  // 等待內容和圖片載入
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 等待所有圖片載入完成
  const images = printWindow.document.querySelectorAll('img');
  const imagePromises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });
  await Promise.all(imagePromises);
  
  // 額外等待確保渲染完成
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 獲取所有頁面元素
  const pages = printWindow.document.querySelectorAll('.page');
  
  if (pages.length === 0) {
    printWindow.close();
    throw new Error("無法找到 PDF 頁面內容");
  }
  
  // 創建 PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pdfWidth = 210;
  const pdfHeight = 297;
  
  // 逐頁渲染
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i] as HTMLElement;
    
    // 使用 html2canvas 渲染頁面（平衡清晰度和檔案大小）
    const canvas = await html2canvas(page, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#FDEEE5',
      width: page.scrollWidth,
      height: page.scrollHeight,
    });
    
    // 使用 JPEG 格式，品質 80% 平衡清晰度和檔案大小
    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    
    // 如果不是第一頁，添加新頁面
    if (i > 0) {
      pdf.addPage();
    }
    
    // 計算圖片尺寸以適應 A4 頁面
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // 添加圖片到 PDF（使用 JPEG 格式）
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
  }
  
  // 關閉預覽視窗
  printWindow.close();
  
  // 下載 PDF
  pdf.save(filename);
}
