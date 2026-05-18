import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import { useAutosave } from "@/lib/useAutosave";
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
import { GenerateReportDialog } from "@/components/organisms/GenerateReportDialog";
import {
  DEFAULT_DEMO_PRESCRIPTIONS,
  getPrescription,
  type PrescriptionSelection,
} from "@shared/prescriptionKB";
import {
  MOTI_THRESHOLDS,
  calculateMotiLevel,
  type MotiRiskItem,
  type MotiRiskValues,
} from "../../../shared/evaluation";
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

type PostureFinding = {
  label: string;
  value: string;
  tone: "good" | "warn" | "danger";
};

// Derive top posture findings from the 12-item Moti risk values.
// Returns null when no values are populated yet (caller falls back to demo).
function derivePostureFindings(
  values: MotiRiskValues | null | undefined
): PostureFinding[] | null {
  if (!values) return null;
  const items: PostureFinding[] = [];
  for (const [key, threshold] of Object.entries(MOTI_THRESHOLDS)) {
    const item = (values as unknown as Record<string, MotiRiskItem | undefined>)[key];
    if (!item || item.value == null || Number.isNaN(item.value)) continue;
    const level =
      item.level || calculateMotiLevel(item.value, threshold.thresholds);
    if (!level) continue;
    const tone: PostureFinding["tone"] =
      level === "maintain" ? "good" : level === "warn" ? "warn" : "danger";
    items.push({
      label: threshold.name,
      value: `${item.value}${threshold.unit}`,
      tone,
    });
  }
  if (items.length === 0) return null;
  const order: Record<PostureFinding["tone"], number> = {
    danger: 0,
    warn: 1,
    good: 2,
  };
  items.sort((a, b) => order[a.tone] - order[b.tone]);
  return items.slice(0, 5);
}

