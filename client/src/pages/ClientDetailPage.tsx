import { useRoute, Link, useLocation } from "wouter";
import { toast } from "sonner";
import { TherapistLayout } from "@/components/templates/TherapistLayout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/atoms/StatusPill";
import { ScoreRing } from "@/components/atoms/ScoreRing";
import { ScoreHistoryChart } from "@/components/organisms/ScoreHistoryChart";
import { demoClientList, demoEvaluationHistory } from "@/lib/demo-data";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ClipboardList,
  Loader2,
  Plus,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from "lucide-react";

export default function ClientDetailPage() {
  const [, params] = useRoute<{ id: string }>("/clients/:id");
  const clientId = params?.id ?? "demo-001";
  const [, setLocation] = useLocation();

  // Client identity still comes from demo data — real client CRUD lands in
  // PR C. The evaluation list, however, comes from tRPC.
  const client = demoClientList.find(c => c.id === clientId);

  const evalListQuery = trpc.evaluation.list.useQuery();
  const createMutation = trpc.evaluation.create.useMutation();

  // Score history is still demo until PR D wires structured scores end to
  // end. The historyDemo lookup keeps the existing trend chart alive.
  const historyDemo = demoEvaluationHistory[clientId] ?? [];

  const handleStartNewEvaluation = async () => {
    try {
      const result = await createMutation.mutateAsync({});
      if (result.id) {
        setLocation(`/clients/${clientId}/assessment/${result.id}`);
      } else {
        toast.error("無法建立新評估");
      }
    } catch (error) {
      console.error(error);
      toast.error("建立評估失敗");
    }
  };

  if (!client) {
    return (
      <TherapistLayout activeKey="clients">
        <div className="p-6">
          <p className="text-muted-foreground">找不到此客戶</p>
          <Link href="/clients">
            <a className="text-brand-primary text-sm underline">返回客戶列表</a>
          </Link>
        </div>
      </TherapistLayout>
    );
  }

  const latest = historyDemo[0];
  const previous = historyDemo[1];
  const delta =
    latest && previous ? latest.overallScore - previous.overallScore : 0;
  const points = [...historyDemo]
    .reverse()
    .map(h => ({ date: h.date.slice(5), value: h.overallScore }));

  const realEvaluations = evalListQuery.data ?? [];

  return (
    <TherapistLayout activeKey="clients">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
        <Link href="/clients">
          <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            返回客戶列表
          </a>
        </Link>

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-4">
            <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-client-warm text-brand-primary font-display text-2xl font-bold">
              {client.initial}
            </span>
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold">
                  {client.name}
                </h1>
                <span className="text-sm text-muted-foreground">
                  {client.age} 歲 · {client.gender}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {client.primaryConcern}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <StatusPill
                  status={
                    client.status === "active"
                      ? "good"
                      : client.status === "pending"
                        ? "warn"
                        : "neutral"
                  }
                  size="sm"
                >
                  {client.status === "active"
                    ? "進行中"
                    : client.status === "pending"
                      ? "待安排"
                      : "已結案"}
                </StatusPill>
                <span className="text-xs text-muted-foreground tabular-nums">
                  ID: {client.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleStartNewEvaluation}
              disabled={createMutation.isPending}
              className="gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white w-full"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              開始新評估
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.info("複評排程", {
                  description: "Phase 2 接行事曆 API",
                })
              }
              className="gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              排程複評
            </Button>
          </div>
        </header>

        {/* Summary row (still demo data) */}
        {latest && (
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-center rounded-xl border bg-card p-5">
            <ScoreRing
              value={latest.overallScore}
              size="lg"
              color={
                latest.overallScore >= 80
                  ? "good"
                  : latest.overallScore >= 60
                    ? "primary"
                    : "warn"
              }
              label={`最近評估 ${latest.date}`}
            />
            <div className="space-y-2">
              <h2 className="font-display text-lg font-semibold">
                最近一次評估摘要
              </h2>
              <p className="text-sm text-muted-foreground">
                {latest.topConcern}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <SubScore label="姿勢結構" value={latest.postureScore} />
                <SubScore label="動作功能" value={latest.movementScore} />
                <SubScore label="神經肌肉" value={latest.neuroScore} />
                <SubScore label="體組成" value={latest.bodyScore} />
              </div>
            </div>
            <div className="space-y-1.5 sm:text-right">
              <p className="text-xs text-muted-foreground">與上次相比</p>
              <TrendBadge delta={delta} />
              <p className="text-xs text-muted-foreground">
                共 {historyDemo.length} 次評估
              </p>
            </div>
          </div>
        )}

        {/* Trend chart (still demo) */}
        {historyDemo.length > 1 && (
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg font-semibold mb-3">
              整體分數趨勢
            </h2>
            <ScoreHistoryChart points={points} color="primary" />
          </section>
        )}

        {/* Real evaluations list (from tRPC) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">歷次評估</h2>
            <button
              onClick={handleStartNewEvaluation}
              disabled={createMutation.isPending}
              className="text-xs text-brand-primary hover:text-brand-primary-dark inline-flex items-center gap-1 disabled:opacity-50"
            >
              新增評估
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {evalListQuery.isLoading ? (
            <div className="rounded-lg border bg-card p-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> 載入中…
            </div>
          ) : realEvaluations.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-card p-8 text-center space-y-3">
              <ClipboardList className="w-8 h-8 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">還沒有評估資料</p>
                <p className="text-xs text-muted-foreground mt-1">
                  點「開始新評估」建立第一份評估表
                </p>
              </div>
              <Button
                onClick={handleStartNewEvaluation}
                disabled={createMutation.isPending}
                className="gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                開始新評估
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {realEvaluations.map((evalRow, i) => {
                const displayDate =
                  evalRow.date ||
                  (evalRow.createdAt
                    ? new Date(evalRow.createdAt).toISOString().slice(0, 10)
                    : "—");
                const displayName = evalRow.clientName || "未命名";
                return (
                  <div
                    key={evalRow.id}
                    className="rounded-lg border bg-card p-4 flex items-center gap-3"
                  >
                    <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-bg-subtle text-foreground shrink-0">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="font-display font-semibold text-sm">
                          {displayDate}
                        </p>
                        {i === 0 && (
                          <StatusPill status="good" size="sm">
                            最新
                          </StatusPill>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {displayName}
                        {evalRow.chiefComplaint
                          ? ` · ${evalRow.chiefComplaint}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        #{evalRow.id}
                      </span>
                      <Link
                        href={`/clients/${clientId}/assessment/${evalRow.id}`}
                      >
                        <a className="p-2 rounded-md hover:bg-muted">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </TherapistLayout>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

function TrendBadge({ delta }: { delta: number }) {
  if (delta === 0)
    return (
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        持平
      </span>
    );
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-status-good">
        <TrendingUp className="w-4 h-4" />+{delta} 分
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-status-danger">
      <TrendingDown className="w-4 h-4" />
      {delta} 分
    </span>
  );
}
