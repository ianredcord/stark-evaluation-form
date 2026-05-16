import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { ClientReportLayout } from "@/components/templates/ClientReportLayout";
import { HeroScoreBlock } from "@/components/organisms/HeroScoreBlock";
import { PriorityFindingsList } from "@/components/organisms/PriorityFindingsList";
import { BodyRiskMap } from "@/components/organisms/BodyRiskMap";
import { YourStrengthsBanner } from "@/components/organisms/YourStrengthsBanner";
import { DataSourcesRow } from "@/components/organisms/DataSourcesRow";
import { ActionPlanSection } from "@/components/organisms/ActionPlanSection";
import { PrescriptionSection } from "@/components/organisms/PrescriptionSection";
import { ClientCTABar } from "@/components/organisms/ClientCTABar";
import { BirthdateVerifyForm } from "@/components/organisms/BirthdateVerifyForm";
import {
  demoClient,
  demoClientReport,
  demoPostureHotspots,
  demoWeekPlan,
} from "@/lib/demo-data";
import { getPrescription } from "@shared/prescriptionKB";

const STORAGE_KEY = "stark.clientReport.verified";

export default function ClientReportPage() {
  const [, params] = useRoute<{ shareCode: string }>("/r/:shareCode");
  const shareCode = params?.shareCode ?? demoClientReport.shareCode;
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY + ":" + shareCode) === "1") {
      setVerified(true);
    }
  }, [shareCode]);

  if (!verified) {
    return (
      <BirthdateVerifyForm
        expected={demoClientReport.expectedBirthdate}
        onVerified={() => {
          sessionStorage.setItem(STORAGE_KEY + ":" + shareCode, "1");
          setVerified(true);
        }}
      />
    );
  }

  const r = demoClientReport;
  const backHotspots = demoPostureHotspots.map((h) => ({ ...h, x: 1 - h.x }));
  const prescriptions = r.prescriptionSelectionIds
    .map((id) => {
      const p = getPrescription(id);
      if (!p) return null;
      return {
        name: p.name,
        nameEn: p.nameEn,
        sets: `${p.defaultSets} 組 × ${p.defaultReps}`,
        tag: p.tag,
        thumbnailEmoji: p.thumbnailEmoji,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <ClientReportLayout
      shareCode={shareCode}
      onDownloadPdf={() => window.print()}
    >
      <motion.div
        className="max-w-6xl mx-auto space-y-5"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
        <HeroScoreBlock
          clientName={demoClient.name}
          evaluationDate={r.evaluationDate}
          lastScore={r.lastScore}
          currentScore={r.currentScore}
          state={r.state}
          encouragement={r.encouragement}
          subScores={r.subScores}
        />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr] gap-4"
          variants={fadeUp}
        >
          <PriorityFindingsList
            findings={r.priorityFindings}
            goodNews={r.goodNews}
          />
          <BodyRiskMap
            hotspotsFront={demoPostureHotspots}
            hotspotsBack={backHotspots}
            legend={r.riskLegend}
          />
          <DataSourcesRow
            sources={r.dataSources}
            completedAt={r.evaluationDate}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <YourStrengthsBanner
            strengths={r.strengths}
            closing={r.strengthsClosing}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <ActionPlanSection
            recommendations={r.recommendations}
            weekPlan={demoWeekPlan}
            onViewPlan={() => alert("展開完整改善計畫")}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <PrescriptionSection
            intro={r.prescriptionsIntro}
            prescriptions={prescriptions}
            onViewAll={() => (window.location.href = "/prescriptions")}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <ClientCTABar
            onBookReassess={() => alert("Week 6 / Phase 2 預約系統")}
            onContactTherapist={() => alert("LINE / SMS / Email 是 Phase 2")}
          />
        </motion.div>

        <motion.footer
          variants={fadeUp}
          className="text-center text-xs text-muted-foreground py-4"
        >
          本報告僅供健康管理參考,若有不適請諮詢專業醫療人員。
          <br />© 2026 STARK Health · 由 {demoClient.primaryTherapist} 物理治療師
          提供
        </motion.footer>
      </motion.div>
    </ClientReportLayout>
  );
}
