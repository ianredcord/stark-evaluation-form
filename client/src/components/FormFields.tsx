import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// 文字輸入欄位
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stark-text">{label}</label>
        <input
          ref={ref}
          className={cn(
            "stark-input w-full",
            error && "border-destructive",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  }
);
TextInput.displayName = "TextInput";

// 日期輸入欄位
interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stark-text">{label}</label>
        <div className="relative">
          <input
            ref={ref}
            type="date"
            className={cn(
              "stark-input w-full pr-10",
              error && "border-destructive",
              className
            )}
            {...props}
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

// 多行文字輸入
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, rows = 3, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stark-text">{label}</label>
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            "stark-input w-full resize-none",
            error && "border-destructive",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

// 單選按鈕組
interface RadioGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  inline?: boolean;
}

export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
  inline = true,
}: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-stark-text">{label}</label>
      <div className={cn("flex gap-4", inline ? "flex-row flex-wrap" : "flex-col")}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-4 h-4 text-stark-orange border-stark-border focus:ring-stark-orange"
            />
            <span className="text-sm text-stark-text">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

// 評分選擇（A-E 或 0-3）
interface RatingSelectProps {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
}

export function RatingSelect({
  options,
  value,
  onChange,
  size = "md",
}: RatingSelectProps) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange?.(option)}
          className={cn(
            "rounded-md font-medium transition-all",
            size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
            value === option
              ? "bg-stark-orange text-white"
              : "bg-white border border-stark-border text-stark-text hover:bg-stark-bg"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// 勾選框
interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ label, checked, onChange, className }: CheckboxProps) {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-4 h-4 text-stark-orange border-stark-border rounded focus:ring-stark-orange"
      />
      {label && <span className="text-sm text-stark-text">{label}</span>}
    </label>
  );
}

// 數字輸入（用於秒數、次數、組數）
interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  suffix?: string;
  value?: number | string;
  onChange?: (value: number | undefined) => void;
  error?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, suffix, value, onChange, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-stark-text">{label}</label>
        )}
        <div className="flex items-center gap-1">
          <input
            ref={ref}
            type="number"
            value={value ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange?.(val === "" ? undefined : Number(val));
            }}
            className={cn(
              "stark-input w-16 text-center",
              error && "border-destructive",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="text-sm text-stark-text-muted">{suffix}</span>
          )}
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";

// 區塊標題
interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <div
      className={cn(
        "inline-block px-6 py-2 border-2 border-stark-border rounded-lg bg-white",
        className
      )}
    >
      <h2 className="stark-section-title">{children}</h2>
    </div>
  );
}

// 表單卡片
interface FormCardProps {
  children: React.ReactNode;
  className?: string;
  dashed?: boolean;
}

export function FormCard({ children, className, dashed = false }: FormCardProps) {
  return (
    <div className={cn(dashed ? "stark-card-dashed" : "stark-card", className)}>
      {children}
    </div>
  );
}
