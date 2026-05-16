// 公開報告下方的客戶回饋表單(只看一次,提交後本地記住)

import { useState } from "react";
import { Star, Send, Loader2, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  shareCode: string;
}

const STORAGE_KEY_PREFIX = "stark-feedback-";

export function PublicFeedbackForm({ shareCode }: Props) {
  const storageKey = STORAGE_KEY_PREFIX + shareCode;
  const [submitted, setSubmitted] = useState(
    typeof window !== "undefined" && localStorage.getItem(storageKey) === "done",
  );
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = trpc.feedback.submit.useMutation({
    onSuccess: (r) => {
      if (r.ok) {
        localStorage.setItem(storageKey, "done");
        setSubmitted(true);
        toast.success("感謝您的回饋!");
      } else {
        toast.error("送出失敗,請稍後再試");
      }
    },
    onError: (e) => toast.error(`送出失敗:${e.message}`),
  });

  if (submitted) {
    return (
      <section className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 text-center no-print">
        <Check className="w-8 h-8 mx-auto text-green-600 mb-2" />
        <p className="text-sm font-semibold text-stark-text">
          已收到您的回饋
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          感謝協助我們持續改善服務
        </p>
      </section>
    );
  }

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("請先點選評分");
      return;
    }
    mutation.mutate({
      shareCode,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <section className="bg-white border-2 border-stark-border rounded-2xl p-5 no-print">
      <h3 className="text-sm font-bold text-stark-text mb-1">
        分享您的回饋
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        對這份評估報告的滿意度?治療師會看到您的回饋
      </p>

      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110"
            aria-label={`${n} 顆星`}
          >
            <Star
              className={`w-8 h-8 ${
                (hoverRating || rating) >= n
                  ? "fill-stark-orange text-stark-orange"
                  : "text-stark-border"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 1000))}
        placeholder="想留下意見?(選填,最多 1000 字)"
        rows={3}
        className="w-full p-3 text-sm border-2 border-stark-border rounded-lg bg-stark-bg/30 resize-none focus:outline-none focus:border-stark-orange transition-colors"
      />
      <div className="text-[10px] text-muted-foreground text-right mt-1 mb-3">
        {comment.length}/1000
      </div>

      <button
        onClick={handleSubmit}
        disabled={mutation.isPending || rating === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stark-orange hover:bg-stark-orange-dark disabled:bg-stark-border disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
      >
        {mutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        送出回饋
      </button>
    </section>
  );
}
