import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
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
import { trpc } from "@/lib/trpc";
import {
  evaluationRowToFormData,
  formDataToEvaluationInput,
} from "@/lib/evaluationMapper";

// Two modes:
//   - in-memory mode (evaluationId undefined): legacy /evaluation wizard
//     does its own load/save. Provider behaves as a pure useState container.
//   - tRPC mode (evaluationId set): Provider loads from evaluation.get and
//     debounces every update into evaluation.update (5s window).
//
// Pages 1-7 use the same `formData` + `update*` API in both modes.
const AUTOSAVE_DEBOUNCE_MS = 5000;

interface EvaluationFormContextType {
  formData: EvaluationFormData;
  currentPage: number;
  completedPages: number[];

  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  markPageCompleted: (page: number) => void;

  updateBasicInfo: (data: Partial<BasicInfo>) => void;
  updateMotiPhysio: (data: Partial<MotiPhysioReport>) => void;
  updateMotiRiskValues: (data: Partial<MotiRiskValues>) => void;
  updateFunctionalMovement: (data: Partial<FunctionalMovement>) => void;
  updateRedcord: (data: Partial<RedcordAssessment>) => void;
  updateRonfic: (data: Partial<RonficAssessment>) => void;
  updateTrainingPlan: (data: Partial<TrainingPlan>) => void;

  resetForm: () => void;
  loadFormData: (data: EvaluationFormData) => void;

  // tRPC-mode status. Always present; in in-memory mode they stay at their
  // initial values (isLoading=false, isSaving=false, lastSavedAt=null).
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

const EvaluationFormContext = createContext<
  EvaluationFormContextType | undefined
>(undefined);

export function EvaluationFormProvider({
  children,
  evaluationId,
}: {
  children: ReactNode;
  evaluationId?: number;
}) {
  const [formData, setFormData] = useState<EvaluationFormData>(
    defaultEvaluationFormData
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [completedPages, setCompletedPages] = useState<number[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const totalPages = 7;

  // ===== tRPC integration (only when evaluationId is set) =====
  const utils = trpc.useUtils();
  const evalQuery = trpc.evaluation.get.useQuery(
    { id: evaluationId ?? 0 },
    { enabled: !!evaluationId, refetchOnWindowFocus: false }
  );
  const updateMutation = trpc.evaluation.update.useMutation();

  // Track whether we've finished the initial load — used to suppress
  // autosave triggering off the load itself.
  const hydratedRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial hydrate from server data.
  useEffect(() => {
    if (!evaluationId) {
      hydratedRef.current = false;
      return;
    }
    if (evalQuery.data && !hydratedRef.current) {
      setFormData(evaluationRowToFormData(evalQuery.data as any));
      hydratedRef.current = true;
    }
  }, [evaluationId, evalQuery.data]);

  // Reset hydration flag when evaluationId changes.
  useEffect(() => {
    hydratedRef.current = false;
    setFormData(defaultEvaluationFormData);
    setLastSavedAt(null);
  }, [evaluationId]);

  // Debounced autosave on formData changes (only after hydration, only
  // when an id is set).
  useEffect(() => {
    if (!evaluationId || !hydratedRef.current) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      updateMutation.mutate(
        {
          id: evaluationId,
          data: formDataToEvaluationInput(formData),
        },
        {
          onSuccess: result => {
            if (result.success) {
              setLastSavedAt(new Date());
              // Other consumers (main IntegratedAssessmentPage, future
              // client report) read evaluation.get / list — invalidate so
              // they reflect the latest fields after autosave.
              utils.evaluation.get.invalidate({ id: evaluationId });
              utils.evaluation.list.invalidate();
            }
          },
        }
      );
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
    // Intentionally omit updateMutation from deps — its identity changes
    // on every render and would re-arm the timer immediately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, evaluationId]);

  // ===== Navigation =====
  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const markPageCompleted = useCallback((page: number) => {
    setCompletedPages(prev => (prev.includes(page) ? prev : [...prev, page]));
  }, []);

  // ===== Field updaters =====
  const updateBasicInfo = useCallback((data: Partial<BasicInfo>) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data },
    }));
  }, []);

  const updateMotiPhysio = useCallback((data: Partial<MotiPhysioReport>) => {
    setFormData(prev => ({
      ...prev,
      motiPhysio: { ...prev.motiPhysio, ...data },
    }));
  }, []);

  const updateMotiRiskValues = useCallback((data: Partial<MotiRiskValues>) => {
    setFormData(prev => ({
      ...prev,
      motiRiskValues: { ...prev.motiRiskValues, ...data },
    }));
  }, []);

  const updateFunctionalMovement = useCallback(
    (data: Partial<FunctionalMovement>) => {
      setFormData(prev => ({
        ...prev,
        functionalMovement: { ...prev.functionalMovement, ...data },
      }));
    },
    []
  );

  const updateRedcord = useCallback((data: Partial<RedcordAssessment>) => {
    setFormData(prev => ({
      ...prev,
      redcord: { ...prev.redcord, ...data },
    }));
  }, []);

  const updateRonfic = useCallback((data: Partial<RonficAssessment>) => {
    setFormData(prev => ({
      ...prev,
      ronfic: { ...prev.ronfic, ...data },
    }));
  }, []);

  const updateTrainingPlan = useCallback((data: Partial<TrainingPlan>) => {
    setFormData(prev => ({
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
        isLoading: !!evaluationId && evalQuery.isLoading,
        isSaving: updateMutation.isPending,
        lastSavedAt,
      }}
    >
      {children}
    </EvaluationFormContext.Provider>
  );
}

export function useEvaluationForm() {
  const context = useContext(EvaluationFormContext);
  if (!context) {
    throw new Error(
      "useEvaluationForm must be used within EvaluationFormProvider"
    );
  }
  return context;
}