function ageFromBirthdate(birthdate: string | null | undefined): number | null {
  if (!birthdate) return null;
  const d = new Date(birthdate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const beforeBirthday =
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export default function IntegratedAssessmentPage() {
  const [, params] = useRoute<{ id: string; evalId: string }>(
    "/clients/:id/assessment/:evalId"
  );
  const [, setLocation] = useLocation();
  const rawClientId = params?.id ?? "";
  const parsedClientId = Number(rawClientId);
  const clientId =
    Number.isFinite(parsedClientId) && parsedClientId > 0
      ? parsedClientId
      : null;
  const parsedEvalId = params?.evalId ? Number(params.evalId) : NaN;
  const evaluationId =
    Number.isFinite(parsedEvalId) && parsedEvalId > 0
      ? parsedEvalId
      : undefined;

  // Real client identity for the sidebar / header.
  const clientQuery = trpc.clients.get.useQuery(
    { id: clientId ?? 0 },
    { enabled: clientId != null }
  );
  const realClient = clientQuery.data;

  // Real evaluation row — main page hydrates its editable state from here
  // on first load, then writes changes back via autosave.
  const evalQuery = trpc.evaluation.get.useQuery(
    { id: evaluationId ?? 0 },
    { enabled: !!evaluationId, refetchOnWindowFocus: false }
  );
  const evalRow = evalQuery.data;
  const utils = trpc.useUtils();
  const updateMutation = trpc.evaluation.update.useMutation();

  // Read-only posture findings: derive from eval.motiRiskValues if any
  // values have been entered yet, otherwise fall back to demo so the
  // section never renders blank for new evaluations.
  const postureFindings = useMemo(() => {
    const derived = derivePostureFindings(
      (evalRow as any)?.motiRiskValues ?? null
    );
    return derived ?? demoPostureFindings;
  }, [evalRow]);

  // 4-week plan: prefer eval.weekPlan json column when populated.
  const weekPlanItems = useMemo(() => {
    const raw = (evalRow as any)?.weekPlan;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return demoWeekPlan;
  }, [evalRow]);

  // Read-only complaint section: prefer eval row fields, fall back to demo.
  const complaintRows = useMemo(() => {
    if (!evalRow) return null;
    const row = evalRow as any;
    return {
      symptomAreas:
        row.currentSymptomLocation || demoComplaint.symptomAreas,
      triggerActions:
        row.currentSymptomTrigger || demoComplaint.triggerActions,
      injuryHistory: row.injuryHistory || demoComplaint.injuryHistory,
      surgeryHistory: row.surgeryHistory || demoComplaint.surgeryHistory,
      medicalDiagnosis:
        row.medicalDiagnosis || demoComplaint.medicalDiagnosis,
      sleepStatus: row.sleepCondition || demoComplaint.sleepStatus,
      goals: row.goalsAndExpectations || demoComplaint.goals,
    };
  }, [evalRow]);

  // Invalid / missing evalId in the URL — bounce back to the client page.
  // Wrap in effect so we don't navigate during render.
  useEffect(() => {
    if (params && (!evaluationId || clientId == null)) {
      setLocation(clientId != null ? `/clients/${clientId}` : "/clients");
    }
  }, [params, evaluationId, clientId, setLocation]);

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

  // Hydrate from server eval row once. Subsequent autosaves push back to
  // the server, so we don't re-hydrate on every refetch (that would clobber
  // mid-edit local state).
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!evalRow || hydratedRef.current) return;
    if ((evalRow as any).topThreeIssues)
      setTopIssues((evalRow as any).topThreeIssues);
    if ((evalRow as any).interventionTypes)
      setInterventions((evalRow as any).interventionTypes);
    if (typeof evalRow.interventionNotes === "string" && evalRow.interventionNotes)
      setInterventionNotes(evalRow.interventionNotes);
    if (typeof evalRow.plainExplanation === "string" && evalRow.plainExplanation)
      setPlainExplanation(evalRow.plainExplanation);
    // reportNotes maps to the legacy `notes` column (training notes) only
    // when no client-facing explanation has been written. Leave as demo
    // default for now.
    hydratedRef.current = true;
  }, [evalRow]);

  // Reset hydration when evaluationId changes.
  useEffect(() => {
    hydratedRef.current = false;
  }, [evaluationId]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTabKey>("basic");
  const [prescriptionPickerOpen, setPrescriptionPickerOpen] = useState(false);
  const [generateReportOpen, setGenerateReportOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionSelection[]>([
    ...DEFAULT_DEMO_PRESCRIPTIONS,
  ]);

  const openDrawer = (tab: DrawerTabKey) => {
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  const TAB_TO_DRAWER: Record<string, DrawerTabKey> = {
    complaint: "basic",
    posture: "posture",
    functional: "functional",
    "body-comp": "body-comp",
    neuromuscular: "redcord",
  };

  const handleTabChange = (key: string) => {
    if (TAB_TO_DRAWER[key]) {
      openDrawer(TAB_TO_DRAWER[key]);
      // stay on 綜合結論 view so the page-level layout is preserved
      setActiveTab("summary");
    } else {
      setActiveTab(key);
    }
  };

  const formSnapshot = useMemo(
    () => ({
      judgment,
      topIssues,
      interventions,
      interventionNotes,
      plainExplanation,
      reportNotes,
      prescriptionIds: prescriptions.map((p) => p.prescriptionId),
    }),
    [
      judgment,
      topIssues,
      interventions,
      interventionNotes,
      plainExplanation,
      reportNotes,
      prescriptions,
    ]
  );

  const { status: autosaveStatus, lastSavedAt } = useAutosave(
    formSnapshot,
    async () => {
      // Only persist after hydration completes and we have a real eval row.
      if (!evaluationId || !hydratedRef.current) return;
      await updateMutation.mutateAsync({
        id: evaluationId,
        data: {
          topThreeIssues: topIssues,
          interventionTypes: interventions,
          interventionNotes,
          plainExplanation,
        },
      });
      // Other consumers (Drawer Provider, ClientDetail eval list) re-read
      // after each save.
      utils.evaluation.get.invalidate({ id: evaluationId });
      utils.evaluation.listByClient.invalidate();
    },
    { delayMs: 1500 }
  );
  const autosaveAt = lastSavedAt
    ? lastSavedAt.toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "17:28";

  return (
    <TherapistLayout activeKey="integrated">
      <AssessmentHeader
        title="客戶整合評估"
        autosaveAt={autosaveAt}
        autosaveStatus={autosaveStatus}
        tabs={demoTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onBack={() => window.history.back()}
        onImport={() => openDrawer("basic")}
      />

      <div className="flex flex-col xl:flex-row">
        <div className="hidden lg:block">
        <ClientSidebar
          client={
            realClient
              ? {
                  initial: realClient.name.trim()[0] ?? "?",
                  name: realClient.name,
                  age: ageFromBirthdate(realClient.birthdate) ?? demoClient.age,
                  gender: realClient.gender ?? demoClient.gender,
                  height: realClient.height ?? demoClient.height,
                  weight: realClient.weight ?? demoClient.weight,
                }
              : demoClient
          }
          complaint={realClient?.primaryConcern || `久坐後下背與頸部痠痛,深蹲時右膝不適。`}
          goals="改善痠痛並增進運動與穩定度。"
          progress={demoEvaluationProgress}
        />
        </div>

        <div className="flex-1 min-w-0 p-4 sm:p-6 space-y-5">
          {/* All tabs always show the summary view; non-summary tabs open the
              Drawer to the matching form (see handleTabChange). */}
          <>
            <span className="sr-only">client {clientId}</span>
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
                        {(complaintRows ?? demoComplaint)[r.key]}
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
                    {postureFindings.map((f) => (
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
                        <button
                          aria-label={`調整第 ${i + 1} 優先問題`}
                          className="p-1 rounded hover:bg-muted"
                        >
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
                  {weekPlanItems.map((wp: typeof demoWeekPlan[number], i: number) => (
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
        </div>

        <div className="hidden xl:block">
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
          onSaveDraft={() => toast.success("草稿已儲存", { description: "Week 4 接 tRPC 後會寫回資料庫" })}
          onAssignPlan={() => setPrescriptionPickerOpen(true)}
          onGenerateReport={() => setGenerateReportOpen(true)}
          onRefreshPreview={() => toast.info("預覽即時更新", { description: "白話說明會在客戶端同步顯示" })}
        />
        </div>
      </div>

      <EvaluationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialTab={drawerTab}
        evaluationId={evaluationId}
      />

      <PrescriptionPicker
        open={prescriptionPickerOpen}
        onOpenChange={setPrescriptionPickerOpen}
        selected={prescriptions}
        onConfirm={setPrescriptions}
      />

      <GenerateReportDialog
        open={generateReportOpen}
        onOpenChange={setGenerateReportOpen}
        clientName={realClient?.name ?? demoClient.name}
        evaluationDate="2026/05/13"
        scoreSummary={`${demoReportSummary.riskLevel.score} / 100 · ${demoReportSummary.riskLevel.label}`}
        topIssuesCount={topIssues.length}
        prescriptionsCount={prescriptions.length}
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

