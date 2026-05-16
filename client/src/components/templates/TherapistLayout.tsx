import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Users,
  ClipboardList,
  Activity,
  LayoutDashboard,
  FileText,
  CalendarDays,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { key: "clients", label: "客戶管理", icon: Users, href: "/clients" },
  {
    key: "initial",
    label: "初評表",
    icon: ClipboardList,
    href: "/evaluation/new",
  },
  { key: "checks", label: "檢測資料", icon: Activity, href: "/templates" },
  {
    key: "integrated",
    label: "整合評估",
    icon: LayoutDashboard,
    href: "/clients",
  },
  { key: "report", label: "報告產生", icon: FileText, href: "/prescriptions" },
  { key: "schedule", label: "課程計畫", icon: CalendarDays, href: "/clients" },
] as const;

export type TherapistLayoutProps = {
  activeKey?: (typeof NAV)[number]["key"];
  user?: { name: string; role: string; initial: string };
  children: React.ReactNode;
};

const DEMO_NOTIFICATIONS = [
  {
    icon: "✓",
    color: "good" as const,
    title: "陳小妍 查看了你的報告",
    time: "10 分鐘前",
  },
  {
    icon: "📅",
    color: "warn" as const,
    title: "張大華 的複評時間將在 3 天後到期",
    time: "1 小時前",
  },
  {
    icon: "📝",
    color: "primary" as const,
    title: "林美芳 完成第 1 週訓練自我回報",
    time: "今天 09:14",
  },
];

const NOTIF_DOT_COLOR = {
  good: "bg-status-good",
  warn: "bg-status-warn",
  danger: "bg-status-danger",
  primary: "bg-brand-primary",
} as const;

export function TherapistLayout({
  activeKey = "integrated",
  user: userProp,
  children,
}: TherapistLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user: authUser, logout, isAuthenticated } = useAuth();

  // Derive user display from auth context, falling back to prop, then to a
  // generic visitor label when no session exists.
  const user =
    userProp ??
    (authUser
      ? {
          name: authUser.name?.trim() || authUser.email?.split("@")[0] || "Therapist",
          role: authUser.role === "admin" ? "系統管理員" : "物理治療師",
          initial: (authUser.name?.trim() || authUser.email || "?").charAt(0).toUpperCase(),
        }
      : { name: "訪客", role: "未登入", initial: "?" });

  return (
    <div className="flex min-h-screen bg-bg-page text-foreground font-body">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-brand-primary text-white px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <a className="inline-flex items-center gap-2">
            <span className="text-brand-accent text-lg">✦</span>
            <span className="font-display text-lg font-bold tracking-wide">STARK</span>
          </a>
        </Link>
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 rounded-md hover:bg-white/10"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "shrink-0 bg-brand-primary text-white flex flex-col",
          "lg:w-56 lg:sticky lg:top-0 lg:h-screen",
          mobileNavOpen
            ? "fixed inset-y-0 left-0 w-64 z-50 shadow-2xl"
            : "hidden lg:flex"
        )}
      >
        <button
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden absolute top-3 right-3 p-1 rounded-md hover:bg-white/10"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="px-5 pt-5 pb-6">
          <Link href="/">
            <a className="inline-flex items-center gap-2">
              <span className="text-brand-accent text-xl">✦</span>
              <span className="font-display text-xl font-bold tracking-wide">
                STARK
              </span>
            </a>
          </Link>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.key === activeKey;
            return (
              <Link key={item.key} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
        <div className="px-2 pb-2 space-y-0.5 border-t border-white/10 pt-2">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white relative"
          >
            <Bell className="w-4 h-4" />
            <span>通知中心</span>
            <span className="ml-auto inline-flex items-center justify-center w-4 h-4 rounded-full bg-status-warn text-[10px] font-bold text-white tabular-nums">
              3
            </span>
          </button>
          <Link href="/settings">
            <a className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white">
              <Settings className="w-4 h-4" />
              <span>設定</span>
            </a>
          </Link>
        </div>
        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-white/10 text-sm font-display font-semibold">
              {user.initial}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-white/60 truncate">{user.role}</p>
            </div>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-label="User menu"
              className="p-1 rounded hover:bg-white/10"
            >
              <ChevronDown className="w-4 h-4 text-white/60" />
            </button>
          </div>
          {userMenuOpen && (
            <div className="mt-2 rounded-md bg-white/10 p-1 space-y-0.5">
              {isAuthenticated ? (
                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = "/";
                  }}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-white/80 hover:bg-white/10"
                >
                  登出
                </button>
              ) : (
                <Link href="/auth/login">
                  <a className="block px-2 py-1.5 rounded text-xs text-white/80 hover:bg-white/10">
                    登入
                  </a>
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Notifications popover */}
      {notifOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setNotifOpen(false)}
          />
          <div className="fixed bottom-20 left-2 lg:left-52 w-72 rounded-xl border bg-card shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">通知中心</h3>
              <span className="text-xs text-muted-foreground">3 則未讀</span>
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y">
              {DEMO_NOTIFICATIONS.map((n, i) => (
                <li key={i} className="px-4 py-3 hover:bg-muted">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "w-2 h-2 mt-1.5 rounded-full shrink-0",
                        NOTIF_DOT_COLOR[n.color]
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {n.time}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button className="w-full px-4 py-2 text-xs text-brand-primary hover:bg-muted border-t">
              全部標示為已讀
            </button>
          </div>
        </>
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 pt-12 lg:pt-0">{children}</main>
    </div>
  );
}
