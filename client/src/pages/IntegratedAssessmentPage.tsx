import { useState } from "react";
import { useRoute } from "wouter";
import { TherapistLayout } from "@/components/templates/TherapistLayout";
import { AssessmentHeader } from "@/components/organisms/AssessmentHeader";
import { ClientSidebar } from "@/components/organisms/ClientSidebar";
import { ReportEditSidebar } from "@/components/organisms/ReportEditSidebar";
import { SystemImportCard } from "@/components/molecules/SystemImportCard";
import { WeekPlanCard } from "@/components/molecules/WeekPlanCard";
import { KeyFindingRow } from "@/components/molecules/KeyFindingRow";
import { PriorityFindingCard } from "@/components/molecules/PriorityFindingCard";
import { SectionNumber } from "@/components/atoms/SectionNumber";
import { EvaluationDrawer, type DrawerTabKey } from "@/components/organisms/EvaluationDrawer";
import { PrescriptionPicker } from "@/components/organisms/PrescriptionPicker";
import {
  DEFAULT_DEMO_PRESCRIPTIONS,
  getPrescription,
  type PrescriptionSelection,
} from "@shared/prescriptionKB";
import { BodyOutlineSimple } from "@/components/atoms/BodyOutlineSimple";
import { ChipToggle } from "@/components/atoms/ChipToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dumbbell,
  Stethoscope,
  Home as HomeIcon,
  CalendarCheck,
  Bone,
  MoreVertical,
  History,
  FileText,
  StretchHorizontal,
  Wind,
  RotateCw,
  Scale,
  Activity,
  Pencil,
} from "lucide-react";
import {
  demoClient,
  demoComplaint,
  demoDataSources,
  demoPostureFindings,
  demoPostureHotspots,
  demoFunctionalIssues,
  demoTherapistJudgment,
  demoTopIssues,
  demoInterventionOptions,
  demoInterventionDefaults,
  demoInterventionNotes,
  demoWeekPlan,
  demoEvaluationProgress,
  demoReportSummary,
  demoTabs,
} from "@/lib/demo-data";

const COMPLAINT_ROWS = [
  { label: "目前症狀部位", key: "symptomAreas" as const },
  { label: "引起症狀動作", key: "triggerActions" as const },
  { label: "受傷史", key: "injuryHistory" as const },
  { label: "手術史", key: "surgeryHistory" as const },
  { label: "醫學診斷", key: "medicalDiagnosis" as const },
  { label: "睡眠狀況", key: "sleepStatus" as const },
  { label: "目標與期待", key: "goals" as const },
];

const LEVEL_LABEL = ["正常", "輕度", "中等", "嚴重"];
const LEVEL_DOT = [
  "bg-status-good",
  "bg-status-warn",
  "bg-status-warn",
  "bg-status-danger",
];
const LEVEL_TONE: Record<number, "good" | "warn" | "danger"> = {
  0: "good",
  1: "warn",
  2: "warn",
  3: "danger",
};

const FUNCTIONAL_ICONS: Record<string, React.ReactNode> = {
  單腳站: <Activity />,
  核心控制: <Scale />,
  深蹲: <StretchHorizontal />,
  "呼吸 / 骨盆底": <Wind />,
  軀幹旋轉: <RotateCw />,
  左右不對稱: <Activity />,
};

