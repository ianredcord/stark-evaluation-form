import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { NewClientDialog } from "@/components/organisms/NewClientDialog";
import { TherapistLayout } from "@/components/templates/TherapistLayout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/atoms/StatusPill";
import { ChipToggle } from "@/components/atoms/ChipToggle";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { UserPlus, Search, ArrowRight, Calendar, Loader2 } from "lucide-react";
import type { Client } from "../../../drizzle/schema";

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

type StatusFilter = Client["status"] | "all";

function initialFor(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // Prefer the last (CJK family-name-first) or first (Latin) character.
  return trimmed[0];
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

export default function Home() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [, navigate] = useLocation();

  const clientsQuery = trpc.clients.list.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => utils.clients.list.invalidate(),
  });

  const clients = clientsQuery.data ?? [];

  const counts = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter(c => c.status === "active").length,
      pending: clients.filter(c => c.status === "pending").length,
    };
  }, [clients]);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      if (filter !== "all" && c.status !== filter) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.primaryConcern ?? "").toLowerCase().includes(q) ||
        String(c.id).includes(q)
      );
    });
  }, [clients, filter, query]);

  return (
    <TherapistLayout activeKey="clients">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              客戶總覽
            </h1>
            <p className="text-sm text-muted-foreground">
              管理你的客戶評估與追蹤進度
            </p>
          </div>
          <Button
            onClick={() => setNewClientOpen(true)}
            className="gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white"
          >
            <UserPlus className="w-4 h-4" />
            新增客戶
          </Button>
        </header>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KpiCard label="客戶總數" value={counts.total} hint="目前所有檔案" />
          <KpiCard
            label="進行中"
            value={counts.active}
            hint="評估或訓練週期內"
            tone="good"
          />
          <KpiCard
            label="待安排"
            value={counts.pending}
            hint="需要排程下次評估"
            tone="warn"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜尋客戶姓名 / 主訴 / 編號..."
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <ChipToggle
              size="sm"
              selected={filter === "all"}
              onToggle={() => setFilter("all")}
            >
              全部({counts.total})
            </ChipToggle>
            <ChipToggle
              size="sm"
              selected={filter === "active"}
              onToggle={() => setFilter("active")}
            >
              進行中({counts.active})
            </ChipToggle>
            <ChipToggle
              size="sm"
              selected={filter === "pending"}
              onToggle={() => setFilter("pending")}
            >
              待安排({counts.pending})
            </ChipToggle>
            <ChipToggle
              size="sm"
              selected={filter === "completed"}
              onToggle={() => setFilter("completed")}
            >
              已結案
            </ChipToggle>
          </div>
        </div>

        {/* Client cards */}
        {clientsQuery.isLoading ? (
          <div className="rounded-xl border bg-card p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> 載入中…
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-12 text-center space-y-3">
            <UserPlus className="w-10 h-10 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">還沒有客戶</p>
              <p className="text-xs text-muted-foreground mt-1">
                點「新增客戶」建立第一份客戶檔案
              </p>
            </div>
            <Button
              onClick={() => setNewClientOpen(true)}
              className="gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white"
            >
              <UserPlus className="w-4 h-4" />
              新增客戶
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(c => {
              const age = ageFromBirthdate(c.birthdate);
              return (
                <Link key={c.id} href={`/clients/${c.id}`}>
                  <a className="rounded-xl border bg-card p-4 hover:shadow-md hover:border-brand-primary/40 transition-all group block">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-client-warm text-brand-primary font-display text-lg font-bold shrink-0">
                        {initialFor(c.name)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="font-display font-semibold truncate">
                            {c.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {age != null ? `${age} 歲` : "—"}
                            {c.gender ? ` · ${c.gender}` : ""}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {c.primaryConcern || "—"}
                        </p>
                      </div>
                      <StatusPill status={STATUS_TONE[c.status]} size="sm">
                        {STATUS_LABEL[c.status]}
                      </StatusPill>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          建立時間
                        </p>
                        <p className="font-display text-sm font-medium tabular-nums">
                          {new Date(c.createdAt).toISOString().slice(0, 10)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ID</p>
                        <p className="font-display text-sm font-medium tabular-nums">
                          #{c.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      進入評估
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        )}

        {clients.length > 0 && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            沒有符合條件的客戶
          </p>
        )}
      </div>

      <NewClientDialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
        onCreate={async data => {
          try {
            const result = await createMutation.mutateAsync({
              name: data.name,
              birthdate: data.birthdate || undefined,
              gender: data.gender || undefined,
              height: data.height || null,
              weight: data.weight || null,
              phone: data.phone || undefined,
              primaryConcern: data.primaryConcern || undefined,
            });
            if (result.id) {
              navigate(`/clients/${result.id}`);
            } else {
              toast.error("無法建立客戶");
            }
          } catch (error) {
            console.error(error);
            toast.error("建立客戶失敗");
          }
        }}
      />
    </TherapistLayout>
  );
}

function KpiCard({
  label,
  value,
  suffix,
  hint,
  tone,
}: {
  label: string;
  value: number;
  suffix?: React.ReactNode;
  hint?: string;
  tone?: "good" | "warn" | "danger";
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-display text-3xl font-bold tabular-nums",
          tone === "good" && "text-status-good",
          tone === "warn" && "text-status-warn",
          tone === "danger" && "text-status-danger",
          !tone && "text-foreground"
        )}
      >
        {value}
        {suffix}
      </p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
