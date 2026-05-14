import { useEvaluationForm } from "@/contexts/EvaluationFormContext";
import { TextInput, DateInput, TextArea, RadioGroup, FormCard } from "@/components/FormFields";

export function Page1BasicInfo() {
  const { formData, updateBasicInfo } = useEvaluationForm();
  const { basicInfo } = formData;

  return (
    <div className="space-y-6">
      {/* 基本資料 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TextInput
          label="姓名"
          value={basicInfo.name}
          onChange={(e) => updateBasicInfo({ name: e.target.value })}
          placeholder="請輸入姓名"
        />
        <DateInput
          label="生日"
          value={basicInfo.birthday}
          onChange={(e) => updateBasicInfo({ birthday: e.target.value })}
        />
        <TextInput
          label="職業"
          value={basicInfo.occupation}
          onChange={(e) => updateBasicInfo({ occupation: e.target.value })}
          placeholder="請輸入職業"
        />
        <RadioGroup
          label="慣用手"
          name="dominantHand"
          options={[
            { value: "right", label: "右手" },
            { value: "left", label: "左手" },
          ]}
          value={basicInfo.dominantHand}
          onChange={(value) => updateBasicInfo({ dominantHand: value as "left" | "right" })}
        />
      </div>

      {/* 目前症狀 */}
      <FormCard>
        <h3 className="font-semibold text-stark-text mb-4">目前症狀</h3>
        <div className="space-y-4">
          <TextArea
            label="目前症狀部位"
            value={basicInfo.currentSymptomLocation}
            onChange={(e) => updateBasicInfo({ currentSymptomLocation: e.target.value })}
            placeholder="請描述目前症狀部位"
            rows={2}
          />
          <TextArea
            label="引起症狀動作"
            value={basicInfo.currentSymptomTrigger}
            onChange={(e) => updateBasicInfo({ currentSymptomTrigger: e.target.value })}
            placeholder="請描述引起症狀的動作"
            rows={2}
          />
          <TextArea
            label="針對此症狀的治療"
            value={basicInfo.currentSymptomTreatment}
            onChange={(e) => updateBasicInfo({ currentSymptomTreatment: e.target.value })}
            placeholder="請描述目前的治療方式"
            rows={2}
          />
        </div>
      </FormCard>

      {/* 過去症狀 */}
      <FormCard>
        <h3 className="font-semibold text-stark-text mb-4">過去症狀</h3>
        <div className="space-y-4">
          <TextArea
            label="過去症狀部位"
            value={basicInfo.pastSymptomLocation}
            onChange={(e) => updateBasicInfo({ pastSymptomLocation: e.target.value })}
            placeholder="請描述過去症狀部位"
            rows={2}
          />
          <TextArea
            label="引起症狀動作"
            value={basicInfo.pastSymptomTrigger}
            onChange={(e) => updateBasicInfo({ pastSymptomTrigger: e.target.value })}
            placeholder="請描述引起症狀的動作"
            rows={2}
          />
          <TextArea
            label="針對此症狀的治療"
            value={basicInfo.pastSymptomTreatment}
            onChange={(e) => updateBasicInfo({ pastSymptomTreatment: e.target.value })}
            placeholder="請描述過去的治療方式"
            rows={2}
          />
        </div>
      </FormCard>

      {/* 最早症狀 */}
      <FormCard>
        <h3 className="font-semibold text-stark-text mb-4">最早症狀</h3>
        <div className="space-y-4">
          <TextArea
            label="最早症狀部位"
            value={basicInfo.earliestSymptomLocation}
            onChange={(e) => updateBasicInfo({ earliestSymptomLocation: e.target.value })}
            placeholder="請描述最早症狀部位"
            rows={2}
          />
          <TextArea
            label="引起症狀動作"
            value={basicInfo.earliestSymptomTrigger}
            onChange={(e) => updateBasicInfo({ earliestSymptomTrigger: e.target.value })}
            placeholder="請描述引起症狀的動作"
            rows={2}
          />
          <TextArea
            label="針對此症狀的治療"
            value={basicInfo.earliestSymptomTreatment}
            onChange={(e) => updateBasicInfo({ earliestSymptomTreatment: e.target.value })}
            placeholder="請描述最早的治療方式"
            rows={2}
          />
        </div>
      </FormCard>

      {/* 病史 */}
      <FormCard>
        <h3 className="font-semibold text-stark-text mb-4">病史</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextArea
            label="受傷史"
            value={basicInfo.injuryHistory}
            onChange={(e) => updateBasicInfo({ injuryHistory: e.target.value })}
            placeholder="請描述受傷史"
            rows={2}
          />
          <TextArea
            label="骨折史"
            value={basicInfo.fractureHistory}
            onChange={(e) => updateBasicInfo({ fractureHistory: e.target.value })}
            placeholder="請描述骨折史"
            rows={2}
          />
          <TextArea
            label="手術史"
            value={basicInfo.surgeryHistory}
            onChange={(e) => updateBasicInfo({ surgeryHistory: e.target.value })}
            placeholder="請描述手術史"
            rows={2}
          />
        </div>
      </FormCard>

      {/* 醫學診斷 */}
      <FormCard>
        <TextArea
          label="醫學診斷"
          value={basicInfo.medicalDiagnosis}
          onChange={(e) => updateBasicInfo({ medicalDiagnosis: e.target.value })}
          placeholder="請輸入醫學診斷"
          rows={2}
        />
      </FormCard>

      {/* 用藥 */}
      <FormCard>
        <TextArea
          label="用藥"
          value={basicInfo.medication}
          onChange={(e) => updateBasicInfo({ medication: e.target.value })}
          placeholder="請輸入目前用藥"
          rows={2}
        />
      </FormCard>

      {/* 運動習慣 */}
      <FormCard>
        <TextArea
          label="運動習慣"
          value={basicInfo.exerciseHabits}
          onChange={(e) => updateBasicInfo({ exerciseHabits: e.target.value })}
          placeholder="請描述運動習慣"
          rows={2}
        />
      </FormCard>

      {/* 睡眠狀況 */}
      <FormCard>
        <TextArea
          label="睡眠狀況"
          value={basicInfo.sleepCondition}
          onChange={(e) => updateBasicInfo({ sleepCondition: e.target.value })}
          placeholder="請描述睡眠狀況"
          rows={2}
        />
      </FormCard>

      {/* 目標與期待 */}
      <FormCard>
        <TextArea
          label="目標與期待"
          value={basicInfo.goalsAndExpectations}
          onChange={(e) => updateBasicInfo({ goalsAndExpectations: e.target.value })}
          placeholder="請描述您的目標與期待"
          rows={3}
        />
      </FormCard>
    </div>
  );
}
