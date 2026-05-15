import { cn } from "@/lib/utils";
import { IconBadge } from "@/components/atoms/IconBadge";
import { StatusPill } from "@/components/atoms/StatusPill";
import { Check, AlertCircle, Minus } from "lucide-react";

const STATE_MAP = {
  imported: { tone: "good" as const, label: "已匯入", icon: <Check /> },
  pending: { tone: "warn" as const, label: "未匯入", icon: <AlertCircle /> },
  unavailable: { tone: "neutral" as const, label: "未提供", icon: <Minus /> },
} as const;

export type SystemImportCardProps = {
  systemName: string;
  systemKind: string;
  state: keyof typeof STATE_MAP;
  summary?: React.ReactNode;
  logo?: React.ReactNode;
  accent?: "primary" | "accent" | "violet" | "warm" | "good" | "warn";
  timestamp?: string;
  className?: string;
};

export function SystemImportCard({
  systemName,
  systemKind,
  state,
  summary,
  logo,
  accent = "primary",
  timestamp,
  className,
}: SystemImportCardProps) {
  const s = STATE_MAP[state];
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {logo ? (
            <IconBadge icon={logo} bg={accent} size="sm" shape="rounded" />
          ) : (
            <span
              className={cn(
                "inline-flex w-7 h-7 items-center justify-center rounded-md text-white text-xs font-bold font-display",
                accent === "primary" && "bg-brand-primary",
                accent === "accent" && "bg-brand-accent",
                accent === "violet" && "bg-client-violet",
                accent === "warm" && "bg-client-warm text-brand-primary",
                accent === "good" && "bg-status-good",
                accent === "warn" && "bg-status-warn"
              )}
              aria-hidden
            >
              {systemName.charAt(0)}
            </span>
          )}
          <span className="font-display font-semibold text-sm truncate">
            {systemName}
          </span>
        </div>
        <StatusPill status={s.tone} size="sm">
          <span className="[&>svg]:w-3 [&>svg]:h-3 inline-flex">{s.icon}</span>
          {s.label}
        </StatusPill>
      </div>
      <p className="font-body text-xs text-muted-foreground">{systemKind}</p>
      {summary && (
        <div className="font-body text-sm text-foreground">{summary}</div>
      )}
      {timestamp && (
        <p className="font-body text-xs text-muted-foreground tabular-nums">
          {timestamp}
        </p>
      )}
    </div>
  );
}
