import { cn } from "@/lib/utils";
import { IconBadge } from "@/components/atoms/IconBadge";
import { ArrowRight } from "lucide-react";

export type ActionRecommendationCardProps = {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  ctaLabel?: string;
  onCtaClick?: () => void;
  href?: string;
  iconBg?: "primary" | "accent" | "warm" | "violet" | "good" | "warn" | "danger" | "muted";
  className?: string;
};

/**
 * Recommended action card (icon + title + description + CTA link).
 * Used in client v2 "改善建議與下一步" section
 * (訓練建議 / 治療建議 / 複評時間 etc.).
 */
export function ActionRecommendationCard({
  icon,
  title,
  description,
  ctaLabel,
  onCtaClick,
  href,
  iconBg = "primary",
  className,
}: ActionRecommendationCardProps) {
  const showCta = !!(ctaLabel && (onCtaClick || href));

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <IconBadge icon={icon} bg={iconBg} size="md" shape="rounded" />
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="font-display text-base font-semibold text-foreground">
            {title}
          </h4>
          {description && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {showCta &&
        (href ? (
          <a
            href={href}
            className="inline-flex items-center gap-1 font-body text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </a>
        ) : (
          <button
            type="button"
            onClick={onCtaClick}
            className="inline-flex items-center gap-1 self-start font-body text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        ))}
    </div>
  );
}
