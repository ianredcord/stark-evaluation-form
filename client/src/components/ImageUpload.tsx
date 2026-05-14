import { cn } from "@/lib/utils";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange?: (url: string | undefined) => void;
  onUpload?: (file: File) => Promise<string>;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  placeholder?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  onUpload,
  className,
  aspectRatio = "auto",
  placeholder = "點擊或拖曳上傳圖片",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("請上傳圖片檔案");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("檔案大小不能超過 10MB");
        return;
      }

      setError(undefined);
      setIsUploading(true);

      try {
        if (onUpload) {
          const url = await onUpload(file);
          onChange?.(url);
        } else {
          // 預覽模式：使用 Data URL
          const reader = new FileReader();
          reader.onload = (e) => {
            onChange?.(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        setError("上傳失敗，請重試");
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange?.(undefined);
  }, [onChange]);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "min-h-48",
  }[aspectRatio];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-stark-text">{label}</label>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all overflow-hidden",
          aspectRatioClass,
          isDragging
            ? "border-stark-orange bg-stark-orange/10"
            : "border-stark-border-dashed bg-stark-bg-card",
          !value && "hover:border-stark-orange hover:bg-stark-orange/5 cursor-pointer"
        )}
      >
        {value ? (
          // 已上傳圖片
          <div className="relative w-full h-full">
            <img
              src={value}
              alt={label}
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // 上傳區域
          <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-stark-orange animate-spin" />
                <span className="text-sm text-muted-foreground">上傳中...</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-8 h-8 text-stark-border-dashed" />
                <span className="text-sm text-muted-foreground text-center px-4">
                  {placeholder}
                </span>
              </>
            )}
          </label>
        )}
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

// 多圖片上傳區塊
interface MultiImageUploadProps {
  label: string;
  values?: string[];
  onChange?: (urls: string[]) => void;
  onUpload?: (file: File) => Promise<string>;
  maxImages?: number;
  className?: string;
}

export function MultiImageUpload({
  label,
  values = [],
  onChange,
  onUpload,
  maxImages = 6,
  className,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("請上傳圖片檔案");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("檔案大小不能超過 10MB");
        return;
      }

      if (values.length >= maxImages) {
        setError(`最多只能上傳 ${maxImages} 張圖片`);
        return;
      }

      setError(undefined);
      setIsUploading(true);

      try {
        if (onUpload) {
          const url = await onUpload(file);
          onChange?.([...values, url]);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            onChange?.([...values, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        setError("上傳失敗，請重試");
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onUpload, values, maxImages]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newValues = [...values];
      newValues.splice(index, 1);
      onChange?.(newValues);
    },
    [onChange, values]
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-stark-text">{label}</label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {values.map((url, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-stark-border"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {values.length < maxImages && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-stark-border-dashed bg-stark-bg-card hover:border-stark-orange hover:bg-stark-orange/5 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-stark-orange animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-6 h-6 text-stark-border-dashed" />
                <span className="text-xs text-muted-foreground">新增</span>
              </>
            )}
          </label>
        )}
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
