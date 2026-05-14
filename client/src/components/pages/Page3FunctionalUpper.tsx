import { useEvaluationForm } from "@/contexts/EvaluationFormContext";
import {
  FunctionalMovementTable,
  MovementRow,
  DualSideMovementRow,
} from "@/components/FunctionalMovementTable";
import { SectionTitle } from "@/components/FormFields";

export function Page3FunctionalUpper() {
  const { formData, updateFunctionalMovement } = useEvaluationForm();
  const { functionalMovement } = formData;

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <SectionTitle>功 能 性 動 作 檢 測</SectionTitle>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-stark-border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-stark-bg">
              <th className="p-3 text-center font-medium text-stark-text border-r border-stark-border w-44">
                動作
              </th>
              <th className="p-3 text-center font-medium text-stark-text border-r border-stark-border w-28">
                表現/疼痛
              </th>
              <th className="p-3 text-center font-medium text-stark-text border-r border-stark-border w-32">
                促進因素
              </th>
              <th className="p-3 text-center font-medium text-stark-text">
                狀況
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 頸部屈曲/後仰 */}
            <tr className="bg-stark-bg/30">
              <td colSpan={4} className="p-2 border-b border-stark-border">
                <span className="font-medium text-stark-text">頸部屈曲/後仰</span>
                <span className="text-xs text-muted-foreground ml-2">Neck Flexion and Extension</span>
              </td>
            </tr>
            <MovementRow
              label="屈曲"
              item={functionalMovement.neckFlexion}
              onChange={(item) => updateFunctionalMovement({ neckFlexion: item })}
            />
            <MovementRow
              label="後仰"
              item={functionalMovement.neckExtension}
              onChange={(item) => updateFunctionalMovement({ neckExtension: item })}
            />

            {/* 頸部左/右旋轉 */}
            <tr className="bg-stark-bg/30">
              <td colSpan={4} className="p-2 border-b border-stark-border">
                <span className="font-medium text-stark-text">頸部左/右旋轉</span>
                <span className="text-xs text-muted-foreground ml-2">Neck Rotation</span>
              </td>
            </tr>
            <MovementRow
              label="左轉"
              item={functionalMovement.neckRotationLeft}
              onChange={(item) => updateFunctionalMovement({ neckRotationLeft: item })}
            />
            <MovementRow
              label="右轉"
              item={functionalMovement.neckRotationRight}
              onChange={(item) => updateFunctionalMovement({ neckRotationRight: item })}
            />

            {/* 肩關節屈曲/伸直 */}
            <tr className="bg-stark-bg/30">
              <td colSpan={4} className="p-2 border-b border-stark-border">
                <span className="font-medium text-stark-text">肩關節屈曲/伸直</span>
                <span className="text-xs text-muted-foreground ml-2">Flexion / Extension</span>
              </td>
            </tr>
            <MovementRow
              label="左手"
              item={functionalMovement.shoulderFlexionLeft}
              onChange={(item) => updateFunctionalMovement({ shoulderFlexionLeft: item })}
            />
            <MovementRow
              label="右手"
              item={functionalMovement.shoulderFlexionRight}
              onChange={(item) => updateFunctionalMovement({ shoulderFlexionRight: item })}
            />

            {/* 肩關節外展 */}
            <tr className="bg-stark-bg/30">
              <td colSpan={4} className="p-2 border-b border-stark-border">
                <span className="font-medium text-stark-text">肩關節外展</span>
                <span className="text-xs text-muted-foreground ml-2">Abduction / Adduction</span>
              </td>
            </tr>
            <MovementRow
              label="左手"
              item={functionalMovement.shoulderAbductionLeft}
              onChange={(item) => updateFunctionalMovement({ shoulderAbductionLeft: item })}
            />
            <MovementRow
              label="右手"
              item={functionalMovement.shoulderAbductionRight}
              onChange={(item) => updateFunctionalMovement({ shoulderAbductionRight: item })}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
