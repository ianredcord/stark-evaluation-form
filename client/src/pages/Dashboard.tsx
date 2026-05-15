// 治療師儀表板 — 評估、分享、瀏覽數據總覽

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  ClipboardList,
  Loader2,
  Plus,
  Share2,
  Eye,
  TrendingUp,
  LayoutTemplate,
  Users,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = trpc.stats.overview.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>請先登入</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <a href={getLoginUrl()}>登入</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData =
    stats?.recentDays.map((d) => ({
      date: d.date.slice(5), // MM-DD
      評估: d.count,
    })) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img
                src="/stark-logo.webp"
                alt="史塔克 STARK WORKS"
                className="h-10 w-auto"
              />
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/evaluation/new">
              <Button
                size="sm"
                className="gap-2 bg-stark-orange hover:bg-stark-orange-dark text-white"
              >
                <Plus className="w-4 h-4" />
                新評估
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-stark-text">儀表板</h2>
            <p className="text-sm text-muted-foreground mt-1">
              歡迎回來,{user.name || "治療師"}
              {user.clinicId && "(同診所數據已彙整)"}
            </p>
          </div>
        </div>

        {isLoading || !stats ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
          </div>
        ) : (
          <>
            {/* 統計卡片 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <BigStat
                icon={<ClipboardList className="w-5 h-5" />}
                value={stats.total}
                label="總評估數"
                trend={`本月新增 ${stats.thisMonth}`}
              />
              <BigStat
                icon={<Share2 className="w-5 h-5" />}
                value={stats.shared}
                label="已分享連結"
                trend={
                  stats.total > 0
                    ? `${Math.round((stats.shared / stats.total) * 100)}% 分享率`
                    : "—"
                }
              />
              <BigStat
                icon={<Eye className="w-5 h-5" />}
                value={stats.totalViews}
                label="客戶總瀏覽次數"
                trend={
                  stats.shared > 0
                    ? `平均每份 ${Math.round(stats.totalViews / stats.shared)} 次`
                    : "—"
                }
              />
              <BigStat
                icon={<LayoutTemplate className="w-5 h-5" />}
                value={stats.templates}
                label="範本數"
                trend={user.clinicId ? "同診所共享" : "個人範本"}
              />
            </div>

            {/* 近 7 日趨勢 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-stark-orange" />
                  近 7 日評估新增趨勢
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                      <XAxis
                        dataKey="date"
                        stroke="#666"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#666"
                        fontSize={11}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "2px solid #D35400",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="評估"
                        fill="#D35400"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 最近活動 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">最近 5 筆評估</CardTitle>
                <Link href="/evaluations">
                  <Button variant="outline" size="sm">
                    查看全部
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {stats.recentEvaluations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">尚無評估紀錄</p>
                    <Link href="/evaluation/new">
                      <Button className="mt-3 bg-stark-orange hover:bg-stark-orange-dark text-white">
                        <Plus className="w-4 h-4 mr-1" />
                        建立第一份
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-stark-border">
                    {stats.recentEvaluations.map((ev) => (
                      <li
                        key={ev.id}
                        className="flex items-center justify-between gap-3 py-3 cursor-pointer hover:bg-stark-bg/40 -mx-2 px-2 rounded"
                        onClick={() => setLocation(`/evaluation/${ev.id}`)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-stark-text">
                              {ev.clientName || "未命名"}
                            </span>
                            {!ev.isOwn && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-stark-orange/10 text-stark-orange">
                                <Users className="w-2.5 h-2.5" />
                                同診所
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {ev.date || "未填日期"} ·{" "}
                            {new Date(ev.createdAt).toLocaleDateString(
                              "zh-TW",
                            )}
                          </div>
                        </div>
                        {ev.hasShareCode && (
                          <div className="flex items-center gap-1 text-xs text-stark-orange shrink-0">
                            <Eye className="w-3 h-3" />
                            {ev.viewCount}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function BigStat({
  icon,
  value,
  label,
  trend,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  trend: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="text-stark-orange">{icon}</div>
        </div>
        <div className="text-3xl font-bold text-stark-text leading-none">
          {value}
        </div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
        <div className="text-xs text-stark-orange mt-2">{trend}</div>
      </CardContent>
    </Card>
  );
}
