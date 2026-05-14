import { useEvaluationForm } from "@/contexts/EvaluationFormContext";
import { ImageUpload } from "@/components/ImageUpload";
import { SectionTitle } from "@/components/FormFields";

export function Page6Ronfic() {
  const { formData, updateRonfic } = useEvaluationForm();
  const { ronfic } = formData;

  return (
    <div className="space-y-8">
      {/* RONFIC MINIPLUS */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <SectionTitle>RONFIC MINIPLUS 評估結果</SectionTitle>
        </div>
        <ImageUpload
          label=""
          value={ronfic.miniplusResult}
          onChange={(url) => updateRonfic({ miniplusResult: url || "" })}
          aspectRatio="video"
          placeholder="點擊或拖曳上傳 RONFIC MINIPLUS 評估結果"
          className="min-h-[300px]"
        />
      </div>

      {/* RONFIC XIM */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <SectionTitle>RONFIC XIM 評估結果</SectionTitle>
        </div>
        <ImageUpload
          label=""
          value={ronfic.ximResult}
          onChange={(url) => updateRonfic({ ximResult: url || "" })}
          aspectRatio="video"
          placeholder="點擊或拖曳上傳 RONFIC XIM 評估結果"
          className="min-h-[300px]"
        />
      </div>
    </div>
  );
}
