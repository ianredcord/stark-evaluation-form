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
import { SignatureCanvas } from "@/components/organisms/SignatureCanvas";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Copy,
  Mail,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

type Step = "review" | "signatures" | "generated";

export type GenerateReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  evaluationDate: string;
  scoreSummary: string;
  topIssuesCount: number;
  prescriptionsCount: number;
};

function generateShareCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function GenerateReportDialog({
  open,
  onOpenChange,
  clientName,
  evaluationDate,
  scoreSummary,
  topIssuesCount,
  prescriptionsCount,
}: GenerateReportDialogProps) {
  const [step, setStep] = useState<Step>("review");
  const [therapistSig, setTherapistSig] = useState<string | null>(null);
  const [clientSig, setClientSig] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setStep("review");
    setTherapistSig(null);
    setClientSig(null);
    setShareCode("");
    setCopied(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleGenerate = () => {
    const code = generateShareCode();
    setShareCode(code);
    setStep("generated");
  };

  const shareUrl = shareCode
    ? `${window.location.origin}/r/${shareCode}`
    : "";

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">產生客戶報告</DialogTitle>
          <DialogDescription>
            {step === "review" && "確認評估內容,接著進行雙簽名。"}
            {step === "signatures" && "請治療師與客戶分別簽名。"}
            {step === "generated" && "報告已產生,複製連結傳給客戶。"}
          </DialogDescription>
        </DialogHeader>

        {/* Step progress */}
        <div className="flex items-center gap-2">
          {(["review", "signatures", "generated"] as Step[]).map((s, i) => {
            const order = ["review", "signatures", "generated"];
            const currentIdx = order.indexOf(step);
            const idx = order.indexOf(s);
            const active = idx === currentIdx;
            const done = idx < currentIdx;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <span
                  className={cn(
                    "inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold tabular-nums shrink-0",
                    done
                      ? "bg-status-good text-white"
                      : active
                        ? "bg-brand-primary text-white"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    active ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s === "review" ? "確認" : s === "signatures" ? "雙簽名" : "完成"}
                </span>
                {i < 2 && (
                  <span className="flex-1 h-px bg-border" aria-hidden />
                )}
              </div>
            );
          })}
        </div>

        {step === "review" && (
          <div className="space-y-3 rounded-lg bg-bg-page p-4">
            <Row label="客戶" value={clientName} />
            <Row label="評估日期" value={evaluationDate} />
            <Row label="整體分數" value={scoreSummary} />
            <Row label="優先問題數" value={`${topIssuesCount} 項`} />
            <Row label="處方數" value={`${prescriptionsCount} 個動作`} />
          </div>
        )}

        {step === "signatures" && (
          <div className="space-y-4">
            <SignatureCanvas
              label="治療師簽名"
              hint="林昱辰 物理治療師"
              value={therapistSig}
              onChange={setTherapistSig}
            />
            <SignatureCanvas
              label="客戶簽名"
              hint={`${clientName} · 同意內容並接受治療計畫`}
              value={clientSig}
              onChange={setClientSig}
            />
          </div>
        )}

        {step === "generated" && shareCode && (
          <div className="space-y-3">
            <div className="rounded-lg border bg-status-good-bg/50 p-4 space-y-3">
              <div className="inline-flex items-center gap-2 text-status-good">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-display text-base font-semibold">
                  報告已產生
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">分享連結</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-card border rounded px-2 py-1.5 truncate tabular-nums">
                    {shareUrl}
                  </code>
                  <Button size="sm" onClick={copyLink} className="gap-1 shrink-0">
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "已複製!" : "複製"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  客戶開啟連結後需輸入生日驗證。連結可隨時撤銷。
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                分享方式
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert("LINE 分享 — Phase 2")}
                  className="gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  LINE
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert("Email 寄送 — Phase 2")}
                  className="gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(shareUrl, "_blank")}
                  className="gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  開啟預覽
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                取消
              </Button>
              <Button
                onClick={() => setStep("signatures")}
                className="bg-brand-primary hover:bg-brand-primary-dark text-white"
              >
                下一步:雙簽名 →
              </Button>
            </>
          )}
          {step === "signatures" && (
            <>
              <Button variant="outline" onClick={() => setStep("review")}>
                ← 上一步
              </Button>
              <Button
                disabled={!therapistSig || !clientSig}
                onClick={handleGenerate}
                className="bg-brand-primary hover:bg-brand-primary-dark text-white"
              >
                產生報告
              </Button>
            </>
          )}
          {step === "generated" && (
            <Button onClick={() => handleOpenChange(false)}>完成</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
