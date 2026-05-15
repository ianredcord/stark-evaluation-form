// 治療師帳號設定頁

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Mail,
  Building2,
  Calendar,
  ClipboardList,
  LayoutTemplate,
  Eye,
  Share2,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Account() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [editingName, setEditingName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: stats, isLoading: isLoadingStats } = trpc.stats.overview.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );

  const utils = trpc.useUtils();
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("資料已更新");
        setIsEditing(false);
        utils.auth.me.invalidate();
      } else {
        toast.error("更新失敗");
      }
    },
    onError: (e) => toast.error(`更新失敗: ${e.message}`),
  });

  const handleSave = () => {
    const name = editingName.trim();
    if (!name) {
      toast.error("名稱不可為空");
      return;
    }
    updateProfileMutation.mutate({ name });
  };

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
            <CardDescription>您需要登入才能查看帳號資訊</CardDescription>
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
          <Link href="/">
            <Button variant="outline" size="sm">返回首頁</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-stark-text">帳號設定</h2>
          <p className="text-sm text-muted-foreground mt-1">
            管理您的個人資料與診所歸屬
          </p>
        </div>

        {/* 個人資料 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-stark-orange" />
              個人資料
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">顯示名稱</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    id="display-name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="您的姓名"
                  />
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="bg-stark-orange hover:bg-stark-orange-dark text-white"
                  >
                    {updateProfileMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    )}
                    儲存
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    取消
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 p-3 rounded-lg border-2 border-stark-border bg-white">
                  <span className="text-stark-text font-medium">
                    {user.name || "(未設定)"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingName(user.name || "");
                      setIsEditing(true);
                    }}
                  >
                    編輯
                  </Button>
                </div>
              )}
            </div>

            <InfoRow icon={<Mail className="w-4 h-4" />} label="電子郵件" value={user.email || "—"} />
            <InfoRow
              icon={<Building2 className="w-4 h-4" />}
              label="診所識別 (clinicId)"
              value={user.clinicId || "未隸屬於診所（只看到自己的資料）"}
              hint={
                user.clinicId
                  ? "同 clinicId 的治療師可互看評估與範本"
                  : "請聯絡管理員設定診所歸屬"
              }
            />
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="加入日期"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("zh-TW")
                  : "—"
              }
            />
            <InfoRow
              icon={<UserIcon className="w-4 h-4" />}
              label="角色"
              value={user.role === "admin" ? "管理員" : "治療師"}
            />
          </CardContent>
        </Card>

        {/* 使用統計 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-stark-orange" />
              使用統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-stark-orange" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatTile
                  icon={<ClipboardList className="w-4 h-4" />}
                  value={stats.total}
                  label="總評估數"
                />
                <StatTile
                  icon={<Share2 className="w-4 h-4" />}
                  value={stats.shared}
                  label="已分享"
                />
                <StatTile
                  icon={<Eye className="w-4 h-4" />}
                  value={stats.totalViews}
                  label="客戶瀏覽"
                />
                <StatTile
                  icon={<LayoutTemplate className="w-4 h-4" />}
                  value={stats.templates}
                  label="範本數"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* 帳號操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">帳號操作</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="p-3 rounded-lg border border-stark-border bg-stark-bg/40 text-sm text-stark-text break-all">
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border-2 border-stark-border bg-white p-3 text-center">
      <div className="flex justify-center text-stark-orange mb-1">{icon}</div>
      <div className="text-2xl font-bold text-stark-text leading-none">
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
