import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface FormNavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageLabels?: string[];
  completedPages?: number[];
}

const defaultPageLabels = [
  "基本資料",
  "姿勢檢測",
  "動作檢測(上)",
  "動作檢測(下)",
  "紅繩檢測",
  "RONFIC",
  "訓練計畫",
  "處方建議",
];

export function FormNavigation({
  currentPage,
  totalPages,
  onPageChange,
  pageLabels = defaultPageLabels,
  completedPages = [],
}: FormNavigationProps) {
  return (
    <div className="w-full py-4">
      {/* 進度條 */}
      <div className="relative mb-6">
        <div className="absolute top-4 left-0 right-0 h-1 bg-muted rounded-full" />
        <div
          className="absolute top-4 left-0 h-1 bg-stark-orange rounded-full transition-all duration-300"
          style={{ width: `${((currentPage - 1) / (totalPages - 1)) * 100}%` }}
        />
        
        {/* 步驟圓點 */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isCompleted = completedPages.includes(page);
            const isCurrent = page === currentPage;
            const isPast = page < currentPage;
            
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  "flex flex-col items-center gap-2 group",
                  "focus:outline-none focus:ring-2 focus:ring-stark-orange focus:ring-offset-2 rounded-lg p-1"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    "border-2",
                    isCurrent && "bg-stark-orange border-stark-orange text-white scale-110",
                    isPast && !isCurrent && "bg-stark-orange-light border-stark-orange text-white",
                    !isCurrent && !isPast && "bg-white border-muted text-muted-foreground",
                    isCompleted && !isCurrent && "bg-stark-orange border-stark-orange text-white"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    page
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs text-center max-w-16 leading-tight transition-colors",
                    isCurrent ? "text-stark-orange font-medium" : "text-muted-foreground",
                    "group-hover:text-stark-orange"
                  )}
                >
                  {pageLabels[page - 1] || `第 ${page} 頁`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface FormNavigationButtonsProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export function FormNavigationButtons({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting = false,
}: FormNavigationButtonsProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
      <button
        onClick={onPrevious}
        disabled={isFirstPage}
        className={cn(
          "px-6 py-2 rounded-lg font-medium transition-all",
          isFirstPage
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-white border-2 border-stark-border text-stark-text hover:bg-stark-bg"
        )}
      >
        上一頁
      </button>

      <span className="text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>

      {isLastPage ? (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "px-6 py-2 rounded-lg font-medium transition-all",
            "bg-stark-orange text-white hover:bg-stark-orange-dark",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting ? "儲存中..." : "完成並儲存"}
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-6 py-2 rounded-lg font-medium bg-stark-orange text-white hover:bg-stark-orange-dark transition-all"
        >
          下一頁
        </button>
      )}
    </div>
  );
}
