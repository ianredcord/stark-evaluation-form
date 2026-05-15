// 評估表歷史紀錄列表頁

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  ClipboardList,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Eye,
  Users,
  Share2,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { Input } from "@/components/ui/input";

export default function Evaluations() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const {
    data: evaluations,
    isLoading,
    refetch,
  } = trpc.evaluation.list.useQuery(undefined, { enabled: isAuthenticated });

  const deleteMutation = trpc.evaluation.delete.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("評估表已刪除");
        refetch();
      } else {
        toast.error(result.error || "刪除失敗");
      }
    },
    onError: (e) => toast.error(`刪除失敗: ${e.message}`),
  });

  const filtered = useMemo(() => {
    if (!evaluations) return [];
    const q = search.trim().toLowerCase();
    if (!q) return evaluations;
    return evaluations.filter(
      (e) =>
        e.clientName?.toLowerCase().includes(q) ||
        e.date?.toLowerCase().includes(q) ||
        e.occupation?.toLowerCase().includes(q),
    );
  }, [evaluations, search]);

  const handleDelete = (id: number, name: string | null) => {
    if (!confirm(`確定要刪除「${name || "未命名"}」的評估表嗎？此操作無法復原。`)) {
      return;
    }
    deleteMutation.mutate({ id });
  };

  const copyShareLink = async (
    e: React.MouseEvent,
    shareCode: string | null,
  ) => {
    e.stopPropagation();
    if (!shareCode) {
      toast.error("此評估尚未產生分享連結,請先打開評估後點選「分享連結」");
      return;
    }
    const url = `${window.location.origin}/report/${shareCode}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("已複製分享連結");
    } catch {
      toast.error("複製失敗");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>請先登入</CardTitle>
            <CardDescription>您需要登入才能查看評估歷史</CardDescription>
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
            <Link href="/">
              <Button variant="outline" size="sm">
                返回首頁
              </Button>
            </Link>
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

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stark-text">評估歷史紀錄</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {evaluations
                ? `共 ${evaluations.length} 筆評估${
                    user?.clinicId ? "(含同診所共享)" : ""
                  }`
                : ""}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋客戶姓名 / 日期 / 職業"
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {search ? "查無符合的評估" : "尚無評估紀錄"}
              </h3>
              {!search && (
                <>
                  <p className="text-muted-foreground mb-4">
                    建立第一份客戶評估,開始使用史塔克評估系統
                  </p>
                  <Link href="/evaluation/new">
                    <Button className="bg-stark-orange hover:bg-stark-orange-dark text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      建立新評估
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ev) => {
              const isShared = user?.id !== undefined && ev.userId !== user.id;
              const hasShareCode = Boolean(ev.shareCode);
              return (
                <Card
                  key={ev.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/evaluation/${ev.id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between gap-2">
                      <span className="truncate">
                        {ev.clientName || "未命名客戶"}
                      </span>
                      {isShared && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stark-orange/10 text-stark-orange shrink-0">
                          <Users className="w-3 h-3" />
                          同診所
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center justify-between gap-2 flex-wrap">
                      <span>{ev.date || "未填日期"}</span>
                      {hasShareCode && (
                        <span className="inline-flex items-center gap-1 text-stark-orange">
                          <Eye className="w-3 h-3" />
                          {ev.viewCount} 次瀏覽
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/evaluation/${ev.id}`);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        開啟
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title={
                          hasShareCode
                            ? "複製客戶分享連結"
                            : "尚未產生分享連結"
                        }
                        disabled={!hasShareCode}
                        onClick={(e) => copyShareLink(e, ev.shareCode)}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(ev.id, ev.clientName);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
