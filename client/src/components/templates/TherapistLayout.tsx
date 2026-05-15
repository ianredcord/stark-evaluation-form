import { cn } from "@/lib/utils";
import { Link } from "wouter";
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
} from "lucide-react";

const NAV = [
  { key: "clients", label: "客戶管理", icon: Users, href: "/clients" },
  { key: "initial", label: "初評表", icon: ClipboardList, href: "/initial" },
  { key: "checks", label: "檢測資料", icon: Activity, href: "/checks" },
  {
    key: "integrated",
    label: "整合評估",
    icon: LayoutDashboard,
    href: "#",
  },
  { key: "report", label: "報告產生", icon: FileText, href: "/report" },
  { key: "schedule", label: "課程計畫", icon: CalendarDays, href: "/schedule" },
] as const;

export type TherapistLayoutProps = {
  activeKey?: (typeof NAV)[number]["key"];
  user?: { name: string; role: string; initial: string };
  children: React.ReactNode;
};

export function TherapistLayout({
  activeKey = "integrated",
  user = { name: "林昱辰", role: "物理治療師", initial: "林" },
  children,
}: TherapistLayoutProps) {
  return (
    <div className="flex min-h-screen bg-bg-page text-foreground font-body">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-brand-primary text-white flex flex-col sticky top-0 h-screen">
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
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <Bell className="w-4 h-4" />
            <span>通知中心</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white">
            <Settings className="w-4 h-4" />
            <span>設定</span>
          </button>
        </div>
        <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2">
          <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-white/10 text-sm font-display font-semibold">
            {user.initial}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-white/60 truncate">{user.role}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-white/60" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
