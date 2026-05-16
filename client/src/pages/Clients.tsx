// 客戶管理列表 — 從評估表按 clientName 分群

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Users,
  Loader2,
  Search,
  Calendar,
  ClipboardList,
  Eye,
  Briefcase,
  Plus,
  Cake,
} from "lucide-react";

export default function Clients() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");

  const { data: clients, isLoading } = trpc.clients.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const filtered = useMemo(() => {
    if (!clients) return [];
    const s = search.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.occupation?.toLowerCase().includes(s) ?? false),
    );
  }, [clients, search]);

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
            <p className="mb-4 text-stark-text">請先登入</p>
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
            <img
              src="/stark-logo.webp"
              alt="史塔克"
              className="h-10 w-auto cursor-pointer"
            />
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
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-2xl font-bold text-stark-text flex items-center gap-2">
              <Users className="w-6 h-6 text-stark-orange" />
              客戶管理
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {clients ? `共 ${clients.length} 位客戶` : "載入中..."}
            </p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋客戶姓名或職業..."
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-stark-orange" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground mb-4">
                {search
                  ? "沒有符合搜尋的客戶"
                  : "尚無客戶資料,建立第一份評估後將自動出現"}
              </p>
              {!search && (
                <Link href="/evaluation/new">
                  <Button className="bg-stark-orange hover:bg-stark-orange-dark text-white">
                    <Plus className="w-4 h-4 mr-1" />
                    建立評估
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((c) => (
              <Link key={c.name} href={`/clients/${encodeURIComponent(c.name)}`}>
                <Card className="cursor-pointer hover:border-stark-orange hover:shadow-md transition-all">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-stark-text truncate">
                          {c.name}
                        </h3>
                        {c.occupation && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3" />
                            {c.occupation}
                          </div>
                        )}
                        {c.birthday && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Cake className="w-3 h-3" />
                            {c.birthday}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stark-orange/10 text-stark-orange">
                        {c.evaluationCount} 份
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-stark-border pt-3">
                      <div className="flex items-center gap-1">
                        <ClipboardList className="w-3 h-3" />
                        最近 {c.lastEvaluationDate || "—"}
                      </div>
                      {c.hasShareCode && (
                        <div className="flex items-center gap-1 text-stark-orange">
                          <Eye className="w-3 h-3" />
                          {c.totalViews}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
