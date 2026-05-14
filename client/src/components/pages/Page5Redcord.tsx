import { useEvaluationForm } from "@/contexts/EvaluationFormContext";
import {
  RedcordItemRow,
  RedcordCoreRow,
  RedcordCervicalRow,
  SectionHeader,
} from "@/components/RedcordTable";
import { SectionTitle, TextInput } from "@/components/FormFields";

export function Page5Redcord() {
  const { formData, updateRedcord } = useEvaluationForm();
  const { redcord } = formData;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <SectionTitle>紅 繩 動 力 鍊 檢 測</SectionTitle>
      </div>

      {/* 訓練側設定 */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stark-text">訓練側：</span>
          <TextInput
            label=""
            value={redcord.trainingSide}
            onChange={(e) => updateRedcord({ trainingSide: e.target.value })}
            placeholder="次 x 組"
            className="w-32"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-stark-border rounded-lg overflow-hidden text-sm">
          <thead>
            <tr className="bg-stark-bg">
              <th className="p-2 text-left font-medium text-stark-text border-r border-stark-border w-48">
                Redcord 懸吊訓練
              </th>
              <th className="p-2 text-center font-medium text-stark-text border-r border-stark-border w-8">
                
              </th>
              <th className="p-2 text-center font-medium text-stark-text border-r border-stark-border w-32">
                評分
              </th>
              <th className="p-2 text-center font-medium text-stark-text border-r border-stark-border w-40">
                6 Work load/ 其他配件
              </th>
              <th className="p-2 text-center font-medium text-stark-text w-32">
                訓練側
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 下肢 */}
            <SectionHeader title="下肢" />
            <RedcordItemRow
              label="SPL"
              subLabel="臀大肌"
              item={redcord.spl}
              onChange={(item) => updateRedcord({ spl: item })}
            />
            <RedcordItemRow
              label="SB"
              subLabel="腿後腱肌群"
              item={redcord.sb}
              onChange={(item) => updateRedcord({ sb: item })}
            />
            <RedcordItemRow
              label="ABD"
              subLabel="臀中肌"
              item={redcord.abd}
              onChange={(item) => updateRedcord({ abd: item })}
            />
            <RedcordItemRow
              label="ADD"
              subLabel="內收肌群"
              item={redcord.add}
              onChange={(item) => updateRedcord({ add: item })}
            />
            <RedcordItemRow
              label="PB"
              subLabel="腹部肌群"
              item={redcord.pb}
              onChange={(item) => updateRedcord({ pb: item })}
            />
            <RedcordItemRow
              label="SKF"
              subLabel="腿後腱肌群"
              item={redcord.skf}
              onChange={(item) => updateRedcord({ skf: item })}
            />
            <RedcordItemRow
              label="PHF"
              subLabel="腰大肌"
              item={redcord.phf}
              onChange={(item) => updateRedcord({ phf: item })}
            />

            {/* 核心 */}
            <SectionHeader title="核心" />
            <RedcordCoreRow
              label="SLS"
              item={redcord.sls}
              onChange={(item) => updateRedcord({ sls: item })}
            />
            <RedcordCoreRow
              label="PLS"
              item={redcord.pls}
              onChange={(item) => updateRedcord({ pls: item })}
              showPelvicFloor
              pelvicFloorStimula={redcord.pelvicFloorStimula}
              onPelvicFloorChange={(checked) => updateRedcord({ pelvicFloorStimula: checked })}
            />
            <RedcordCoreRow
              label="KLS"
              item={redcord.kls}
              onChange={(item) => updateRedcord({ kls: item })}
            />

            {/* 上肢 */}
            <SectionHeader title="上肢" />
            <RedcordItemRow
              label="Scapular Depression"
              subLabel="下斜方肌"
              item={redcord.scapularDepression}
              onChange={(item) => updateRedcord({ scapularDepression: item })}
            />
            <RedcordItemRow
              label="Scapular Protraction"
              subLabel="前鋸肌"
              item={redcord.scapularProtraction}
              onChange={(item) => updateRedcord({ scapularProtraction: item })}
            />
            <RedcordItemRow
              label="Scapular Retraction"
              subLabel="菱形肌"
              item={redcord.scapularRetraction}
              onChange={(item) => updateRedcord({ scapularRetraction: item })}
            />
            <RedcordItemRow
              label="Shoulder Extension"
              subLabel="闊背肌"
              item={redcord.shoulderExtension}
              onChange={(item) => updateRedcord({ shoulderExtension: item })}
            />
            <RedcordItemRow
              label="Push up"
              subLabel="胸大肌/肱三頭肌"
              item={redcord.pushUp}
              onChange={(item) => updateRedcord({ pushUp: item })}
            />
            <RedcordItemRow
              label="Pull up"
              subLabel="後三角肌/二頭肌"
              item={redcord.pullUp}
              onChange={(item) => updateRedcord({ pullUp: item })}
            />

            {/* 頸部 */}
            <SectionHeader title="頸部" />
            <RedcordCervicalRow
              label="Cervical setting"
              item={redcord.cervicalSetting}
              onChange={(item) => updateRedcord({ cervicalSetting: item })}
            />
            <RedcordCervicalRow
              label="Cervical Retraction"
              item={redcord.cervicalRetraction}
              onChange={(item) => updateRedcord({ cervicalRetraction: item })}
            />
            <RedcordCervicalRow
              label="Cervical Rotation"
              item={redcord.cervicalRotation}
              onChange={(item) => updateRedcord({ cervicalRotation: item })}
            />
            <RedcordCervicalRow
              label="Cervical Extension"
              item={redcord.cervicalExtension}
              onChange={(item) => updateRedcord({ cervicalExtension: item })}
            />
            <RedcordCervicalRow
              label="Cervical Sidebending"
              item={redcord.cervicalSidebending}
              onChange={(item) => updateRedcord({ cervicalSidebending: item })}
            />

            {/* 其他動作 */}
            <SectionHeader title="其他動作" />
            <tr className="border-b border-stark-border">
              <td className="p-2 bg-white border-r border-stark-border">
                <input
                  type="text"
                  value={redcord.otherMovement.name}
                  onChange={(e) =>
                    updateRedcord({
                      otherMovement: { ...redcord.otherMovement, name: e.target.value },
                    })
                  }
                  className="stark-input w-full text-sm"
                  placeholder="動作名稱"
                />
              </td>
              <td colSpan={2} className="p-1 bg-white border-r border-stark-border">
                <input
                  type="text"
                  value={redcord.otherMovement.score}
                  onChange={(e) =>
                    updateRedcord({
                      otherMovement: { ...redcord.otherMovement, score: e.target.value },
                    })
                  }
                  className="stark-input w-full text-center text-sm"
                  placeholder="評分"
                />
              </td>
              <td className="p-1 bg-white border-r border-stark-border">
                <input
                  type="text"
                  value={redcord.otherMovement.workload}
                  onChange={(e) =>
                    updateRedcord({
                      otherMovement: { ...redcord.otherMovement, workload: e.target.value },
                    })
                  }
                  className="stark-input w-full text-center text-sm"
                  placeholder="配件"
                />
              </td>
              <td className="p-1 bg-white">
                <input
                  type="text"
                  value={redcord.otherMovement.value}
                  onChange={(e) =>
                    updateRedcord({
                      otherMovement: { ...redcord.otherMovement, value: e.target.value },
                    })
                  }
                  className="stark-input w-full text-center text-sm"
                  placeholder="數值"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
