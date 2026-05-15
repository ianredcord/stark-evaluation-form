import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

export type EditableLabelProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
};

export function EditableLabel({
  value,
  onChange,
  placeholder = "點擊編輯",
  disabled,
  multiline,
  className,
  inputClassName,
}: EditableLabelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit();
    } else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (editing) {
    const sharedProps = {
      ref: inputRef as never,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: handleKey,
      placeholder,
      className: cn(
        "w-full rounded-md border border-brand-primary bg-background px-2 py-1 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
        inputClassName
      ),
    };
    return multiline ? (
      <textarea rows={3} {...sharedProps} />
    ) : (
      <input type="text" {...sharedProps} />
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setEditing(true)}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-left",
        "hover:bg-muted transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <span className={cn("text-sm", !value && "text-muted-foreground italic")}>
        {value || placeholder}
      </span>
      <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}
