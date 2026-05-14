import { cn } from "@/lib/utils";
import { Eraser, Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  label: string;
  value?: string;
  onChange?: (dataUrl: string | undefined) => void;
  className?: string;
  width?: number;
  height?: number;
}

export function SignaturePad({
  label,
  value,
  onChange,
  className,
  width = 400,
  height = 150,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // 初始化 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 設定 Canvas 解析度
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 設定繪圖樣式
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 如果有現有簽名，載入它
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [width, height, value]);

  const getCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      if ("touches" in e) {
        const touch = e.touches[0];
        if (!touch) return null;
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }

      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const coords = getCoordinates(e);
      if (!coords) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
      setHasSignature(true);
    },
    [getCoordinates]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;

      const coords = getCoordinates(e);
      if (!coords) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    },
    [isDrawing, getCoordinates]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange?.(undefined);
  }, [onChange]);

  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataUrl = canvas.toDataURL("image/png");
    onChange?.(dataUrl);
  }, [hasSignature, onChange]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-stark-text">{label}</label>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={cn(
            "border-2 border-stark-border rounded-lg bg-white cursor-crosshair touch-none",
            "w-full max-w-[400px]"
          )}
          style={{ touchAction: "none" }}
        />

        {/* 簽名提示線 */}
        {!hasSignature && (
          <div className="absolute bottom-8 left-4 right-4 border-b border-dashed border-muted-foreground/30 pointer-events-none" />
        )}

        {/* 操作按鈕 */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            type="button"
            onClick={clearSignature}
            className="p-1.5 rounded-md bg-white/80 hover:bg-white border border-stark-border text-muted-foreground hover:text-stark-text transition-colors"
            title="清除簽名"
          >
            <Eraser className="w-4 h-4" />
          </button>
          {hasSignature && (
            <button
              type="button"
              onClick={saveSignature}
              className="p-1.5 rounded-md bg-stark-orange text-white hover:bg-stark-orange-dark transition-colors"
              title="確認簽名"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        請在上方區域簽名，完成後點擊確認按鈕
      </p>
    </div>
  );
}
