import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  EvaluationFormData,
  BasicInfo,
  MotiPhysioReport,
  MotiRiskValues,
  FunctionalMovement,
  RedcordAssessment,
  RonficAssessment,
  TrainingPlan,
  defaultEvaluationFormData,
} from "../../../shared/evaluation";

interface EvaluationFormContextType {
  formData: EvaluationFormData;
  currentPage: number;
  completedPages: number[];
  
  // 頁面導航
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  markPageCompleted: (page: number) => void;
  
  // 資料更新
  updateBasicInfo: (data: Partial<BasicInfo>) => void;
  updateMotiPhysio: (data: Partial<MotiPhysioReport>) => void;
  updateMotiRiskValues: (data: Partial<MotiRiskValues>) => void;
  updateFunctionalMovement: (data: Partial<FunctionalMovement>) => void;
  updateRedcord: (data: Partial<RedcordAssessment>) => void;
  updateRonfic: (data: Partial<RonficAssessment>) => void;
  updateTrainingPlan: (data: Partial<TrainingPlan>) => void;
  
  // 表單操作
  resetForm: () => void;
  loadFormData: (data: EvaluationFormData) => void;
}

const EvaluationFormContext = createContext<EvaluationFormContextType | undefined>(undefined);

export function EvaluationFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<EvaluationFormData>(defaultEvaluationFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [completedPages, setCompletedPages] = useState<number[]>([]);

  const totalPages = 7;

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const markPageCompleted = useCallback((page: number) => {
    setCompletedPages((prev) => {
      if (prev.includes(page)) return prev;
      return [...prev, page];
    });
  }, []);

  const updateBasicInfo = useCallback((data: Partial<BasicInfo>) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data },
    }));
  }, []);

  const updateMotiPhysio = useCallback((data: Partial<MotiPhysioReport>) => {
    setFormData((prev) => ({
      ...prev,
      motiPhysio: { ...prev.motiPhysio, ...data },
    }));
  }, []);

  const updateMotiRiskValues = useCallback((data: Partial<MotiRiskValues>) => {
    setFormData((prev) => ({
      ...prev,
      motiRiskValues: { ...prev.motiRiskValues, ...data },
    }));
  }, []);

  const updateFunctionalMovement = useCallback((data: Partial<FunctionalMovement>) => {
    setFormData((prev) => ({
      ...prev,
      functionalMovement: { ...prev.functionalMovement, ...data },
    }));
  }, []);

  const updateRedcord = useCallback((data: Partial<RedcordAssessment>) => {
    setFormData((prev) => ({
      ...prev,
      redcord: { ...prev.redcord, ...data },
    }));
  }, []);

  const updateRonfic = useCallback((data: Partial<RonficAssessment>) => {
    setFormData((prev) => ({
      ...prev,
      ronfic: { ...prev.ronfic, ...data },
    }));
  }, []);

  const updateTrainingPlan = useCallback((data: Partial<TrainingPlan>) => {
    setFormData((prev) => ({
      ...prev,
      trainingPlan: { ...prev.trainingPlan, ...data },
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(defaultEvaluationFormData);
    setCurrentPage(1);
    setCompletedPages([]);
  }, []);

  const loadFormData = useCallback((data: EvaluationFormData) => {
    setFormData(data);
  }, []);

  return (
    <EvaluationFormContext.Provider
      value={{
        formData,
        currentPage,
        completedPages,
        setCurrentPage,
        goToNextPage,
        goToPreviousPage,
        markPageCompleted,
        updateBasicInfo,
        updateMotiPhysio,
        updateMotiRiskValues,
        updateFunctionalMovement,
        updateRedcord,
        updateRonfic,
        updateTrainingPlan,
        resetForm,
        loadFormData,
      }}
    >
      {children}
    </EvaluationFormContext.Provider>
  );
}

export function useEvaluationForm() {
  const context = useContext(EvaluationFormContext);
  if (!context) {
    throw new Error("useEvaluationForm must be used within EvaluationFormProvider");
  }
  return context;
}
