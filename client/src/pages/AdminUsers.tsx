import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { TherapistLayout } from "@/components/templates/TherapistLayout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/atoms/StatusPill";
import { ChipToggle } from "@/components/atoms/ChipToggle";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Search,
  Shield,
  ShieldOff,
  Loader2,
  RefreshCw,
  Power,
  PowerOff,
} from "lucide-react";

type LoginMethod = "google" | "line" | "dev-bypass" | string | null | undefined;
type UserRole =
  | "super_admin"
  | "admin"
  | "therapist"
  | "assistant"
  | "viewer"
  | "user";
type UserStatus = "active" | "disabled";
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

const ROLE_OPTIONS: { value: Exclude<UserRole, "user">; label: string; hint: string }[] =
  [
    {
      value: "super_admin",
      label: "Super Admin",
      hint: "全權 · 可管理 admin",
    },
    {
      value: "admin",
      label: "管理員",
      hint: "管理一般使用者 + 系統設定",
    },
    {
      value: "therapist",
      label: "治療師",
      hint: "建客戶 / 開評估 / 開處方(預設)",
    },
    {
      value: "assistant",
      label: "助理",
      hint: "只能看,不能編輯",
    },
    {
      value: "viewer",
      label: "唯讀",
      hint: "唯讀(實習 / 觀察)",
    },
  ];

const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "管理員",
  therapist: "治療師",
  assistant: "助理",
  viewer: "唯讀",
  user: "(舊版 user)",
};

