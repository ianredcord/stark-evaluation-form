// 簡化人體圖 — 前/側/背三視圖,在問題部位標紅點
// 不使用 3D 或外部圖庫,純 SVG;紅點位置由失衡項目對應決定。

import { MotiRiskKey } from "../../../../shared/evaluation";

export type BodyView = "front" | "side" | "back";

interface BodyMarker {
  view: BodyView;
  // 相對座標:0-100 對應 SVG viewBox 100x200
  x: number;
  y: number;
}

// 將 12 項失衡映射到人體圖標記位置(可能對應多個視圖)
export const BODY_MARKERS: Record<MotiRiskKey, BodyMarker[]> = {
  // 膝部 HKA(右/左)
  hkaRight: [{ view: "front", x: 60, y: 145 }],
  hkaLeft: [{ view: "front", x: 40, y: 145 }],
  // 肩膀高度差(雙肩)
  shoulderDiff: [
    { view: "front", x: 32, y: 50 },
    { view: "front", x: 68, y: 50 },
    { view: "back", x: 32, y: 50 },
    { view: "back", x: 68, y: 50 },
  ],
  // 圓肩(肩前)
  roundShoulder: [
    { view: "front", x: 35, y: 55 },
    { view: "front", x: 65, y: 55 },
    { view: "side", x: 50, y: 55 },
  ],
  // 腰椎前凸(側面下背)
  lumbarLordosis: [{ view: "side", x: 55, y: 110 }],
  // 胸椎後凸(側面上背)
  thoracicKyphosis: [{ view: "side", x: 45, y: 75 }],
  // 脊椎側彎(背面中軸)
  scoliosis: [{ view: "back", x: 50, y: 95 }],
  // 膝關節屈曲(側面膝)
  kneeFlexion: [{ view: "side", x: 50, y: 145 }],
  // 骨盆旋轉/傾斜/前傾
  pelvisRotation: [{ view: "back", x: 50, y: 115 }],
  pelvisTilt: [{ view: "back", x: 50, y: 115 }],
  pelvisAnterior: [{ view: "side", x: 55, y: 105 }],
  // 頭部姿勢(側面頸)
  headPosture: [{ view: "side", x: 50, y: 25 }],
};

interface BodyMapProps {
  view: BodyView;
  warnKeys: MotiRiskKey[];
  dangerKeys: MotiRiskKey[];
  size?: number;
  onMarkerClick?: (key: MotiRiskKey) => void;
}

export function BodyMap({
  view,
  warnKeys,
  dangerKeys,
  size = 140,
  onMarkerClick,
}: BodyMapProps) {
  const markers: Array<{ key: MotiRiskKey; m: BodyMarker; level: "warn" | "danger" }> = [];
  dangerKeys.forEach((k) => {
    BODY_MARKERS[k]?.forEach((m) => {
      if (m.view === view) markers.push({ key: k, m, level: "danger" });
    });
  });
  warnKeys.forEach((k) => {
    BODY_MARKERS[k]?.forEach((m) => {
      if (m.view === view) markers.push({ key: k, m, level: "warn" });
    });
  });

  return (
    <svg
      viewBox="0 0 100 200"
      width={size}
      height={size * 2}
      className="select-none"
    >
      {view === "front" && <FrontBody />}
      {view === "side" && <SideBody />}
      {view === "back" && <BackBody />}

      {markers.map(({ key, m, level }, idx) => (
        <g
          key={`${key}-${idx}`}
          className={onMarkerClick ? "cursor-pointer" : ""}
          onClick={() => onMarkerClick?.(key)}
        >
          <circle
            cx={m.x}
            cy={m.y}
            r={4}
            fill={level === "danger" ? "#ef4444" : "#f59e0b"}
            opacity={0.3}
          >
            <animate
              attributeName="r"
              from="4"
              to="8"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="0.5"
              to="0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={m.x}
            cy={m.y}
            r={3}
            fill={level === "danger" ? "#ef4444" : "#f59e0b"}
            stroke="white"
            strokeWidth={1}
          />
        </g>
      ))}
    </svg>
  );
}

