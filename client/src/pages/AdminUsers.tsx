import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { TherapistLayout } from "@/components/templates/TherapistLayout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/atoms/StatusPill";
import { ChipToggle } from "@/components/atoms/ChipToggle";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Search,
  Shield,
  ShieldOff,
  Loader2,
  RefreshCw,
} from "lucide-react";

type LoginMethod = "google" | "line" | "dev-bypass" | string | null | undefined;
type Role = "user" | "admin";
type FilterKey = "all" | LoginMethod;

const METHOD_LABEL: Record<string, string> = {
  google: "Google",
  line: "LINE",
  "dev-bypass": "Dev Bypass",
};

const METHOD_TONE: Record<string, "good" | "warn" | "neutral"> = {
  google: "good",
  line: "good",
  "dev-bypass": "warn",
};

function formatRelative(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "剛剛";
  if (min < 60) return `${min} 分鐘前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小時前`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} 天前`;
  return date.toLocaleDateString("zh-TW");
}

export default function AdminUsers() {
  const { user: me, loading: meLoading } = useAuth();
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const usersQuery = trpc.admin.users.list.useQuery(undefined, {
    enabled: !!me && me.role === "admin",
  });
  const updateRoleMutation = trpc.admin.users.updateRole.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("角色已更新");
        usersQuery.refetch();
      } else {
        toast.error("更新失敗", { description: data.error ?? "未知錯誤" });
      }
    },
    onError: (e) => toast.error("更新失敗", { description: e.message }),
  });

  if (meLoading) {
    return (
      <TherapistLayout activeKey="integrated">
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      </TherapistLayout>
    );
  }

  if (!me || me.role !== "admin") {
    return (
      <TherapistLayout activeKey="integrated">
        <div className="p-6 sm:p-12 max-w-md mx-auto text-center space-y-3">
          <ShieldOff className="w-10 h-10 mx-auto text-status-danger" />
          <h1 className="font-display text-2xl font-bold">沒有權限</h1>
          <p className="text-sm text-muted-foreground">
            這個頁面需要管理員權限。請聯絡你的治療師主管。
          </p>
          <Button onClick={() => navigate("/clients")} variant="outline">
            返回客戶總覽
          </Button>
        </div>
      </TherapistLayout>
    );
  }

  const users = usersQuery.data ?? [];
  const filtered = users.filter((u) => {
    if (filter !== "all" && (u.loginMethod ?? "") !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name?.toLowerCase().includes(q) ?? false) ||
      (u.email?.toLowerCase().includes(q) ?? false) ||
      u.openId.toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const recentCount = users.filter((u) => {
    if (!u.lastSignedIn) return false;
    const d = new Date(u.lastSignedIn);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const handleRoleChange = (id: number, role: Role) => {
    if (
      !confirm(role === "admin" ? "把這位使用者升級為 admin?" : "把這位 admin 降為一般使用者?")
    ) {
      return;
    }
    updateRoleMutation.mutate({ id, role });
  };

  return (
    <TherapistLayout activeKey="integrated">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-primary" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                使用者管理
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              查看所有登入過系統的帳號 · 管理角色權限
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => usersQuery.refetch()}
            disabled={usersQuery.isFetching}
            className="gap-1.5"
          >
            <RefreshCw
              className={cn("w-4 h-4", usersQuery.isFetching && "animate-spin")}
            />
            重新整理
          </Button>
        </header>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="使用者總數" value={users.length} />
          <KpiCard
            label="管理員"
            value={adminCount}
            tone="good"
            hint="可進入此頁"
          />
          <KpiCard
            label="近 7 天活躍"
            value={recentCount}
            tone="good"
            hint="lastSignedIn 統計"
          />
          <KpiCard
            label="登入方式"
            value={
              new Set(users.map((u) => u.loginMethod || "unknown")).size
            }
            hint="dev / google / line ..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋姓名 / Email / openId..."
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <ChipToggle
              size="sm"
              selected={filter === "all"}
              onToggle={() => setFilter("all")}
            >
              全部({users.length})
            </ChipToggle>
            <ChipToggle
              size="sm"
              selected={filter === "google"}
              onToggle={() => setFilter("google")}
            >
              Google
            </ChipToggle>
            <ChipToggle
              size="sm"
              selected={filter === "line"}
              onToggle={() => setFilter("line")}
            >
              LINE
            </ChipToggle>
            <ChipToggle
              size="sm"
              selected={filter === "dev-bypass"}
              onToggle={() => setFilter("dev-bypass")}
            >
              Dev Bypass
            </ChipToggle>
          </div>
        </div>

        {/* User table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">使用者</th>
                  <th className="text-left px-4 py-3 font-medium">登入方式</th>
                  <th className="text-left px-4 py-3 font-medium">角色</th>
                  <th className="text-left px-4 py-3 font-medium">最後登入</th>
                  <th className="text-left px-4 py-3 font-medium">建立日期</th>
                  <th className="text-right px-4 py-3 font-medium">動作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {usersQuery.isLoading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!usersQuery.isLoading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      沒有符合條件的使用者
                    </td>
                  </tr>
                )}
                {filtered.map((u) => {
                  const method = (u.loginMethod ?? "unknown") as LoginMethod;
                  const isMe = u.id === me.id;
                  return (
                    <tr key={u.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-client-warm text-brand-primary font-display font-semibold text-xs">
                            {(u.name || u.email || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium truncate flex items-center gap-1.5">
                              {u.name || "(未提供姓名)"}
                              {isMe && (
                                <span className="text-[10px] text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                                  你
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {u.email || u.openId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          status={
                            METHOD_TONE[method as string] ?? "neutral"
                          }
                          size="sm"
                        >
                          {METHOD_LABEL[method as string] ?? method ?? "未知"}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          status={u.role === "admin" ? "good" : "neutral"}
                          size="sm"
                        >
                          {u.role === "admin" ? "管理員" : "使用者"}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {formatRelative(u.lastSignedIn)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {formatRelative(u.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role === "admin" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isMe || updateRoleMutation.isPending}
                            onClick={() => handleRoleChange(u.id, "user")}
                            className="text-xs"
                          >
                            降為使用者
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updateRoleMutation.isPending}
                            onClick={() => handleRoleChange(u.id, "admin")}
                            className="text-xs"
                          >
                            升為管理員
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          說明:這個頁面只有 <code>role=admin</code> 能看到。
          目前使用 Google / LINE / Dev Bypass 三種登入方式。停用帳號功能 Phase 2 加上。
        </p>
      </div>
    </TherapistLayout>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
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
      </p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
