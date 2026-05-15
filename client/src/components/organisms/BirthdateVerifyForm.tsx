import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export type BirthdateVerifyFormProps = {
  expected: string; // YYYY-MM-DD
  onVerified: () => void;
};

export function BirthdateVerifyForm({
  expected,
  onVerified,
}: BirthdateVerifyFormProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === expected) {
      setError(null);
      onVerified();
    } else {
      setAttempts((a) => a + 1);
      setError(
        attempts >= 2
          ? "驗證失敗多次,請聯絡您的治療師確認生日。"
          : "生日不正確,請再試一次。"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-client-warm px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card rounded-xl border shadow-sm p-6 space-y-5"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <Lock className="w-5 h-5" />
          </span>
          <h1 className="font-display text-xl font-bold">確認身分</h1>
          <p className="text-sm text-muted-foreground">
            請輸入生日以查看您的整合諮詢報告
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="birthdate">
            生日
          </label>
          <input
            id="birthdate"
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            required
          />
          {error && <p className="text-xs text-status-danger">{error}</p>}
        </div>
        <Button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white"
          disabled={attempts >= 3}
        >
          {attempts >= 3 ? "請稍後再試" : "確認進入"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          此連結僅供本人查看,請勿轉發。
        </p>
      </form>
    </div>
  );
}
