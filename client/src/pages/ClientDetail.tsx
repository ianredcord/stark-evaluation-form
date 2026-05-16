// 客戶歷史 — 該客戶所有評估 timeline

import { Link, useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  ArrowLeft,
  Loader2,
  Eye,
  ClipboardList,
  GitCompare,
  User,
  Calendar,
  Share2,
} from "lucide-react";
import { useMemo } from "react";

export default function ClientDetail() {
  const params = useParams<{ name: string }>();
  const clientName = decodeURIComponent(params.name);
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: history, isLoading } = trpc.clients.history.useQuery(
    { name: clientName },
    { enabled: isAuthenticated && !!clientName },
  );

  const latest = useMemo(() => history?.[0], [history]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/clients">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              客戶列表
            </Button>
          </Link>
          {history && history.length >= 2 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setLocation(`/evaluation/${latest!.id}/compare`)}
            >
              <GitCompare className="w-4 h-4" />
              比較進度
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
          </div>
        ) : !history || history.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              找不到 {clientName} 的評估資料
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stark-text flex items-center gap-2">
                <User className="w-6 h-6 text-stark-orange" />
                {clientName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                共 {history.length} 份評估 · 點下方任一份可查看完整內容
              </p>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stark-border">
              {history.map((ev, idx) => (
                <div key={ev.id} className="relative">
                  <div
                    className={`absolute -left-6 top-4 w-4 h-4 rounded-full border-2 ${
                      idx === 0
                        ? "bg-stark-orange border-stark-orange"
                        : "bg-white border-stark-border"
                    }`}
                  />
                  <Card
                    className="cursor-pointer hover:border-stark-orange hover:shadow-md transition-all"
                    onClick={() => setLocation(`/evaluation/${ev.id}`)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-stark-orange" />
                            <span className="font-semibold text-stark-text">
                              {ev.date || "未填日期"}
                            </span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-stark-orange text-white">
                                最新
                              </span>
                            )}
                            {!ev.isOwn && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-stark-orange/10 text-stark-orange">
                                同診所
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            建立於{" "}
                            {new Date(ev.createdAt).toLocaleString("zh-TW", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                          {ev.hasShareCode && (
                            <div className="flex items-center gap-1 text-stark-orange">
                              <Eye className="w-3 h-3" />
                              {ev.viewCount}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        <Metric
                          label="檢測項目"
                          value={countMetrics(ev.functionalMovement)}
                        />
                        <Metric
                          label="紅繩"
                          value={countMetrics(ev.redcordAssessment)}
                        />
                        <Metric
                          label="訓練"
                          value={countMetrics(ev.prescriptions)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {history.length >= 2 && (
              <div className="mt-6 p-4 rounded-lg bg-stark-orange/5 border-2 border-stark-orange/20">
                <div className="flex items-start gap-3">
                  <GitCompare className="w-5 h-5 text-stark-orange shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-stark-text">
                      想看進步幅度?
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      使用比較功能,並排顯示兩份評估的差異,適合與客戶討論進度。
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 bg-stark-orange hover:bg-stark-orange-dark text-white"
                      onClick={() =>
                        setLocation(`/evaluation/${latest!.id}/compare`)
                      }
                    >
                      <GitCompare className="w-4 h-4 mr-1" />
                      開啟比較
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stark-bg border border-stark-border">
      <ClipboardList className="w-2.5 h-2.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-stark-text">{value}</span>
    </span>
  );
}

function countMetrics(v: unknown): number {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === "object") return Object.keys(v).length;
  return 0;
}
