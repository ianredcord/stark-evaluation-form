import { cn } from "@/lib/utils";

const LAYOUT_MAP = {
  row: "flex items-center justify-between gap-3",
  stack: "flex flex-col gap-0.5",
} as const;

export type DataLabelValueProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  suffix?: React.ReactNode;
  layout?: keyof typeof LAYOUT_MAP;
  emphasis?: "default" | "muted" | "primary";
  className?: string;
};

export function DataLabelValue({
  label,
  value,
  suffix,
  layout = "row",
  emphasis = "default",
  className,
}: DataLabelValueProps) {
  const valueColor = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-brand-primary",
  }[emphasis];

  return (
    <div className={cn(LAYOUT_MAP[layout], className)}>
      <span className="font-body text-xs text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className={cn(
            "font-body text-sm font-medium tabular-nums",
            valueColor
          )}
        >
          {value}
        </span>
        {suffix}
      </span>
    </div>
  );
}
