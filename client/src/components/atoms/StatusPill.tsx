import { cn } from "@/lib/utils";

const STATUS_MAP = {
  good: "bg-status-good-bg text-status-good",
  warn: "bg-status-warn-bg text-status-warn",
  danger: "bg-status-danger-bg text-status-danger",
  neutral: "bg-muted text-muted-foreground",
} as const;

const SIZE_MAP = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
} as const;

export type StatusPillProps = {
  status: keyof typeof STATUS_MAP;
  size?: keyof typeof SIZE_MAP;
  children: React.ReactNode;
  className?: string;
};

export function StatusPill({
  status,
  size = "md",
  children,
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        STATUS_MAP[status],
        SIZE_MAP[size],
        className
      )}
    >
      {children}
    </span>
  );
}
