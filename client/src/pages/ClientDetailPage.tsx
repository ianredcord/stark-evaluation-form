import { useRoute, Link, useLocation } from "wouter";
import { toast } from "sonner";
import { TherapistLayout } from "@/components/templates/TherapistLayout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/atoms/StatusPill";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ClipboardList,
  Loader2,
  Plus,
  ExternalLink,
} from "lucide-react";
import type { Client } from "../../../drizzle/schema";

function initialFor(name: string) {
  return name.trim()[0] ?? "?";
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

const STATUS_LABEL: Record<Client["status"], string> = {
  active: "進行中",
  pending: "待安排",
  completed: "已結案",
};

const STATUS_TONE: Record<Client["status"], "good" | "warn" | "neutral"> = {
  active: "good",
  pending: "warn",
  completed: "neutral",
};

export default function ClientDetailPage() {
  const [, params] = useRoute<{ id: string }>("/clients/:id");
  const rawId = params?.id ?? "";
  const parsedId = Number(rawId);
  const clientId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;
  const [, setLocation] = useLocation();

  const clientQuery = trpc.clients.get.useQuery(
    { id: clientId ?? 0 },
    { enabled: clientId != null }
  );
  const evalListQuery = trpc.evaluation.listByClient.useQuery(
    { clientId: clientId ?? 0 },
    { enabled: clientId != null }
  );
  const utils = trpc.useUtils();
  const createMutation = trpc.evaluation.create.useMutation({
    onSuccess: () => {
      if (clientId != null)
        utils.evaluation.listByClient.invalidate({ clientId });
    },
  });

  const client = clientQuery.data ?? null;
  const evaluations = evalListQuery.data ?? [];

  const handleStartNewEvaluation = async () => {
    if (clientId == null) return;
    try {
      const result = await createMutation.mutateAsync({ clientId });
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

  if (clientId == null) {
    return (
      <TherapistLayout activeKey="clients">
        <div className="p-6 space-y-2">
          <p className="text-muted-foreground">無效的客戶 ID</p>
          <Link href="/clients">
            <a className="text-brand-primary text-sm underline">返回客戶列表</a>
          </Link>
        </div>
      </TherapistLayout>
    );
  }

  if (clientQuery.isLoading) {
    return (
      <TherapistLayout activeKey="clients">
        <div className="p-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> 載入中…
        </div>
      </TherapistLayout>
    );
  }

  if (!client) {
    return (
      <TherapistLayout activeKey="clients">
        <div className="p-6 space-y-2">
          <p className="text-muted-foreground">找不到此客戶</p>
          <Link href="/clients">
            <a className="text-brand-primary text-sm underline">返回客戶列表</a>
          </Link>
        </div>
      </TherapistLayout>
    );
  }

  const age = ageFromBirthdate(client.birthdate);

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
              {initialFor(client.name)}
            </span>
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold">
                  {client.name}
                </h1>
                <span className="text-sm text-muted-foreground">
                  {age != null ? `${age} 歲` : "—"}
                  {client.gender ? ` · ${client.gender}` : ""}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {client.primaryConcern || "—"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <StatusPill status={STATUS_TONE[client.status]} size="sm">
                  {STATUS_LABEL[client.status]}
                </StatusPill>
                <span className="text-xs text-muted-foreground tabular-nums">
                  ID: #{client.id}
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

        {/* Real evaluations list */}
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
          ) : evaluations.length === 0 ? (
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
              {evaluations.map((evalRow, i) => {
                const displayDate =
                  evalRow.date ||
                  (evalRow.createdAt
                    ? new Date(evalRow.createdAt).toISOString().slice(0, 10)
                    : "—");
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
                      {evalRow.chiefComplaint && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {evalRow.chiefComplaint}
                        </p>
                      )}
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
