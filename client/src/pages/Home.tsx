import { useState } from "react";
import { Link, useLocation } from "wouter";
import { NewClientDialog } from "@/components/organisms/NewClientDialog";
import { TherapistLayout } from "@/components/templates/TherapistLayout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/atoms/StatusPill";
import { ChipToggle } from "@/components/atoms/ChipToggle";
import { cn } from "@/lib/utils";
import { demoClientList, type DemoClientListItem } from "@/lib/demo-data";
import {
  UserPlus,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Calendar,
} from "lucide-react";

const STATUS_LABEL: Record<DemoClientListItem["status"], string> = {
  active: "進行中",
  pending: "待安排",
  completed: "已結案",
};

const STATUS_TONE: Record<
  DemoClientListItem["status"],
  "good" | "warn" | "neutral"
> = {
  active: "good",
  pending: "warn",
  completed: "neutral",
};

type StatusFilter = DemoClientListItem["status"] | "all";

export default function Home() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [, navigate] = useLocation();

  const filtered = demoClientList.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    const q = query.trim();
    if (!q) return true;
    return (
      c.name.includes(q) ||
      c.primaryConcern.includes(q) ||
      c.id.includes(q.toLowerCase())
    );
  });

  const activeCount = demoClientList.filter((c) => c.status === "active").length;
  const pendingCount = demoClientList.filter((c) => c.status === "pending").length;
  const avgScore = Math.round(
    demoClientList.reduce((s, c) => s + c.lastScore, 0) / demoClientList.length
  );

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="客戶總數"
            value={demoClientList.length}
            hint="目前所有檔案"
          />
          <KpiCard
            label="進行中"
            value={activeCount}
            hint="評估或訓練週期內"
            tone="good"
          />
          <KpiCard
            label="待安排"
            value={pendingCount}
            hint="需要排程下次評估"
            tone="warn"
          />
          <KpiCard
            label="平均分數"
            value={avgScore}
            suffix={<span className="text-sm text-muted-foreground">/ 100</span>}
            hint="近期評估"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
              全部({demoClientList.length})
            </ChipToggle>
            <ChipToggle
              size="sm"
              selected={filter === "active"}
              onToggle={() => setFilter("active")}
            >
              進行中({activeCount})
            </ChipToggle>
            <ChipToggle
              size="sm"
              selected={filter === "pending"}
              onToggle={() => setFilter("pending")}
            >
              待安排({pendingCount})
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <a className="rounded-xl border bg-card p-4 hover:shadow-md hover:border-brand-primary/40 transition-all group block">
                <div className="flex items-start gap-3">
                  <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-client-warm text-brand-primary font-display text-lg font-bold shrink-0">
                    {c.initial}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-display font-semibold truncate">
                        {c.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {c.age} 歲 · {c.gender}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {c.primaryConcern}
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
                      上次評估
                    </p>
                    <p className="font-display text-sm font-medium tabular-nums">
                      {c.lastEvaluation}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">當前分數</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-xl font-bold tabular-nums text-brand-primary">
                        {c.lastScore}
                      </span>
                      <TrendBadge delta={c.trend} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  進入評估
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </a>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            沒有符合條件的客戶
          </p>
        )}
      </div>

      <NewClientDialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
        onCreate={(data) => {
          // Stub: in real flow, tRPC mutation creates client then we
          // navigate to /clients/<id>/assessment. For demo we just hop
          // to chen xiaoyans assessment so the new-eval flow runs.
          console.log("New client (stub):", data);
          navigate(`/clients/demo-001/assessment`);
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

function TrendBadge({ delta }: { delta: number }) {
  if (delta === 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="w-3 h-3" />0
      </span>
    );
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-status-good">
        <TrendingUp className="w-3 h-3" />+{delta}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-status-danger">
      <TrendingDown className="w-3 h-3" />
      {delta}
    </span>
  );
}
