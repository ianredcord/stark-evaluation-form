import { cn } from "@/lib/utils";
import { Checkbox, RatingSelect, NumberInput } from "@/components/FormFields";
import { RedcordItem, RedcordCoreItem, RedcordCervicalItem } from "../../../shared/evaluation";

// 標準紅繩項目行（下肢、上肢）
interface RedcordItemRowProps {
  label: string;
  subLabel?: string;
  item: RedcordItem;
  onChange: (item: RedcordItem) => void;
}

export function RedcordItemRow({
  label,
  subLabel,
  item,
  onChange,
}: RedcordItemRowProps) {
  return (
    <>
      {/* 右側 R */}
      <tr className="border-b border-stark-border/50">
        <td rowSpan={2} className="p-2 bg-white border-r border-stark-border align-middle">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={item.checked}
              onChange={(checked) => onChange({ ...item, checked })}
            />
            <div>
              <div className="font-medium text-stark-text text-sm">{label}</div>
              {subLabel && (
                <div className="text-xs text-muted-foreground">{subLabel}</div>
              )}
            </div>
          </div>
        </td>
        <td className="p-1 bg-white border-r border-stark-border text-center w-8">
          <span className="text-xs font-medium">R</span>
        </td>
        <td className="p-1 bg-white border-r border-stark-border">
          <RatingSelect
            options={["0", "1", "2", "3"]}
            value={item.scoreR}
            onChange={(value) => onChange({ ...item, scoreR: value })}
            size="sm"
          />
        </td>
        <td rowSpan={2} className="p-1 bg-white border-r border-stark-border">
          <RatingSelect
            options={["1", "2", "3", "4", "5", "6", "AXIS", "Stimula"]}
            value={item.workload}
            onChange={(value) => onChange({ ...item, workload: value })}
            size="sm"
          />
        </td>
        <td rowSpan={2} className="p-1 bg-white">
          <div className="flex items-center gap-1 justify-center">
            <input
              type="number"
              value={item.reps || ""}
              onChange={(e) => onChange({ ...item, reps: Number(e.target.value) || 0 })}
              className="stark-input w-12 text-center text-sm"
              placeholder="次"
              min={0}
            />
            <span className="text-xs text-muted-foreground">X</span>
            <input
              type="number"
              value={item.sets || ""}
              onChange={(e) => onChange({ ...item, sets: Number(e.target.value) || 0 })}
              className="stark-input w-12 text-center text-sm"
              placeholder="組"
              min={0}
            />
          </div>
        </td>
      </tr>
      {/* 左側 L */}
      <tr className="border-b border-stark-border">
        <td className="p-1 bg-white border-r border-stark-border text-center w-8">
          <span className="text-xs font-medium">L</span>
        </td>
        <td className="p-1 bg-white border-r border-stark-border">
          <RatingSelect
            options={["0", "1", "2", "3"]}
            value={item.scoreL}
            onChange={(value) => onChange({ ...item, scoreL: value })}
            size="sm"
          />
        </td>
      </tr>
    </>
  );
}

// 核心項目行（SLS、PLS、KLS）
interface RedcordCoreRowProps {
  label: string;
  item: RedcordCoreItem;
  onChange: (item: RedcordCoreItem) => void;
  showPelvicFloor?: boolean;
  pelvicFloorStimula?: boolean;
  onPelvicFloorChange?: (checked: boolean) => void;
}

export function RedcordCoreRow({
  label,
  item,
  onChange,
  showPelvicFloor = false,
  pelvicFloorStimula = false,
  onPelvicFloorChange,
}: RedcordCoreRowProps) {
  return (
    <tr className="border-b border-stark-border">
      <td className="p-2 bg-white border-r border-stark-border">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={item.checked}
            onChange={(checked) => onChange({ ...item, checked })}
          />
          <span className="font-medium text-stark-text text-sm">{label}</span>
        </div>
      </td>
      <td colSpan={2} className="p-1 bg-white border-r border-stark-border">
        <Checkbox
          label="Pain"
          checked={item.pain}
          onChange={(checked) => onChange({ ...item, pain: checked })}
        />
      </td>
      <td className="p-1 bg-white border-r border-stark-border">
        {showPelvicFloor ? (
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">呼吸/骨盆底肌教學</div>
            <Checkbox
              label="Stimula"
              checked={pelvicFloorStimula}
              onChange={onPelvicFloorChange}
            />
          </div>
        ) : null}
      </td>
      <td className="p-1 bg-white">
        <div className="flex items-center gap-1 justify-center">
          <input
            type="number"
            value={item.seconds || ""}
            onChange={(e) => onChange({ ...item, seconds: Number(e.target.value) || 0 })}
            className="stark-input w-12 text-center text-sm"
            placeholder="秒"
            min={0}
          />
          <span className="text-xs text-muted-foreground">秒 X</span>
          <input
            type="number"
            value={item.reps || ""}
            onChange={(e) => onChange({ ...item, reps: Number(e.target.value) || 0 })}
            className="stark-input w-12 text-center text-sm"
            placeholder="次"
            min={0}
          />
        </div>
      </td>
    </tr>
  );
}

// 頸部項目行
interface RedcordCervicalRowProps {
  label: string;
  item: RedcordCervicalItem;
  onChange: (item: RedcordCervicalItem) => void;
}

export function RedcordCervicalRow({
  label,
  item,
  onChange,
}: RedcordCervicalRowProps) {
  return (
    <tr className="border-b border-stark-border">
      <td className="p-2 bg-white border-r border-stark-border">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={item.checked}
            onChange={(checked) => onChange({ ...item, checked })}
          />
          <span className="font-medium text-stark-text text-sm">{label}</span>
        </div>
      </td>
      <td colSpan={2} className="p-1 bg-white border-r border-stark-border">
        <Checkbox
          label="Pain"
          checked={item.pain}
          onChange={(checked) => onChange({ ...item, pain: checked })}
        />
      </td>
      <td className="p-1 bg-white border-r border-stark-border">
        <Checkbox
          label="Stimula"
          checked={item.stimula}
          onChange={(checked) => onChange({ ...item, stimula: checked })}
        />
      </td>
      <td className="p-1 bg-white">
        <input
          type="text"
          value={item.value}
          onChange={(e) => onChange({ ...item, value: e.target.value })}
          className="stark-input w-full text-center text-sm"
          placeholder="數值"
        />
      </td>
    </tr>
  );
}

// 區塊標題
interface SectionHeaderProps {
  title: string;
  colSpan?: number;
}

export function SectionHeader({ title, colSpan = 5 }: SectionHeaderProps) {
  return (
    <tr className="bg-amber-50">
      <td
        colSpan={colSpan}
        className="p-2 border-b border-stark-border font-medium text-stark-orange"
      >
        {title}
      </td>
    </tr>
  );
}
