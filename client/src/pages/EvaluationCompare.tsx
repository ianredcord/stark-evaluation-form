// 評估比較頁 — 並排顯示同客戶兩份評估的差異(進步幅度視覺化)

import { useParams, useLocation, Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  GitCompare,
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  User,
} from "lucide-react";
import {
  MOTI_THRESHOLDS,
  type MotiRiskKey,
  type MotiRiskValues,
} from "@shared/evaluation";

export default function EvaluationCompare() {
  const params = useParams<{ id: string }>();
  const targetId = parseInt(params.id, 10);
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: target, isLoading: loadingTarget } =
    trpc.evaluation.get.useQuery(
      { id: targetId },
      { enabled: isAuthenticated && !Number.isNaN(targetId) },
    );

  const clientName = target?.clientName || "";

  const { data: history, isLoading: loadingHistory } =
    trpc.clients.history.useQuery(
      { name: clientName },
      { enabled: isAuthenticated && !!clientName },
    );

  // 預設挑選:右 = 目前 evaluation,左 = 同客戶歷史中比 target 早的最新一筆
  const targetCreatedAt = target?.createdAt ? new Date(target.createdAt) : null;
  const olderCandidates = useMemo(() => {
    if (!history || !targetCreatedAt) return [];
    return history.filter(
      (h) => h.id !== targetId && new Date(h.createdAt) < targetCreatedAt,
    );
  }, [history, targetId, targetCreatedAt]);

  const [olderId, setOlderId] = useState<number | null>(null);

  useEffect(() => {
    if (olderId === null && olderCandidates.length > 0) {
      setOlderId(olderCandidates[0].id);
    }
  }, [olderCandidates, olderId]);

  const { data: older, isLoading: loadingOlder } =
    trpc.evaluation.get.useQuery(
      { id: olderId ?? 0 },
      { enabled: isAuthenticated && olderId !== null },
    );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">請先登入</p>
            <Button asChild>
              <a href={getLoginUrl()}>登入</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = loadingTarget || loadingHistory;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => {
              if (clientName) {
                setLocation(`/clients/${encodeURIComponent(clientName)}`);
              } else {
                setLocation(`/evaluation/${targetId}`);
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold text-stark-text">
            <GitCompare className="w-4 h-4 text-stark-orange" />
            評估比較
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {isLoading || !target ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-stark-text flex items-center gap-2">
                <User className="w-5 h-5 text-stark-orange" />
                {clientName || "未命名客戶"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                並排查看評估差異 — 數值愈低代表愈接近正常
              </p>
            </div>

            {olderCandidates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <GitCompare className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold text-stark-text mb-2">
                    尚無可比較的評估
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    比較功能需要至少 2 份同客戶的評估,目前只有這 1 份。
                    <br />
                    請先建立第 2 份評估再回來。
                  </p>
                  <Link href="/evaluation/new">
                    <Button className="bg-stark-orange hover:bg-stark-orange-dark text-white">
                      建立新評估
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 切換較舊評估 */}
                <Card className="mb-4">
                  <CardContent className="pt-4 pb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      選擇要比較的較早評估:
                    </label>
                    <select
                      value={olderId ?? ""}
                      onChange={(e) => setOlderId(parseInt(e.target.value, 10))}
                      className="w-full p-2 border-2 border-stark-border rounded-lg text-sm bg-white"
                    >
                      {olderCandidates.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.date || "未填日期"} —{" "}
                          {new Date(h.createdAt).toLocaleDateString("zh-TW")}
                        </option>
                      ))}
                    </select>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3 mb-4 sticky top-[57px] z-[5] bg-background py-2">
                  <ColumnHeader
                    label="較早"
                    date={older?.date ?? null}
                    createdAt={older?.createdAt ?? null}
                  />
                  <ColumnHeader
                    label="較新"
                    isLatest
                    date={target.date ?? null}
                    createdAt={target.createdAt ?? null}
                  />
                </div>

                {loadingOlder || !older ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-stark-orange" />
                  </div>
                ) : (
                  <CompareBody older={older} newer={target} />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ColumnHeader({
  label,
  date,
  createdAt,
  isLatest,
}: {
  label: string;
  date: string | null;
  createdAt: Date | string | null;
  isLatest?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border-2 p-3 ${
        isLatest
          ? "bg-stark-orange/5 border-stark-orange"
          : "bg-white border-stark-border"
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {isLatest && (
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stark-orange text-white">
            最新
          </span>
        )}
        {label}
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold text-stark-text mt-0.5">
        <Calendar className="w-3 h-3 text-stark-orange" />
        {date || "—"}
      </div>
      {createdAt && (
        <div className="text-[10px] text-muted-foreground">
          {new Date(createdAt).toLocaleDateString("zh-TW")}
        </div>
      )}
    </div>
  );
}

type CompareRow = {
  motiRiskValues: unknown;
  functionalMovement: unknown;
  redcordAssessment: unknown;
  prescriptions: unknown;
  goalsAndExpectations: string | null;
};

function CompareBody({ older, newer }: { older: CompareRow; newer: CompareRow }) {
  const oldRisk = (older.motiRiskValues ?? {}) as Partial<MotiRiskValues>;
  const newRisk = (newer.motiRiskValues ?? {}) as Partial<MotiRiskValues>;
  const oldPrescriptions = Array.isArray(older.prescriptions)
    ? older.prescriptions
    : [];
  const newPrescriptions = Array.isArray(newer.prescriptions)
    ? newer.prescriptions
    : [];

  return (
    <div className="space-y-4">
      {/* Moti 12 項風險 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Moti 12 項姿勢風險指數</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(MOTI_THRESHOLDS) as MotiRiskKey[]).map((key) => {
            const meta = MOTI_THRESHOLDS[key];
            const oldVal = oldRisk[key]?.value ?? null;
            const newVal = newRisk[key]?.value ?? null;
            return (
              <RiskRow
                key={key}
                label={meta.name}
                unit={meta.unit}
                oldValue={oldVal}
                newValue={newVal}
              />
            );
          })}
          <RiskRow
            label="整體風險指數"
            unit="%"
            isOverall
            oldValue={oldRisk.overallRiskIndex ?? null}
            newValue={newRisk.overallRiskIndex ?? null}
          />
        </CardContent>
      </Card>

      {/* 數量對比 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">項目數量</CardTitle>
        </CardHeader>
        <CardContent>
          <CountRow
            label="功能性動作"
            oldVal={countItems(older.functionalMovement)}
            newVal={countItems(newer.functionalMovement)}
          />
          <CountRow
            label="紅繩動力鍊"
            oldVal={countItems(older.redcordAssessment)}
            newVal={countItems(newer.redcordAssessment)}
          />
          <CountRow
            label="處方訓練"
            oldVal={oldPrescriptions.length}
            newVal={newPrescriptions.length}
          />
        </CardContent>
      </Card>

      {/* 目標(僅顯示新版,因為治療目標通常會更新) */}
      {(older.goalsAndExpectations || newer.goalsAndExpectations) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">客戶目標 & 期待</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <TextBlock content={older.goalsAndExpectations ?? undefined} />
              <TextBlock
                content={newer.goalsAndExpectations ?? undefined}
                highlight
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RiskRow({
  label,
  unit,
  oldValue,
  newValue,
  isOverall,
}: {
  label: string;
  unit: string;
  oldValue: number | null;
  newValue: number | null;
  isOverall?: boolean;
}) {
  const delta = oldValue !== null && newValue !== null ? newValue - oldValue : null;
  const direction = getDirection(delta);

  return (
    <div
      className={`grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-1.5 ${
        isOverall ? "border-t-2 border-stark-orange pt-3 mt-2" : ""
      }`}
    >
      <div
        className={`text-right text-sm tabular-nums ${
          isOverall ? "font-bold" : ""
        }`}
      >
        <span className={oldValue === null ? "text-muted-foreground" : "text-stark-text"}>
          {oldValue !== null ? `${oldValue}${unit}` : "—"}
        </span>
      </div>
      <div className="text-center px-2">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className="flex items-center justify-center gap-0.5 mt-0.5">
          {direction === "improve" && (
            <TrendingDown className="w-3 h-3 text-green-600" />
          )}
          {direction === "worse" && (
            <TrendingUp className="w-3 h-3 text-red-600" />
          )}
          {direction === "same" && (
            <Minus className="w-3 h-3 text-muted-foreground" />
          )}
          {delta !== null && (
            <span
              className={`text-[10px] font-semibold ${
                direction === "improve"
                  ? "text-green-600"
                  : direction === "worse"
                    ? "text-red-600"
                    : "text-muted-foreground"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div
        className={`text-left text-sm tabular-nums ${
          isOverall ? "font-bold" : ""
        }`}
      >
        <span className={newValue === null ? "text-muted-foreground" : "text-stark-text font-semibold"}>
          {newValue !== null ? `${newValue}${unit}` : "—"}
        </span>
      </div>
    </div>
  );
}

function CountRow({
  label,
  oldVal,
  newVal,
}: {
  label: string;
  oldVal: number;
  newVal: number;
}) {
  const delta = newVal - oldVal;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-1.5">
      <div className="text-right text-sm tabular-nums text-stark-text">
        {oldVal}
      </div>
      <div className="text-center px-2">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className="text-[10px] font-semibold text-muted-foreground">
          {delta > 0 ? `+${delta}` : delta}
        </div>
      </div>
      <div className="text-left text-sm tabular-nums font-semibold text-stark-text">
        {newVal}
      </div>
    </div>
  );
}

function TextBlock({
  content,
  highlight,
}: {
  content?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border-2 text-xs whitespace-pre-wrap ${
        highlight
          ? "border-stark-orange bg-stark-orange/5"
          : "border-stark-border bg-white"
      }`}
    >
      {content || <span className="text-muted-foreground">(未填)</span>}
    </div>
  );
}

function countItems(v: unknown): number {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === "object") return Object.keys(v).length;
  return 0;
}

function getDirection(delta: number | null): "improve" | "worse" | "same" | "none" {
  if (delta === null) return "none";
  if (Math.abs(delta) < 0.1) return "same";
  // Moti 風險指數:數值愈低愈好,所以 delta 為負代表改善
  return delta < 0 ? "improve" : "worse";
}
