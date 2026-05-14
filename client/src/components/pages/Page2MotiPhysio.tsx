import { useEvaluationForm } from "@/contexts/EvaluationFormContext";
import { ImageUpload } from "@/components/ImageUpload";
import { SectionTitle } from "@/components/FormFields";

export function Page2MotiPhysio() {
  const { formData, updateMotiPhysio } = useEvaluationForm();
  const { motiPhysio } = formData;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-muted-foreground">
          請上傳 Moti Physio 3D 姿勢檢測報告的兩頁截圖
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 第一頁報告 */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <SectionTitle>Moti Physio 3D 姿勢檢測報告第一頁</SectionTitle>
          </div>
          <ImageUpload
            label=""
            value={motiPhysio.reportPage1}
            onChange={(url) => updateMotiPhysio({ reportPage1: url || "" })}
            aspectRatio="video"
            placeholder="點擊或拖曳上傳第一頁報告"
            className="min-h-[400px]"
          />
        </div>

        {/* 第二頁報告 */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <SectionTitle>Moti Physio 3D 姿勢檢測報告第二頁</SectionTitle>
          </div>
          <ImageUpload
            label=""
            value={motiPhysio.reportPage2}
            onChange={(url) => updateMotiPhysio({ reportPage2: url || "" })}
            aspectRatio="video"
            placeholder="點擊或拖曳上傳第二頁報告"
            className="min-h-[400px]"
          />
        </div>
      </div>
    </div>
  );
}
