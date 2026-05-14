import { cn } from "@/lib/utils";
import { RatingSelect, TextArea } from "@/components/FormFields";
import { FunctionalMovementItem } from "../../../shared/evaluation";

interface MovementRowProps {
  label: string;
  subLabel?: string;
  imageUrl?: string;
  item: FunctionalMovementItem;
  onChange: (item: FunctionalMovementItem) => void;
  promotingFactorOptions?: string[];
}

export function MovementRow({
  label,
  subLabel,
  imageUrl,
  item,
  onChange,
  promotingFactorOptions = ["A", "B", "C", "D", "E"],
}: MovementRowProps) {
  return (
    <tr className="border-b border-stark-border">
      {/* 動作名稱與圖片 */}
      <td className="p-3 bg-white border-r border-stark-border">
        <div className="flex flex-col items-center gap-2">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={label}
              className="w-20 h-20 object-contain"
            />
          )}
          <div className="text-center">
            <div className="font-medium text-stark-text text-sm">{label}</div>
            {subLabel && (
              <div className="text-xs text-muted-foreground">{subLabel}</div>
            )}
          </div>
        </div>
      </td>

      {/* 表現/疼痛 */}
      <td className="p-3 bg-white border-r border-stark-border">
        <input
          type="text"
          value={item.performance}
          onChange={(e) => onChange({ ...item, performance: e.target.value })}
          className="stark-input w-full text-sm"
          placeholder="表現/疼痛"
        />
      </td>

      {/* 促進因素 */}
      <td className="p-3 bg-white border-r border-stark-border">
        <RatingSelect
          options={promotingFactorOptions}
          value={item.promotingFactor}
          onChange={(value) => onChange({ ...item, promotingFactor: value })}
          size="sm"
        />
      </td>

      {/* 狀況 */}
      <td className="p-3 bg-white">
        <textarea
          value={item.condition}
          onChange={(e) => onChange({ ...item, condition: e.target.value })}
          className="stark-input w-full text-sm resize-none"
          rows={2}
          placeholder="狀況描述"
        />
      </td>
    </tr>
  );
}

interface FunctionalMovementTableProps {
  title: string;
  children: React.ReactNode;
}

export function FunctionalMovementTable({
  title,
  children,
}: FunctionalMovementTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="inline-block px-6 py-2 border-2 border-stark-border rounded-lg bg-white">
          <h2 className="stark-section-title">{title}</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-stark-border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-stark-bg">
              <th className="p-3 text-center font-medium text-stark-text border-r border-stark-border w-40">
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
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

// 動作分組標題行
interface MovementGroupHeaderProps {
  title: string;
  imageUrl?: string;
  colSpan?: number;
}

export function MovementGroupHeader({
  title,
  imageUrl,
  colSpan = 4,
}: MovementGroupHeaderProps) {
  return (
    <tr className="bg-stark-bg/50">
      <td
        colSpan={colSpan}
        className="p-2 border-b border-stark-border"
      >
        <div className="flex items-center gap-3">
          {imageUrl && (
            <img src={imageUrl} alt={title} className="w-16 h-16 object-contain" />
          )}
          <span className="font-medium text-stark-text">{title}</span>
        </div>
      </td>
    </tr>
  );
}

// 雙側動作行（左/右）
interface DualSideMovementRowProps {
  label: string;
  imageUrl?: string;
  leftItem: FunctionalMovementItem;
  rightItem: FunctionalMovementItem;
  onLeftChange: (item: FunctionalMovementItem) => void;
  onRightChange: (item: FunctionalMovementItem) => void;
  promotingFactorOptions?: string[];
}

export function DualSideMovementRow({
  label,
  imageUrl,
  leftItem,
  rightItem,
  onLeftChange,
  onRightChange,
  promotingFactorOptions = ["A", "B", "C", "D", "E"],
}: DualSideMovementRowProps) {
  return (
    <>
      {/* 左側 */}
      <tr className="border-b border-stark-border/50">
        <td
          rowSpan={2}
          className="p-3 bg-white border-r border-stark-border align-middle"
        >
          <div className="flex flex-col items-center gap-2">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={label}
                className="w-20 h-20 object-contain"
              />
            )}
            <div className="font-medium text-stark-text text-sm text-center">
              {label}
            </div>
          </div>
        </td>
        <td className="p-2 bg-white border-r border-stark-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground w-8">左</span>
            <input
              type="text"
              value={leftItem.performance}
              onChange={(e) => onLeftChange({ ...leftItem, performance: e.target.value })}
              className="stark-input flex-1 text-sm"
              placeholder="表現/疼痛"
            />
          </div>
        </td>
        <td className="p-2 bg-white border-r border-stark-border">
          <RatingSelect
            options={promotingFactorOptions}
            value={leftItem.promotingFactor}
            onChange={(value) => onLeftChange({ ...leftItem, promotingFactor: value })}
            size="sm"
          />
        </td>
        <td className="p-2 bg-white">
          <textarea
            value={leftItem.condition}
            onChange={(e) => onLeftChange({ ...leftItem, condition: e.target.value })}
            className="stark-input w-full text-sm resize-none"
            rows={1}
            placeholder="狀況"
          />
        </td>
      </tr>
      {/* 右側 */}
      <tr className="border-b border-stark-border">
        <td className="p-2 bg-white border-r border-stark-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground w-8">右</span>
            <input
              type="text"
              value={rightItem.performance}
              onChange={(e) => onRightChange({ ...rightItem, performance: e.target.value })}
              className="stark-input flex-1 text-sm"
              placeholder="表現/疼痛"
            />
          </div>
        </td>
        <td className="p-2 bg-white border-r border-stark-border">
          <RatingSelect
            options={promotingFactorOptions}
            value={rightItem.promotingFactor}
            onChange={(value) => onRightChange({ ...rightItem, promotingFactor: value })}
            size="sm"
          />
        </td>
        <td className="p-2 bg-white">
          <textarea
            value={rightItem.condition}
            onChange={(e) => onRightChange({ ...rightItem, condition: e.target.value })}
            className="stark-input w-full text-sm resize-none"
            rows={1}
            placeholder="狀況"
          />
        </td>
      </tr>
    </>
  );
}
