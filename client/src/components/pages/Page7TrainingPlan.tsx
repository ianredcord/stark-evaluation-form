import { useEvaluationForm } from "@/contexts/EvaluationFormContext";
import { SectionTitle, TextArea, FormCard } from "@/components/FormFields";
import { SignaturePad } from "@/components/SignaturePad";
import { cn } from "@/lib/utils";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

// 單一照片上傳組件
interface SinglePhotoUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  placeholder?: string;
}

function SinglePhotoUpload({ value, onChange, placeholder = "新增" }: SinglePhotoUploadProps) {
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

      setError(undefined);
      setIsUploading(true);

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange(e.target?.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError("上傳失敗，請重試");
        console.error("Upload error:", err);
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "relative rounded-lg border-2 overflow-hidden",
          "aspect-[4/5]", // 接近示意圖的比例
          value
            ? "border-stark-border"
            : "border-dashed border-stark-border-dashed bg-stark-bg-card hover:border-stark-orange hover:bg-stark-orange/5 cursor-pointer"
        )}
      >
        {value ? (
          <div className="relative w-full h-full">
            <img
              src={value}
              alt="評估照片"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center gap-1 cursor-pointer">
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
                <span className="text-xs text-muted-foreground">{placeholder}</span>
              </>
            )}
          </label>
        )}
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

export function Page7TrainingPlan() {
  const { formData, updateTrainingPlan } = useEvaluationForm();
  const { trainingPlan } = formData;

  const updatePlanItem = (index: number, field: "session" | "content", value: string) => {
    const newPlans = [...trainingPlan.plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    updateTrainingPlan({ plans: newPlans });
  };

  // 處理照片更新 - 確保陣列長度為 3
  const updatePhoto = (index: number, url: string | undefined) => {
    const newPhotos = [...trainingPlan.photos];
    // 確保陣列有足夠的長度
    while (newPhotos.length < 3) {
      newPhotos.push("");
    }
    newPhotos[index] = url || "";
    updateTrainingPlan({ photos: newPhotos });
  };

  // 取得照片，確保有 3 個位置
  const getPhoto = (index: number): string | undefined => {
    return trainingPlan.photos[index] || undefined;
  };

  return (
    <div className="space-y-8">
      {/* 訓練計畫 */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <SectionTitle>訓 練 計 畫</SectionTitle>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-stark-border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-stark-bg">
                <th className="p-3 text-center font-medium text-stark-text border-r border-stark-border w-32">
                  課堂
                </th>
                <th className="p-3 text-center font-medium text-stark-text">
                  訓練內容
                </th>
              </tr>
            </thead>
            <tbody>
              {trainingPlan.plans.map((plan, index) => (
                <tr key={index} className="border-b border-stark-border">
                  <td className="p-2 bg-white border-r border-stark-border">
                    <input
                      type="text"
                      value={plan.session}
                      onChange={(e) => updatePlanItem(index, "session", e.target.value)}
                      className="stark-input w-full text-center"
                      placeholder={`第 ${index + 1} 堂`}
                    />
                  </td>
                  <td className="p-2 bg-white">
                    <textarea
                      value={plan.content}
                      onChange={(e) => updatePlanItem(index, "content", e.target.value)}
                      className="stark-input w-full resize-none"
                      rows={2}
                      placeholder="請輸入訓練內容"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 備註欄/評估照片 */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <SectionTitle>備 註 欄 / 評 估 照 片</SectionTitle>
        </div>

        <FormCard>
          <div className="space-y-6">
            <TextArea
              label="備註"
              value={trainingPlan.notes}
              onChange={(e) => updateTrainingPlan({ notes: e.target.value })}
              placeholder="請輸入備註內容"
              rows={4}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-stark-text">評估照片</label>
              <div className="grid grid-cols-3 gap-3">
                <SinglePhotoUpload
                  value={getPhoto(0)}
                  onChange={(url) => updatePhoto(0, url)}
                  placeholder="新增"
                />
                <SinglePhotoUpload
                  value={getPhoto(1)}
                  onChange={(url) => updatePhoto(1, url)}
                  placeholder="新增"
                />
                <SinglePhotoUpload
                  value={getPhoto(2)}
                  onChange={(url) => updatePhoto(2, url)}
                  placeholder="新增"
                />
              </div>
            </div>
          </div>
        </FormCard>
      </div>

      {/* 簽名區 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormCard>
          <SignaturePad
            label="客戶簽名"
            value={trainingPlan.clientSignature}
            onChange={(dataUrl) => updateTrainingPlan({ clientSignature: dataUrl || "" })}
          />
        </FormCard>

        <FormCard>
          <SignaturePad
            label="教練簽名"
            value={trainingPlan.coachSignature}
            onChange={(dataUrl) => updateTrainingPlan({ coachSignature: dataUrl || "" })}
          />
        </FormCard>
      </div>
    </div>
  );
}
