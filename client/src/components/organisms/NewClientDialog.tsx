import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NewClientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: NewClientData) => void;
};

export type NewClientData = {
  name: string;
  birthdate: string;
  gender: "男性" | "女性" | "其他";
  height: number;
  weight: number;
  phone: string;
  primaryConcern: string;
};

const EMPTY: NewClientData = {
  name: "",
  birthdate: "",
  gender: "女性",
  height: 0,
  weight: 0,
  phone: "",
  primaryConcern: "",
};

export function NewClientDialog({
  open,
  onOpenChange,
  onCreate,
}: NewClientDialogProps) {
  const [data, setData] = useState<NewClientData>(EMPTY);

  const isValid = data.name.trim().length > 0 && data.birthdate.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onCreate(data);
    setData(EMPTY);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setData(EMPTY);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">新增客戶</DialogTitle>
          <DialogDescription>
            建立新客戶檔案,接下來可以為他開始第一次評估。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="姓名" required>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              placeholder="例:陳小妍"
              className="input-base"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="生日" required>
              <input
                type="date"
                value={data.birthdate}
                onChange={(e) =>
                  setData((d) => ({ ...d, birthdate: e.target.value }))
                }
                className="input-base"
                required
              />
            </Field>
            <Field label="性別">
              <select
                value={data.gender}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    gender: e.target.value as NewClientData["gender"],
                  }))
                }
                className="input-base"
              >
                <option value="女性">女性</option>
                <option value="男性">男性</option>
                <option value="其他">其他</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="身高 (cm)">
              <input
                type="number"
                value={data.height || ""}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    height: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="158"
                className="input-base"
              />
            </Field>
            <Field label="體重 (kg)">
              <input
                type="number"
                value={data.weight || ""}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    weight: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="50"
                className="input-base"
              />
            </Field>
          </div>

          <Field label="聯絡電話">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) =>
                setData((d) => ({ ...d, phone: e.target.value }))
              }
              placeholder="0912-345-678"
              className="input-base"
            />
          </Field>

          <Field label="主訴 / 主要關注">
            <textarea
              value={data.primaryConcern}
              onChange={(e) =>
                setData((d) => ({ ...d, primaryConcern: e.target.value }))
              }
              placeholder="例:下背痠痛、運動表現提升..."
              rows={3}
              className="input-base resize-none"
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white"
            >
              建立並開始評估
            </Button>
          </DialogFooter>
        </form>

        <style>{`
          .input-base {
            width: 100%;
            border-radius: 0.375rem;
            border: 1px solid var(--color-border);
            background: var(--color-card);
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }
          .input-base:focus {
            outline: none;
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-brand-primary) 30%, transparent);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span
        className={cn(
          "text-xs font-medium",
          required && "after:content-['*'] after:text-status-danger after:ml-0.5"
        )}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