const ROLE_TONE: Record<UserRole, "good" | "warn" | "danger" | "neutral"> = {
  super_admin: "danger",
  admin: "good",
  therapist: "neutral",
  assistant: "neutral",
  viewer: "neutral",
  user: "warn",
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
  const [openRoleMenu, setOpenRoleMenu] = useState<number | null>(null);

  const usersQuery = trpc.admin.users.list.useQuery(undefined, {
    enabled:
      !!me && (me.role === "super_admin" || me.role === "admin"),
  });
  const updateRoleMutation = trpc.admin.users.updateRole.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("角色已更新");
        usersQuery.refetch();
      } else {
        toast.error("更新失敗", { description: data.error ?? "未知錯誤" });
      }
      setOpenRoleMenu(null);
    },
    onError: (e) => toast.error("更新失敗", { description: e.message }),
  });
  const updateStatusMutation = trpc.admin.users.updateStatus.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("狀態已更新");
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

  const myRole = me?.role as UserRole | undefined;
  const isAdmin = myRole === "super_admin" || myRole === "admin";

  if (!me || !isAdmin) {
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

  const adminCount = users.filter((u) =>
    ["super_admin", "admin"].includes(u.role)
  ).length;
  const disabledCount = users.filter((u) => u.status === "disabled").length;
  const recentCount = users.filter((u) => {
    if (!u.lastSignedIn) return false;
    const d = new Date(u.lastSignedIn);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const handleRoleChange = (id: number, role: Exclude<UserRole, "user">) => {
    if (!confirm(`把這位使用者改為「${ROLE_LABEL[role]}」?`)) return;
    updateRoleMutation.mutate({ id, role });
  };

  const handleStatusToggle = (id: number, current: UserStatus) => {
    const next: UserStatus = current === "active" ? "disabled" : "active";
    const verb = next === "disabled" ? "停用" : "啟用";
    if (!confirm(`確定${verb}這個帳號?${next === "disabled" ? "(停用後該使用者無法登入)" : ""}`)) {
      return;
    }
    updateStatusMutation.mutate({ id, status: next });
  };

  // Whether current user can grant/change roles of other user
  const canChangeRole = (target: { role: string; id: number }) => {
    // Self: limited (server-side checks anyway)
    if (target.id === me.id) {
      return target.role === "super_admin" || target.role === "admin";
    }
    // Non-super_admin cannot touch super_admin
    if (target.role === "super_admin" && myRole !== "super_admin") return false;
    return true;
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
              5 種角色階層 · 啟用 / 停用帳號 · 你的角色:
              <span className="ml-1 font-semibold">
                {ROLE_LABEL[myRole ?? "viewer"]}
              </span>
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="使用者總數" value={users.length} />
          <KpiCard label="管理員" value={adminCount} tone="good" hint="super + admin" />
          <KpiCard label="近 7 天活躍" value={recentCount} tone="good" />
          <KpiCard
            label="已停用"
            value={disabledCount}
            tone={disabledCount > 0 ? "danger" : undefined}
          />
        </div>

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
            <ChipToggle size="sm" selected={filter === "google"} onToggle={() => setFilter("google")}>
              Google
            </ChipToggle>
            <ChipToggle size="sm" selected={filter === "line"} onToggle={() => setFilter("line")}>
              LINE
            </ChipToggle>
            <ChipToggle size="sm" selected={filter === "dev-bypass"} onToggle={() => setFilter("dev-bypass")}>
              Dev Bypass
            </ChipToggle>
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">使用者</th>
                  <th className="text-left px-4 py-3 font-medium">登入方式</th>
                  <th className="text-left px-4 py-3 font-medium">角色</th>
                  <th className="text-left px-4 py-3 font-medium">狀態</th>
                  <th className="text-left px-4 py-3 font-medium">最後登入</th>
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
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      沒有符合條件的使用者
                    </td>
                  </tr>
                )}
                {filtered.map((u) => {
                  const method = (u.loginMethod ?? "unknown") as LoginMethod;
                  const isMe = u.id === me.id;
                  const role = u.role as UserRole;
                  const status = (u.status ?? "active") as UserStatus;
                  const disabled = status === "disabled";
                  const editable = canChangeRole({ role, id: u.id });
                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        "hover:bg-muted/50",
                        disabled && "opacity-60"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-client-warm text-brand-primary font-display font-semibold text-xs">
                            {(u.name || u.email || "?").charAt(0).toUpperCase()}
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
                          status={METHOD_TONE[method as string] ?? "neutral"}
                          size="sm"
                        >
                          {METHOD_LABEL[method as string] ?? method ?? "未知"}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={ROLE_TONE[role]} size="sm">
                          {ROLE_LABEL[role] ?? role}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          status={disabled ? "danger" : "good"}
                          size="sm"
                        >
                          {disabled ? "停用" : "啟用"}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {formatRelative(u.lastSignedIn)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1 relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!editable || updateRoleMutation.isPending}
                            onClick={() =>
                              setOpenRoleMenu(openRoleMenu === u.id ? null : u.id)
                            }
                            className="text-xs"
                          >
                            變更角色
                          </Button>
                          {openRoleMenu === u.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenRoleMenu(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border bg-card shadow-xl z-50 py-1">
                                {ROLE_OPTIONS.map((opt) => {
                                  const isCurrent = role === opt.value;
                                  const grantingSuperAdmin =
                                    opt.value === "super_admin" &&
                                    myRole !== "super_admin";
                                  const disabledOpt =
                                    isCurrent || grantingSuperAdmin;
                                  return (
                                    <button
                                      key={opt.value}
                                      disabled={disabledOpt}
                                      onClick={() =>
                                        handleRoleChange(u.id, opt.value)
                                      }
                                      className={cn(
                                        "w-full text-left px-3 py-2 text-xs hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-start justify-between gap-2",
                                        isCurrent && "bg-bg-subtle"
                                      )}
                                    >
                                      <div>
                                        <p className="font-medium">
                                          {opt.label}
                                          {isCurrent && (
                                            <span className="ml-1 text-[10px] text-status-good">✓</span>
                                          )}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          {opt.hint}
                                        </p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                          <button
                            type="button"
                            disabled={isMe || updateStatusMutation.isPending}
                            onClick={() => handleStatusToggle(u.id, status)}
                            aria-label={disabled ? "啟用" : "停用"}
                            className={cn(
                              "p-1.5 rounded hover:bg-muted",
                              "disabled:opacity-40 disabled:cursor-not-allowed",
                              disabled ? "text-status-danger" : "text-status-good"
                            )}
                          >
                            {disabled ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border bg-bg-page p-4 text-xs text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">5 角色階層</strong>(由高到低):
            Super Admin → 管理員 → 治療師 → 助理 → 唯讀
          </p>
          <p>
            <strong className="text-foreground">Super Admin</strong> 才能授予 / 撤銷
            Super Admin 權限,管理員只能管理 治療師 / 助理 / 唯讀。
          </p>
          <p>
            <strong className="text-foreground">停用</strong>:該帳號無法登入(下次重新整理會被踢出),不會刪除資料。
          </p>
          <p>
            <strong className="text-foreground">不能</strong> 把自己降級或停用(避免最後一個 admin 失效)。
          </p>
        </div>
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
