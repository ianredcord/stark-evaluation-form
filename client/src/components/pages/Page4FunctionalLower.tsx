import { useEvaluationForm } from "@/contexts/EvaluationFormContext";
import { MovementRow } from "@/components/FunctionalMovementTable";
import { SectionTitle } from "@/components/FormFields";

export function Page4FunctionalLower() {
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
            {/* 軀幹前彎 */}
            <tr className="bg-stark-bg/30">
              <td colSpan={4} className="p-2 border-b border-stark-border">
                <span className="font-medium text-stark-text">軀幹前彎</span>
                <span className="text-xs text-muted-foreground ml-2">FLEXION</span>
              </td>
            </tr>
            <MovementRow
              label="前彎"
              item={functionalMovement.trunkFlexion}
              onChange={(item) => updateFunctionalMovement({ trunkFlexion: item })}
              promotingFactorOptions={["A", "B", "D"]}
            />

            {/* 軀幹後仰 */}
            <tr className="bg-stark-bg/30">
              <td colSpan={4} className="p-2 border-b border-stark-border">
                <span className="font-medium text-stark-text">軀幹後仰</span>
              </td>
            </tr>
            <MovementRow
              label="後仰"
              item={functionalMovement.trunkExtension}
              onChange={(item) => updateFunctionalMovement({ trunkExtension: item })}
              promotingFactorOptions={["A", "B", "C", "D"]}
            />

            {/* 軀幹旋轉 */}
            <tr className="bg-stark-bg/30">
              <td colSpan={4} className="p-2 border-b border-stark-border">
                <span className="font-medium text-stark-text">軀幹旋轉</span>
                <span className="text-xs text-muted-foreground ml-2">External Rotation</span>
              </td>
            </tr>
            <MovementRow
              label="左轉"
              item={functionalMovement.trunkRotationLeft}
              onChange={(item) => updateFunctionalMovement({ trunkRotationLeft: item })}
              promotingFactorOptions={["A", "B", "C", "D"]}
            />
            <MovementRow
              label="右轉"
              item={functionalMovement.trunkRotationRight}
              onChange={(item) => updateFunctionalMovement({ trunkRotationRight: item })}
              promotingFactorOptions={["A", "B", "C", "D"]}
            />

            {/* 單腳站 */}
            <tr className="bg-stark-bg/30">
              <td colSpan={4} className="p-2 border-b border-stark-border">
                <span className="font-medium text-stark-text">單腳站</span>
              </td>
            </tr>
            <MovementRow
              label="左腳"
              item={functionalMovement.singleLegStandLeft}
              onChange={(item) => updateFunctionalMovement({ singleLegStandLeft: item })}
              promotingFactorOptions={[]}
            />
            <MovementRow
              label="右腳"
              item={functionalMovement.singleLegStandRight}
              onChange={(item) => updateFunctionalMovement({ singleLegStandRight: item })}
              promotingFactorOptions={[]}
            />

            {/* 雙手高舉深蹲 */}
            <tr className="bg-stark-bg/30">
              <td colSpan={4} className="p-2 border-b border-stark-border">
                <span className="font-medium text-stark-text">雙手高舉深蹲</span>
              </td>
            </tr>
            <MovementRow
              label="深蹲"
              item={functionalMovement.overheadSquat}
              onChange={(item) => updateFunctionalMovement({ overheadSquat: item })}
              promotingFactorOptions={[]}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
