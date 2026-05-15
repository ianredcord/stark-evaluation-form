import { cn } from "@/lib/utils";

const COLOR_MAP = {
  primary: "bg-brand-primary text-white",
  accent: "bg-brand-accent text-white",
  good: "bg-status-good text-white",
  warn: "bg-status-warn text-white",
  danger: "bg-status-danger text-white",
  muted: "bg-muted text-foreground",
} as const;

const COLOR_OUTLINE_MAP = {
  primary: "border-brand-primary text-brand-primary",
  accent: "border-brand-accent text-brand-accent",
  good: "border-status-good text-status-good",
  warn: "border-status-warn text-status-warn",
  danger: "border-status-danger text-status-danger",
  muted: "border-muted-foreground text-muted-foreground",
} as const;

const SIZE_MAP = {
  sm: "w-5 h-5 text-xs",
  md: "w-7 h-7 text-sm",
  lg: "w-9 h-9 text-base",
  xl: "w-12 h-12 text-lg",
} as const;

export type SectionNumberProps = {
  n: number | string;
  color?: keyof typeof COLOR_MAP;
  size?: keyof typeof SIZE_MAP;
  variant?: "filled" | "outline";
  className?: string;
};

export function SectionNumber({
  n,
  color = "primary",
  size = "md",
  variant = "filled",
  className,
}: SectionNumberProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-display font-bold tabular-nums shrink-0",
        SIZE_MAP[size],
        variant === "filled"
          ? COLOR_MAP[color]
          : cn("border-2 bg-transparent", COLOR_OUTLINE_MAP[color]),
        className
      )}
      aria-label={`Section ${n}`}
    >
      {n}
    </span>
  );
}