export default function IntegratedAssessmentPage() {
  const [, params] = useRoute<{ id: string }>("/clients/:id/assessment");
  const clientId = params?.id ?? demoClient.id;

  const [activeTab, setActiveTab] = useState<string>("summary");
  const [judgment, setJudgment] = useState(demoTherapistJudgment);
  const [topIssues, setTopIssues] = useState(demoTopIssues);
  const [interventions, setInterventions] = useState(demoInterventionDefaults);
  const [interventionNotes, setInterventionNotes] = useState(
    demoInterventionNotes
  );
  const [plainExplanation, setPlainExplanation] = useState(
    demoReportSummary.plainExplanation
  );
  const [reportNotes, setReportNotes] = useState(demoReportSummary.notes);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTabKey>("basic");
  const [prescriptionPickerOpen, setPrescriptionPickerOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionSelection[]>([
    ...DEFAULT_DEMO_PRESCRIPTIONS,
  ]);

  const openDrawer = (tab: DrawerTabKey) => {
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  return (
    <TherapistLayout activeKey="integrated">
      <AssessmentHeader
        title="客戶整合評估"
        autosaveAt="17:28"
        tabs={demoTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => window.history.back()}
        onImport={() => openDrawer("basic")}
      />

      <div className="flex">
        <ClientSidebar
          client={demoClient}
          complaint={`久坐後下背與頸部痠痛,深蹲時右膝不適。`}
          goals="改善痠痛並增進運動與穩定度。"
          progress={demoEvaluationProgress}
        />

        <div className="flex-1 min-w-0 p-6 space-y-5">
          {activeTab !== "summary" ? (
            <PlaceholderTab
              label={demoTabs.find((t) => t.key === activeTab)?.label ?? ""}
              clientId={clientId}
            />
          ) : (
            <>
              {/* ① 主訴 / 症狀 */}
              <SectionCard
                n={1}
                title="本次主訴 / 症狀"
                onEdit={() => openDrawer("basic")}
              >
                <dl className="grid grid-cols-1 gap-y-2.5">
                  {COMPLAINT_ROWS.map((r) => (
                    <div key={r.key} className="grid grid-cols-[120px_1fr] gap-3">
                      <dt className="text-sm text-muted-foreground">
                        {r.label}
                      </dt>
                      <dd className="text-sm text-foreground">
                        {demoComplaint[r.key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>

              {/* ② 資料來源整合 */}
              <SectionCard
                n={2}
                title="資料來源整合"
                onEdit={() => openDrawer("body-comp")}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {demoDataSources.map((s) => (
                    <SystemImportCard
                      key={s.systemName}
                      systemName={s.systemName}
                      systemKind={s.systemKind}
                      state={s.state}
                      summary={s.summaryHtml}
                      timestamp={s.timestamp}
                      accent={s.accent}
                    />
                  ))}
                </div>
              </SectionCard>

              {/* ③ 姿勢重點判讀 */}
              <SectionCard
                n={3}
                title="姿勢重點判讀"
                onEdit={() => openDrawer("posture")}
              >
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
                  <div className="flex gap-4 justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <BodyOutlineSimple
                        size="md"
                        view="front"
                        hotspots={demoPostureHotspots}
                      />
                      <span className="text-xs text-muted-foreground">
                        正面
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <BodyOutlineSimple
                        size="md"
                        view="back"
                        hotspots={demoPostureHotspots.map((h) => ({
                          ...h,
                          x: 1 - h.x,
                        }))}
                      />
                      <span className="text-xs text-muted-foreground">
                        背面
                      </span>
                    </div>
                  </div>
                  <div className="divide-y border rounded-lg bg-card px-4">
                    {demoPostureFindings.map((f) => (
                      <KeyFindingRow
                        key={f.label}
                        label={f.label}
                        value={f.value}
                        tone={f.tone}
                      />
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* ④ 功能與控制問題 */}
              <SectionCard
                n={4}
                title="功能與控制問題"
                onEdit={() => openDrawer("functional")}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {demoFunctionalIssues.map((issue) => (
                    <div
                      key={issue.label}
                      className="flex items-center gap-3 rounded-lg border bg-card p-3"
                    >
                      <span
                        className={cn(
                          "inline-flex w-9 h-9 items-center justify-center rounded-md bg-bg-subtle [&>svg]:w-4 [&>svg]:h-4 text-foreground"
                        )}
                      >
                        {FUNCTIONAL_ICONS[issue.label] ?? <Activity />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-semibold">
                          {issue.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {issue.result}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                          issue.level >= 3
                            ? "bg-status-danger-bg text-status-danger"
                            : issue.level >= 2
                              ? "bg-status-warn-bg text-status-warn"
                              : issue.level >= 1
                                ? "bg-status-warn-bg text-status-warn"
                                : "bg-status-good-bg text-status-good"
                        )}
                      >
                        {issue.result} / {issue.level}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3">
                  {LEVEL_LABEL.map((label, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", LEVEL_DOT[i])} />
                      {i} {label}
                    </span>
                  ))}
                </div>
              </SectionCard>

              {/* ⑤ 治療師整合判讀 */}
              <SectionCard n={5} title="治療師整合判讀">
                <div className="flex justify-end gap-2 mb-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <History className="w-3.5 h-3.5" />
                    載入上次評估
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    套用模板
                  </Button>
                </div>
                <textarea
                  value={judgment}
                  onChange={(e) => setJudgment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full text-sm rounded-md border bg-background p-3 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
                <p className="text-xs text-muted-foreground text-right tabular-nums">
                  {judgment.length} / 1000
                </p>
              </SectionCard>

              {/* ⑥ 三大優先問題 */}
              <SectionCard n={6} title="三大優先問題">
                <div className="space-y-2">
                  {topIssues.map((issue, i) => (
                    <PriorityFindingCard
                      key={i}
                      n={i + 1}
                      title={issue.title}
                      description={issue.description}
                      tone={
                        i === 0 ? "danger" : i === 1 ? "warn" : "primary"
                      }
                      action={
                        <button className="p-1 rounded hover:bg-muted">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      }
                    />
                  ))}
                </div>
              </SectionCard>

              {/* ⑦ 介入建議 */}
              <SectionCard
                n={7}
                title="介入建議"
                titleSuffix={
                  <span className="text-xs text-muted-foreground">(可多選)</span>
                }
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {demoInterventionOptions.map((opt) => (
                    <ChipToggle
                      key={opt.key}
                      selected={interventions[opt.key] ?? false}
                      onToggle={(v) =>
                        setInterventions((cur) => ({ ...cur, [opt.key]: v }))
                      }
                      icon={INTERVENTION_ICON[opt.key]}
                    >
                      {opt.label}
                    </ChipToggle>
                  ))}
                </div>
                <div className="pt-3 space-y-1">
                  <p className="text-sm font-medium">備註說明</p>
                  <textarea
                    value={interventionNotes}
                    onChange={(e) => setInterventionNotes(e.target.value)}
                    rows={2}
                    className="w-full text-sm rounded-md border bg-background p-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    placeholder="以核心與體部穩定、動作控制與對稱性為主要介入方向。"
                  />
                </div>
              </SectionCard>

              {/* ⑧ 4 週計畫草案 */}
              <SectionCard
                n={8}
                title="4 週計畫草案"
                onEdit={() => openDrawer("training")}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {demoWeekPlan.map((wp, i) => (
                    <WeekPlanCard
                      key={wp.n}
                      n={wp.n}
                      weekLabel={wp.weekLabel}
                      phase={wp.phase}
                      items={wp.items}
                      tone={
                        i === 0
                          ? "primary"
                          : i === 1
                            ? "good"
                            : i === 2
                              ? "warn"
                              : "muted"
                      }
                      current={i === 0}
                    />
                  ))}
                </div>
                <div className="pt-3 text-xs text-muted-foreground text-center bg-bg-subtle rounded-md py-2">
                  預計複評:
                  <span className="font-display font-semibold text-foreground tabular-nums ml-1">
                    {demoReportSummary.reassessDate}
                  </span>{" "}
                  (距今 28 天)
                </div>

                {prescriptions.length > 0 && (
                  <div className="pt-3 border-t mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-display text-sm font-semibold">
                        已開立處方({prescriptions.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => setPrescriptionPickerOpen(true)}
                        className="inline-flex items-center gap-1 text-xs text-brand-primary hover:text-brand-primary-dark"
                      >
                        <Pencil className="w-3 h-3" />
                        編輯處方
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prescriptions.map((sel) => {
                        const p = getPrescription(sel.prescriptionId);
                        if (!p) return null;
                        return (
                          <span
                            key={sel.prescriptionId}
                            className="inline-flex items-center gap-1.5 rounded-full bg-bg-subtle px-2.5 py-1 text-xs"
                          >
                            <span>{p.thumbnailEmoji}</span>
                            <span className="font-medium">{p.name}</span>
                            <span className="text-muted-foreground tabular-nums">
                              {sel.sets}×{sel.reps}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </SectionCard>
            </>
          )}
        </div>

        <ReportEditSidebar
          plainExplanation={plainExplanation}
          onPlainExplanationChange={setPlainExplanation}
          risk={demoReportSummary.riskLevel}
          recommendedPlan={demoReportSummary.recommendedPlan}
          reassessDate={demoReportSummary.reassessDate}
          reassessHint={demoReportSummary.reassessHint}
          notes={reportNotes}
          onNotesChange={setReportNotes}
          lastUpdatedBy={demoReportSummary.lastUpdatedBy}
          lastUpdatedAt={demoReportSummary.lastUpdatedAt}
          onSaveDraft={() => alert("儲存草稿 — Week 4 接 tRPC")}
          onAssignPlan={() => setPrescriptionPickerOpen(true)}
          onGenerateReport={() =>
            alert("產生客戶報告 — Week 3 shareCode 才生效")
          }
          onRefreshPreview={() => alert("Refresh — 預覽即時更新")}
        />
      </div>

      <EvaluationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialTab={drawerTab}
      />

      <PrescriptionPicker
        open={prescriptionPickerOpen}
        onOpenChange={setPrescriptionPickerOpen}
        selected={prescriptions}
        onConfirm={setPrescriptions}
      />
    </TherapistLayout>
  );
}

const INTERVENTION_ICON: Record<string, React.ReactNode> = {
  training: <Dumbbell />,
  therapy: <Stethoscope />,
  redcord: <Bone />,
  home: <HomeIcon />,
  reassess: <CalendarCheck />,
};

function SectionCard({
  n,
  title,
  titleSuffix,
  onEdit,
  children,
}: {
  n: number;
  title: string;
  titleSuffix?: React.ReactNode;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card rounded-lg border p-5 space-y-3">
      <header className="flex items-center gap-2">
        <SectionNumber n={n} size="md" />
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {titleSuffix}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground rounded-md px-2 py-1 hover:bg-muted"
          >
            <Pencil className="w-3.5 h-3.5" />
            編輯
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

function PlaceholderTab({
  label,
  clientId,
}: {
  label: string;
  clientId: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <p className="font-display text-lg font-semibold text-muted-foreground">
        「{label}」分頁
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Week 4 將把 Page 1-7 重構成 Drawer 子表單,接到這裡。
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1 tabular-nums">
        clientId: {clientId}
      </p>
    </div>
  );
}
