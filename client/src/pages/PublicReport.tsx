// 客戶端公開報告頁 — /report/:shareCode
// 無需登入,僅以 shareCode 取得部分評估資料,行動裝置優先設計

import { useParams } from "wouter";
import { Loader2, AlertCircle, Printer } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { RiskRing } from "@/components/PublicReport/RiskRing";
import { ImbalanceCard } from "@/components/PublicReport/ImbalanceCard";
import { PrescriptionTabs } from "@/components/PublicReport/PrescriptionTabs";
import { BodyMap } from "@/components/PublicReport/BodyMap";
import {
  MOTI_THRESHOLDS,
  MotiRiskKey,
  MotiRiskValues,
  defaultMotiRiskValues,
  PrescriptionSelection,
} from "../../../shared/evaluation";

export default function PublicReport() {
  const params = useParams<{ shareCode: string }>();
  const shareCode = params.shareCode ?? "";

  const { data, isLoading, error } = trpc.report.getByShareCode.useQuery(
    { shareCode },
    { enabled: !!shareCode, retry: false },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stark-bg">
        <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stark-bg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-stark-orange mb-3" />
        <h1 className="text-xl font-bold text-stark-text mb-2">
          找不到這份報告
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          連結可能已失效或輸入錯誤,請向您的治療師確認分享連結。
        </p>
      </div>
    );
  }

  const motiRiskValues: MotiRiskValues =
    (data.motiRiskValues as MotiRiskValues) ?? defaultMotiRiskValues;
  const prescriptions: PrescriptionSelection[] =
    (data.prescriptions as PrescriptionSelection[]) ?? [];

  // 分類失衡項目
  const allKeys = Object.keys(MOTI_THRESHOLDS) as MotiRiskKey[];
  const dangerKeys = allKeys.filter((k) => motiRiskValues[k]?.level === "danger");
  const warnKeys = allKeys.filter((k) => motiRiskValues[k]?.level === "warn");
  const maintainKeys = allKeys.filter(
    (k) => motiRiskValues[k]?.level === "maintain",
  );

  return (
    <div className="min-h-screen bg-stark-bg print:bg-white">
      {/* 列印用全域樣式 */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .print-page-break { page-break-before: always; }
          /* 卡片邊框淡化、避免列印過重 */
          .print-soft-border { border-color: #ddd !important; box-shadow: none !important; }
          /* 環形圖等 SVG 容器避免被切 */
          svg { page-break-inside: avoid; }
        }
      `}</style>
      {/* Header — 行動優先 */}
      <header className="bg-white border-b-2 border-stark-border no-print">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <img
            src="/stark-logo.webp"
            alt="史塔克 STARK WORKS"
            className="h-10 w-auto"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-stark-border bg-white text-stark-text text-xs hover:bg-stark-bg transition-colors"
              title="列印或儲存為 PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印</span>
            </button>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Personal Report
              </div>
              <div className="text-xs text-stark-text font-medium">
                {data.date ?? ""}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 列印用 header(畫面隱藏) */}
      <div className="hidden print:flex print:items-center print:justify-between print:mb-4 print:pb-3 print:border-b print:border-stark-border">
        <img src="/stark-logo.webp" alt="史塔克" className="h-10 w-auto" />
        <div className="text-right text-sm text-stark-text">
          <div className="font-semibold">客戶評估報告</div>
          <div className="text-xs text-muted-foreground">{data.date ?? ""}</div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Hero */}
        <section className="bg-white rounded-2xl border-2 border-stark-border p-6 text-center space-y-3">
          <div className="text-xs text-stark-orange font-semibold tracking-widest">
            您的體態評估報告
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stark-text">
            {data.clientName ? `${data.clientName} 您好` : "您好"}
          </h1>
          <div className="flex justify-center pt-2">
            <RiskRing value={motiRiskValues.overallRiskIndex} />
          </div>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            以下為 Moti Physio 3D 姿勢檢測產出的 12 項風險評估,
            建議參考下方個人化處方並與治療師討論。
          </p>
          {/* Counters */}
          <div className="flex justify-center gap-4 pt-2">
            <Counter count={dangerKeys.length} label="危險" color="text-red-600" />
            <Counter count={warnKeys.length} label="警惕" color="text-amber-600" />
            <Counter
              count={maintainKeys.length}
              label="維持"
              color="text-green-600"
            />
          </div>
        </section>

        {/* Body map */}
        {(dangerKeys.length > 0 || warnKeys.length > 0) && (
          <section className="bg-white rounded-2xl border-2 border-stark-border p-5">
            <h2 className="text-base font-bold text-stark-text mb-3 text-center">
              失衡部位示意圖
            </h2>
            <div className="flex justify-center gap-4 flex-wrap">
              {(["front", "side", "back"] as const).map((view) => (
                <div key={view} className="flex flex-col items-center">
                  <BodyMap
                    view={view}
                    warnKeys={warnKeys}
                    dangerKeys={dangerKeys}
                    size={90}
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {view === "front" ? "正面" : view === "side" ? "側面" : "背面"}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                危險
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                警惕
              </span>
            </div>
          </section>
        )}

        {/* 12 項失衡 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stark-text px-1">
            Moti 12 項姿勢風險
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allKeys.map((k) => (
              <ImbalanceCard
                key={k}
                itemKey={k}
                item={motiRiskValues[k]}
                highlight={
                  motiRiskValues[k]?.level === "warn" ||
                  motiRiskValues[k]?.level === "danger"
                }
              />
            ))}
          </div>
        </section>

        {/* 處方建議 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stark-text px-1">
            您的個人化處方
          </h2>
          <PrescriptionTabs prescriptions={prescriptions} />
        </section>

        {/* Footer */}
        <footer className="text-center text-[10px] text-muted-foreground py-6">
          <div>
            Powered by{" "}
            <span className="font-semibold text-stark-orange">
              Stark Evaluation
            </span>
          </div>
          <div className="mt-1">
            本報告僅供參考,如需進一步評估請洽史塔克診所專業治療師。
          </div>
        </footer>
      </main>
    </div>
  );
}

function Counter({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color}`}>{count}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
