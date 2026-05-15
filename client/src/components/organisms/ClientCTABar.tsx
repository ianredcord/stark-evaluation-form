import { Button } from "@/components/ui/button";
import { CalendarPlus, Phone, Heart } from "lucide-react";

export type ClientCTABarProps = {
  closingMessage?: string;
  onBookReassess?: () => void;
  onContactTherapist?: () => void;
};

export function ClientCTABar({
  closingMessage = "我們會陪你一步一步變更好!",
  onBookReassess,
  onContactTherapist,
}: ClientCTABarProps) {
  return (
    <section className="flex flex-col md:flex-row items-center gap-4 rounded-xl border bg-status-warn-bg/40 p-5">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-status-warn text-white shrink-0">
          <Heart className="w-5 h-5 fill-current" />
        </span>
        <p className="font-display text-lg font-semibold text-foreground">
          {closingMessage}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onBookReassess}
          className="bg-brand-primary hover:bg-brand-primary-dark text-white gap-1.5"
        >
          <CalendarPlus className="w-4 h-4" />
          預約複評
        </Button>
        <Button
          variant="outline"
          onClick={onContactTherapist}
          className="gap-1.5 bg-card"
        >
          <Phone className="w-4 h-4" />
          聯絡治療師
        </Button>
      </div>
    </section>
  );
}
