import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useEvaluationForm, EvaluationFormProvider } from "@/contexts/EvaluationFormContext";
import { FormNavigation, FormNavigationButtons } from "@/components/FormNavigation";
import { Page1BasicInfo } from "@/components/pages/Page1BasicInfo";
import { Page2MotiPhysio } from "@/components/pages/Page2MotiPhysio";
import { Page3FunctionalUpper } from "@/components/pages/Page3FunctionalUpper";
import { Page4FunctionalLower } from "@/components/pages/Page4FunctionalLower";
import { Page5Redcord } from "@/components/pages/Page5Redcord";
import { Page6Ronfic } from "@/components/pages/Page6Ronfic";
import { Page7TrainingPlan } from "@/components/pages/Page7TrainingPlan";
import { DateInput } from "@/components/FormFields";
import { FileDown, Save, Loader2, LayoutTemplate } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { formDataToEvaluationInput } from "@/lib/evaluationMapper";



function EvaluationFormContent({ evaluationId }: { evaluationId: number }) {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const {
    formData,
    currentPage,
    completedPages,
    isLoading: isLoadingEvaluation,
    isSaving,
    lastSavedAt,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    markPageCompleted,
    updateBasicInfo,
    loadFormData,
  } = useEvaluationForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const totalPages = 7;

  // tRPC mutations (immediate save + PDF). Autosave is handled inside the
  // Provider — this Save button is "save now, don't wait the 5s debounce".
  const updateMutation = trpc.evaluation.update.useMutation();
  const pdfMutation = trpc.pdf.generate.useMutation();

  // 範本相關
  const { data: templates } = trpc.template.list.useQuery();

  // 檢查登入狀態
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">請先登入以使用評估表功能</p>
        <a
          href={getLoginUrl()}
          className="px-6 py-3 rounded-lg bg-stark-orange text-white hover:bg-stark-orange-dark transition-colors"
        >
          登入
        </a>
      </div>
    );
  }

  if (isLoadingEvaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    if (page > currentPage) {
      markPageCompleted(currentPage);
    }
    setCurrentPage(page);
  };

  const handleNext = () => {
    markPageCompleted(currentPage);
    goToNextPage();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const apiData = formDataToEvaluationInput(formData);
      const result = await updateMutation.mutateAsync({
        id: evaluationId,
        data: apiData,
      });
      if (result.success) {
        toast.success("評估表已更新成功！");
      } else {
        toast.error(result.error || "更新失敗");
      }
      markPageCompleted(currentPage);
    } catch (error) {
      toast.error("儲存失敗，請重試");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    toast.info("PDF 生成中，請稍候...");

    try {
      // 先儲存最新資料
      const apiData = formDataToEvaluationInput(formData);
      await updateMutation.mutateAsync({
        id: evaluationId,
        data: apiData,
      });
      
      // 使用前端列印方式生成 PDF
      const evaluationData = {
        date: formData.basicInfo.date,
        clientName: formData.basicInfo.name,
        birthDate: formData.basicInfo.birthday,
        occupation: formData.basicInfo.occupation,
        dominantHand: formData.basicInfo.dominantHand,
        currentSymptomLocation: formData.basicInfo.currentSymptomLocation,
        currentSymptomTrigger: formData.basicInfo.currentSymptomTrigger,
        currentTreatment: formData.basicInfo.currentSymptomTreatment,
        pastSymptomLocation: formData.basicInfo.pastSymptomLocation,
        pastSymptomTrigger: formData.basicInfo.pastSymptomTrigger,
        pastTreatment: formData.basicInfo.pastSymptomTreatment,
        earliestSymptomLocation: formData.basicInfo.earliestSymptomLocation,
        earliestSymptomTrigger: formData.basicInfo.earliestSymptomTrigger,
        earliestTreatment: formData.basicInfo.earliestSymptomTreatment,
        injuryHistory: formData.basicInfo.injuryHistory,
        fractureHistory: formData.basicInfo.fractureHistory,
        surgeryHistory: formData.basicInfo.surgeryHistory,
        medicalDiagnosis: formData.basicInfo.medicalDiagnosis,
        currentMedication: formData.basicInfo.medication,
        exerciseHabits: formData.basicInfo.exerciseHabits,
        sleepCondition: formData.basicInfo.sleepCondition,
        goals: formData.basicInfo.goalsAndExpectations,
        motiPhysioPage1: formData.motiPhysio.reportPage1,
        motiPhysioPage2: formData.motiPhysio.reportPage2,
        motiRiskValues: formData.motiRiskValues,
        functionalMovement: formData.functionalMovement,
        redcordAssessment: formData.redcord,
        ronficMiniplusResult: formData.ronfic.miniplusResult,
        ronficXimResult: formData.ronfic.ximResult,
        trainingPlans: formData.trainingPlan.plans,
        notes: formData.trainingPlan.notes,
        photos: formData.trainingPlan.photos,
        clientSignature: formData.trainingPlan.clientSignature,
        coachSignature: formData.trainingPlan.coachSignature,
      };
      
      // 動態導入 PDF 生成工具
      const { printToPDF } = await import("@/lib/pdfGenerator");
      await printToPDF(evaluationData, `史塔克初評報告_${formData.basicInfo.name || '未命名'}_${formData.basicInfo.date || new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("PDF 已生成並開始下載！");
    } catch (error: any) {
      console.error("PDF 匯出錯誤:", error);
      const errorMessage = error?.message || "PDF 匯出失敗，請重試";
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return <Page1BasicInfo />;
      case 2:
        return <Page2MotiPhysio />;
      case 3:
        return <Page3FunctionalUpper />;
      case 4:
        return <Page4FunctionalLower />;
      case 5:
        return <Page5Redcord />;
      case 6:
        return <Page6Ronfic />;
      case 7:
        return <Page7TrainingPlan />;
      default:
        return <Page1BasicInfo />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 頁首 */}
      <header className="sticky top-0 z-50 bg-stark-bg border-b-2 border-stark-border shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo 和標題 */}
            <div className="flex items-center gap-4">
              <img 
                src="/stark-logo.webp" 
                alt="史塔克 STARK WORKS" 
                className="h-14 w-auto"
              />
            </div>

            {/* 報告標題和日期 */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <h2 className="text-xl font-bold text-stark-text">初評報告</h2>
              <DateInput
                label=""
                value={formData.basicInfo.date}
                onChange={(e) => updateBasicInfo({ date: e.target.value })}
                className="w-40"
              />
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-2">
              {/* 套用範本按鈕 */}
              <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-stark-border bg-white text-stark-text hover:bg-stark-bg transition-colors"
                  >
                    <LayoutTemplate className="w-4 h-4" />
                    <span className="hidden sm:inline">套用範本</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>選擇評估範本</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {templates && templates.length > 0 ? (
                      templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            // 套用範本資料
                            if (template.functionalMovement) {
                              loadFormData({
                                ...formData,
                                functionalMovement: template.functionalMovement as any,
                              });
                            }
                            if (template.redcordAssessment) {
                              loadFormData({
                                ...formData,
                                redcord: template.redcordAssessment as any,
                              });
                            }
                            if (template.trainingPlans) {
                              loadFormData({
                                ...formData,
                                trainingPlan: {
                                  ...formData.trainingPlan,
                                  plans: template.trainingPlans as any,
                                },
                              });
                            }
                            setIsTemplateDialogOpen(false);
                            toast.success(`已套用範本「${template.name}」`);
                          }}
                          className="w-full p-4 text-left rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <LayoutTemplate className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>尚無可用範本</p>
                        <p className="text-sm mt-1">請先在範本管理中建立範本</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <button
                onClick={handleExportPDF}
                disabled={isExporting || !evaluationId}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-stark-border bg-white text-stark-text hover:bg-stark-bg transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">生成 PDF</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stark-orange text-white hover:bg-stark-orange-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isSubmitting ? "儲存中..." : "儲存"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PDF 下載連結顯示區 */}
      {pdfUrl && (
        <div className="container mt-4">
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileDown className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-800">PDF 已生成完成！</p>
                <p className="text-sm text-green-600">請點擊下方按鈕下載，或複製連結後在瀏覽器開啟</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
              >
                <FileDown className="w-5 h-5" />
                下載 PDF
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pdfUrl);
                  toast.success("已複製 PDF 連結！");
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-green-600 text-green-700 font-bold hover:bg-green-50 transition-colors"
              >
                複製連結
              </button>
            </div>
          </div>
          <div className="mt-2 p-2 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">下載連結（可複製）：</p>
            <p className="text-xs text-gray-700 break-all select-all font-mono">{pdfUrl}</p>
          </div>
        </div>
      )}

      {/* 進度導航 */}
      <div className="container">
        <FormNavigation
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          completedPages={completedPages}
        />
      </div>

      {/* 表單內容 */}
      <main className="container pb-8">
        <div className="bg-stark-bg-card rounded-2xl border-2 border-stark-border p-6 shadow-sm">
          {renderCurrentPage()}

          <FormNavigationButtons
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={goToPreviousPage}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
}

// Route entry. /evaluation/new triggers a one-shot create + redirect.
// /evaluation/:id renders the wizard inside a tRPC-bound Provider so loads
// and autosaves go through evaluation.{get,update} automatically.
export default function EvaluationForm() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const createMutation = trpc.evaluation.create.useMutation();
  const [creating, setCreating] = useState(false);

  const rawId = params.id ?? "";
  const parsedId = Number(rawId);
  const evaluationId =
    Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;

  // /evaluation/new path: create an empty row then redirect into the
  // tRPC-bound flow. Guarded by `creating` so React Strict Mode's double
  // mount in dev doesn't fire two creates.
  useEffect(() => {
    if (evaluationId != null || creating) return;
    if (rawId !== "new") return;
    setCreating(true);
    createMutation
      .mutateAsync({})
      .then(result => {
        if (result.id) {
          setLocation(`/evaluation/${result.id}`);
        } else {
          toast.error("無法建立新評估");
          setCreating(false);
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("建立評估失敗");
        setCreating(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawId, evaluationId]);

  if (evaluationId == null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
      </div>
    );
  }

  return (
    <EvaluationFormProvider evaluationId={evaluationId}>
      <EvaluationFormContent evaluationId={evaluationId} />
    </EvaluationFormProvider>
  );
}