const BODY_STROKE = "currentColor";
const BODY_FILL = "rgba(0,0,0,0.04)";

function FrontBody() {
  return (
    <g stroke={BODY_STROKE} strokeWidth="0.8" fill={BODY_FILL} className="text-stark-text">
      {/* 頭 */}
      <circle cx="50" cy="18" r="9" />
      {/* 頸 */}
      <rect x="46" y="26" width="8" height="6" />
      {/* 軀幹 */}
      <path d="M30,45 Q30,38 38,33 L62,33 Q70,38 70,45 L67,95 Q65,105 60,108 L40,108 Q35,105 33,95 Z" />
      {/* 雙臂 */}
      <path d="M30,45 Q22,55 20,75 Q18,95 22,115" fill="none" />
      <path d="M70,45 Q78,55 80,75 Q82,95 78,115" fill="none" />
      {/* 手 */}
      <circle cx="22" cy="118" r="3" />
      <circle cx="78" cy="118" r="3" />
      {/* 雙腿 */}
      <path d="M42,108 L40,160 L38,185" fill="none" />
      <path d="M58,108 L60,160 L62,185" fill="none" />
      {/* 腳 */}
      <ellipse cx="38" cy="187" rx="4" ry="2" />
      <ellipse cx="62" cy="187" rx="4" ry="2" />
    </g>
  );
}

function SideBody() {
  return (
    <g stroke={BODY_STROKE} strokeWidth="0.8" fill={BODY_FILL} className="text-stark-text">
      {/* 頭 */}
      <circle cx="50" cy="18" r="9" />
      {/* 頸(略前移代表 forward head) */}
      <path d="M50,27 Q52,30 50,33" fill="none" />
      {/* 軀幹側面 — S 形含腰前凸與胸後凸 */}
      <path d="M44,33 Q40,55 48,75 Q52,95 50,108 Q48,118 52,125 L60,125 Q58,118 56,108 Q60,90 56,70 Q54,50 56,33 Z" />
      {/* 手臂(側) */}
      <path d="M52,38 Q50,55 50,80 Q50,100 52,115" fill="none" />
      <circle cx="52" cy="118" r="3" />
      {/* 腿 */}
      <path d="M52,125 Q50,150 50,170 L52,185" fill="none" />
      <ellipse cx="55" cy="187" rx="6" ry="2" />
    </g>
  );
}

function BackBody() {
  return (
    <g stroke={BODY_STROKE} strokeWidth="0.8" fill={BODY_FILL} className="text-stark-text">
      {/* 頭 */}
      <circle cx="50" cy="18" r="9" />
      {/* 頸 */}
      <rect x="46" y="26" width="8" height="6" />
      {/* 軀幹 */}
      <path d="M30,45 Q30,38 38,33 L62,33 Q70,38 70,45 L67,95 Q65,105 60,108 L40,108 Q35,105 33,95 Z" />
      {/* 脊柱中軸 */}
      <line x1="50" y1="35" x2="50" y2="108" strokeDasharray="2,2" />
      {/* 雙臂 */}
      <path d="M30,45 Q22,55 20,75 Q18,95 22,115" fill="none" />
      <path d="M70,45 Q78,55 80,75 Q82,95 78,115" fill="none" />
      <circle cx="22" cy="118" r="3" />
      <circle cx="78" cy="118" r="3" />
      {/* 腿 */}
      <path d="M42,108 L40,160 L38,185" fill="none" />
      <path d="M58,108 L60,160 L62,185" fill="none" />
      <ellipse cx="38" cy="187" rx="4" ry="2" />
      <ellipse cx="62" cy="187" rx="4" ry="2" />
    </g>
  );
}
