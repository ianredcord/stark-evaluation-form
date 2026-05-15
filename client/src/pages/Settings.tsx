import { useState } from "react";
import { TherapistLayout } from "@/components/templates/TherapistLayout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/atoms/StatusPill";
import { cn } from "@/lib/utils";
import {
  User,
  Building,
  Bell,
  Lock,
  Database,
  FileText,
  ChevronRight,
} from "lucide-react";

const SECTIONS = [
  { key: "profile", label: "個人資料", icon: User },
  { key: "clinic", label: "診所設定", icon: Building },
  { key: "notifications", label: "通知偏好", icon: Bell },
  { key: "security", label: "帳號安全", icon: Lock },
  { key: "integrations", label: "外部系統整合", icon: Database },
  { key: "billing", label: "計費與發票", icon: FileText },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export default function Settings() {
  const [section, setSection] = useState<SectionKey>("profile");

  return (
    <TherapistLayout activeKey="integrated">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">設定</h1>
          <p className="text-sm text-muted-foreground">
            管理個人、診所與系統整合設定
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          <nav className="rounded-xl border bg-card p-2 h-fit">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = section === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSection(s.key)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-brand-primary text-white"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{s.label}</span>
                  {active && <ChevronRight className="w-3 h-3" />}
                </button>
              );
            })}
          </nav>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            {section === "profile" && <ProfileSection />}
            {section === "clinic" && <ClinicSection />}
            {section === "notifications" && <NotificationsSection />}
            {section === "security" && <SecuritySection />}
            {section === "integrations" && <IntegrationsSection />}
            {section === "billing" && <BillingSection />}
          </div>
        </div>
      </div>
    </TherapistLayout>
  );
}

function FieldRow({
  label,
  value,
  hint,
  action,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value}</p>
        {hint && (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function ProfileSection() {
  return (
    <>
      <h2 className="font-display text-lg font-semibold">個人資料</h2>
      <FieldRow
        label="姓名"
        value="林昱辰"
        action={<Button variant="ghost" size="sm">變更</Button>}
      />
      <FieldRow
        label="職稱"
        value="物理治療師"
        action={<Button variant="ghost" size="sm">變更</Button>}
      />
      <FieldRow
        label="專業執照編號"
        value="PT-2018-04127"
        hint="執照影本已驗證"
        action={<StatusPill status="good" size="sm">已驗證</StatusPill>}
      />
      <FieldRow
        label="顯示語言"
        value="繁體中文"
        action={<Button variant="ghost" size="sm">變更</Button>}
      />
    </>
  );
}

function ClinicSection() {
  return (
    <>
      <h2 className="font-display text-lg font-semibold">診所設定</h2>
      <FieldRow
        label="診所名稱"
        value="史塔克運動科學中心"
        action={<Button variant="ghost" size="sm">變更</Button>}
      />
      <FieldRow
        label="地址"
        value="台北市信義區市府路 45 號"
        action={<Button variant="ghost" size="sm">變更</Button>}
      />
      <FieldRow
        label="客戶報告 logo"
        value={<span className="inline-flex items-center gap-1"><span className="text-brand-accent">✦</span> STARK</span>}
        hint="顯示在客戶端報告右上角"
        action={<Button variant="ghost" size="sm">上傳新 logo</Button>}
      />
      <FieldRow
        label="多治療師管理"
        value="Phase 2 開放"
        hint="目前單一治療師模式"
        action={<StatusPill status="neutral" size="sm">Phase 2</StatusPill>}
      />
    </>
  );
}

function NotificationsSection() {
  return (
    <>
      <h2 className="font-display text-lg font-semibold">通知偏好</h2>
      <FieldRow
        label="客戶查看報告通知"
        value="開啟"
        hint="客戶第一次打開報告時 email 通知你"
        action={<StatusPill status="good" size="sm">已開啟</StatusPill>}
      />
      <FieldRow
        label="複評到期提醒"
        value="開啟"
        hint="複評前 3 天提醒安排"
        action={<StatusPill status="good" size="sm">已開啟</StatusPill>}
      />
      <FieldRow
        label="LINE / SMS 推送"
        value="Phase 2"
        action={<StatusPill status="neutral" size="sm">Phase 2</StatusPill>}
      />
    </>
  );
}

function SecuritySection() {
  return (
    <>
      <h2 className="font-display text-lg font-semibold">帳號安全</h2>
      <FieldRow
        label="登入方式"
        value="Google OAuth"
        hint="Week 6 接 NextAuth 後啟用"
        action={<StatusPill status="warn" size="sm">即將上線</StatusPill>}
      />
      <FieldRow
        label="兩步驗證"
        value="Phase 2"
        action={<StatusPill status="neutral" size="sm">Phase 2</StatusPill>}
      />
      <FieldRow
        label="客戶報告連結有效期"
        value="無限期(可手動撤銷)"
        action={<Button variant="ghost" size="sm">變更</Button>}
      />
    </>
  );
}

function IntegrationsSection() {
  return (
    <>
      <h2 className="font-display text-lg font-semibold">外部系統整合</h2>
      <FieldRow
        label="MOTI Physio 3D"
        value="姿勢結構分析"
        action={<StatusPill status="good" size="sm">已連線</StatusPill>}
      />
      <FieldRow
        label="RONFIC"
        value="動作功能評估"
        action={<StatusPill status="good" size="sm">已連線</StatusPill>}
      />
      <FieldRow
        label="InBody"
        value="身體組成分析"
        action={<StatusPill status="good" size="sm">已連線</StatusPill>}
      />
      <FieldRow
        label="Redcord 懸吊系統"
        value="神經肌肉控制"
        action={<StatusPill status="good" size="sm">已連線</StatusPill>}
      />
      <FieldRow
        label="LLM API(白話生成)"
        value="Phase 2"
        hint="自動將專業數據翻譯成客戶端白話"
        action={<StatusPill status="neutral" size="sm">Phase 2</StatusPill>}
      />
    </>
  );
}

function BillingSection() {
  return (
    <>
      <h2 className="font-display text-lg font-semibold">計費與發票</h2>
      <FieldRow
        label="目前方案"
        value="MVP 內部試用"
        action={<StatusPill status="neutral" size="sm">免費</StatusPill>}
      />
      <FieldRow
        label="月活躍客戶"
        value="6 / 無上限"
        hint="本月已建立評估的客戶數"
      />
      <FieldRow
        label="計費系統"
        value="Phase 2 — Stripe"
        action={<StatusPill status="neutral" size="sm">Phase 2</StatusPill>}
      />
    </>
  );
}
