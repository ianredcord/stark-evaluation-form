import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eraser, Check } from "lucide-react";

export type SignatureCanvasProps = {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
};

export function SignatureCanvas({
  label,
  hint,
  value,
  onChange,
  className,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Initialize canvas size + restore signature from value (if any).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1A2B4A";
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
      setIsEmpty(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (isEmpty) setIsEmpty(false);
  };

  const handleUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const data = canvasRef.current?.toDataURL("image/png");
    if (data) onChange(data);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setIsEmpty(true);
    onChange(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm font-semibold">{label}</p>
          {hint && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {!isEmpty && (
          <span className="inline-flex items-center gap-1 text-xs text-status-good">
            <Check className="w-3 h-3" />
            已簽
          </span>
        )}
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          className="w-full h-32 rounded-md border bg-bg-page touch-none cursor-crosshair"
        />
        {isEmpty && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none">
            請在此區簽名
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
          disabled={isEmpty}
          className="gap-1.5 h-7 text-xs"
        >
          <Eraser className="w-3.5 h-3.5" />
          清除
        </Button>
      </div>
    </div>
  );
}
