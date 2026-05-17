// Bidirectional mapping between the flat `evaluations` row (server / tRPC)
// and the nested EvaluationFormData shape consumed by Page 1-7 components.
//
// Extracted from client/src/pages/EvaluationForm.tsx so both the legacy
// wizard (manual save) and the new Drawer (autosave) share one source of
// truth.

import {
  EvaluationFormData,
  defaultMotiRiskValues,
} from "../../../shared/evaluation";

// `Evaluation` row from drizzle/schema; loose-typed via `any` here to avoid
// pulling drizzle's schema types into the client bundle. The two callers
// already do their own type-guarding via tRPC.
type EvaluationRow = Record<string, unknown> & { id?: number };

export function evaluationRowToFormData(row: EvaluationRow): EvaluationFormData {
  return {
    basicInfo: {
      date: (row.date as string) || "",
      name: (row.clientName as string) || "",
      birthday: (row.birthday as string) || "",
      occupation: (row.occupation as string) || "",
      dominantHand: ((row.dominantHand as "right" | "left" | "") || "") as
        | "right"
        | "left"
        | "",
      currentSymptomLocation: (row.currentSymptomLocation as string) || "",
      currentSymptomTrigger: (row.currentSymptomTrigger as string) || "",
      currentSymptomTreatment: (row.currentSymptomTreatment as string) || "",
      pastSymptomLocation: (row.pastSymptomLocation as string) || "",
      pastSymptomTrigger: (row.pastSymptomTrigger as string) || "",
      pastSymptomTreatment: (row.pastSymptomTreatment as string) || "",
      earliestSymptomLocation: (row.earliestSymptomLocation as string) || "",
      earliestSymptomTrigger: (row.earliestSymptomTrigger as string) || "",
      earliestSymptomTreatment: (row.earliestSymptomTreatment as string) || "",
      injuryHistory: (row.injuryHistory as string) || "",
      fractureHistory: (row.fractureHistory as string) || "",
      surgeryHistory: (row.surgeryHistory as string) || "",
      medicalDiagnosis: (row.medicalDiagnosis as string) || "",
      medication: (row.medication as string) || "",
      exerciseHabits: (row.exerciseHabits as string) || "",
      sleepCondition: (row.sleepCondition as string) || "",
      goalsAndExpectations: (row.goalsAndExpectations as string) || "",
    },
    motiPhysio: {
      reportPage1: (row.motiPhysioPage1 as string) || "",
      reportPage2: (row.motiPhysioPage2 as string) || "",
    },
    motiRiskValues: (row.motiRiskValues as any) || defaultMotiRiskValues,
    functionalMovement: (row.functionalMovement as any) || {},
    redcord: (row.redcordAssessment as any) || {},
    ronfic: {
      miniplusResult: (row.ronficMiniplusResult as string) || "",
      ximResult: (row.ronficXimResult as string) || "",
    },
    trainingPlan: {
      plans: (row.trainingPlans as any) || [],
      notes: (row.notes as string) || "",
      photos: (row.photos as any) || [],
      clientSignature: (row.clientSignature as string) || "",
      coachSignature: (row.coachSignature as string) || "",
    },
  };
}

// Inverse of evaluationRowToFormData — produces the payload accepted by
// the `evaluation.create` / `evaluation.update` tRPC mutations.
export function formDataToEvaluationInput(formData: EvaluationFormData) {
  return {
    date: formData.basicInfo.date,
    clientName: formData.basicInfo.name,
    birthday: formData.basicInfo.birthday,
    occupation: formData.basicInfo.occupation,
    dominantHand: formData.basicInfo.dominantHand,

    currentSymptomLocation: formData.basicInfo.currentSymptomLocation,
    currentSymptomTrigger: formData.basicInfo.currentSymptomTrigger,
    currentSymptomTreatment: formData.basicInfo.currentSymptomTreatment,

    pastSymptomLocation: formData.basicInfo.pastSymptomLocation,
    pastSymptomTrigger: formData.basicInfo.pastSymptomTrigger,
    pastSymptomTreatment: formData.basicInfo.pastSymptomTreatment,

    earliestSymptomLocation: formData.basicInfo.earliestSymptomLocation,
    earliestSymptomTrigger: formData.basicInfo.earliestSymptomTrigger,
    earliestSymptomTreatment: formData.basicInfo.earliestSymptomTreatment,

    injuryHistory: formData.basicInfo.injuryHistory,
    fractureHistory: formData.basicInfo.fractureHistory,
    surgeryHistory: formData.basicInfo.surgeryHistory,
    medicalDiagnosis: formData.basicInfo.medicalDiagnosis,
    medication: formData.basicInfo.medication,
    exerciseHabits: formData.basicInfo.exerciseHabits,
    sleepCondition: formData.basicInfo.sleepCondition,
    goalsAndExpectations: formData.basicInfo.goalsAndExpectations,

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
}
