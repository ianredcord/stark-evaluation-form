import { cn } from "@/lib/utils";

const SIZE_MAP = {
  sm: "px-2.5 py-1 text-xs gap-1",
  md: "px-3 py-1.5 text-sm gap-1.5",
  lg: "px-4 py-2 text-base gap-2",
} as const;

export type ChipToggleProps = {
  selected: boolean;
  onToggle: (next: boolean) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: keyof typeof SIZE_MAP;
  disabled?: boolean;
  className?: string;
};

export function ChipToggle({
  selected,
  onToggle,
  children,
  icon,
  size = "md",
  disabled,
  className,
}: ChipToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      disabled={disabled}
      onClick={() => onToggle(!selected)}
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        SIZE_MAP[size],
        selected
          ? "bg-brand-primary text-white border-brand-primary hover:bg-brand-primary-dark"
          : "bg-transparent text-foreground border-border hover:bg-muted",
        className
      )}
    >
      {icon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
