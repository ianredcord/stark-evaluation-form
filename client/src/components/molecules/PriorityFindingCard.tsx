import { cn } from "@/lib/utils";
import { SectionNumber } from "@/components/atoms/SectionNumber";
import { IconBadge } from "@/components/atoms/IconBadge";

export type PriorityFindingCardProps = {
  n: number | string;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: "primary" | "accent" | "warm" | "violet" | "good" | "warn" | "danger" | "muted";
  tone?: "primary" | "accent" | "good" | "warn" | "danger" | "muted";
  action?: React.ReactNode;
  className?: string;
};

export function PriorityFindingCard({
  n,
  title,
  description,
  icon,
  iconBg = "warm",
  tone = "primary",
  action,
  className,
}: PriorityFindingCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-4",
        className
      )}
    >
      <SectionNumber n={n} color={tone} size="md" />
      {icon && (
        <IconBadge icon={icon} bg={iconBg} size="md" shape="rounded" />
      )}
      <div className="flex-1 space-y-1 min-w-0">
        <h4 className="font-display text-base font-semibold text-foreground">
          {title}
        </h4>
        {description && (
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
