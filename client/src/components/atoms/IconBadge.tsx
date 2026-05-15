import { cn } from "@/lib/utils";

const BG_MAP = {
  primary: "bg-brand-primary text-white",
  accent: "bg-brand-accent text-white",
  warm: "bg-client-warm text-brand-primary",
  violet: "bg-client-violet text-white",
  good: "bg-status-good-bg text-status-good",
  warn: "bg-status-warn-bg text-status-warn",
  danger: "bg-status-danger-bg text-status-danger",
  muted: "bg-muted text-muted-foreground",
} as const;

const SIZE_MAP = {
  sm: "w-7 h-7 [&>svg]:w-4 [&>svg]:h-4",
  md: "w-10 h-10 [&>svg]:w-5 [&>svg]:h-5",
  lg: "w-14 h-14 [&>svg]:w-7 [&>svg]:h-7",
  xl: "w-20 h-20 [&>svg]:w-10 [&>svg]:h-10",
} as const;

export type IconBadgeProps = {
  icon: React.ReactNode;
  bg?: keyof typeof BG_MAP;
  size?: keyof typeof SIZE_MAP;
  shape?: "circle" | "rounded";
  className?: string;
};

export function IconBadge({
  icon,
  bg = "primary",
  size = "md",
  shape = "circle",
  className,
}: IconBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        shape === "circle" ? "rounded-full" : "rounded-lg",
        BG_MAP[bg],
        SIZE_MAP[size],
        className
      )}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
