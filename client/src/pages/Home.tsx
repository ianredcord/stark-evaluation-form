import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  ClipboardList,
  FileText,
  Users,
  LogIn,
  Loader2,
  LayoutTemplate,
  LayoutDashboard,
  UserCog,
} from "lucide-react";
import { Link } from "wouter";
import { OnboardingBanner } from "@/components/OnboardingBanner";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 bg-gradient-to-br from-stark-bg via-background to-stark-bg-card" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-stark-orange/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-stark-orange/5 rounded-full blur-3xl" />

        <div className="relative container py-20">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo - 使用官方 Logo 圖片 */}
            <div className="flex items-center justify-center">
              <img 
                src="/stark-logo.webp" 
                alt="史塔克 STARK WORKS" 
                className="h-24 md:h-32 w-auto"
              />
            </div>

            {/* 標題 */}
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-stark-text">
                初評報告系統
              </h2>
              <p className="text-lg text-muted-foreground">
                專業的線上評估表單系統，讓您輕鬆完成客戶初次評估，
                並即時生成專業的 PDF 報告。
              </p>
            </div>

            {/* CTA 按鈕 */}
            <div className="flex flex-col sm:flex-row gap-4">
              {loading ? (
                <Button size="lg" disabled className="gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  載入中...
                </Button>
              ) : isAuthenticated ? (
                <Link href="/evaluation/new">
                  <Button
                    size="lg"
                    className="gap-2 bg-stark-orange hover:bg-stark-orange-dark text-white px-8"
                  >
                    <ClipboardList className="w-5 h-5" />
                    開始新評估
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button
                    size="lg"
                    className="gap-2 bg-stark-orange hover:bg-stark-orange-dark text-white px-8"
                  >
                    <LogIn className="w-5 h-5" />
                    登入開始使用
                  </Button>
                </a>
              )}

              {isAuthenticated && (
                <>
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-stark-border hover:bg-stark-bg"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      儀表板
                    </Button>
                  </Link>
                  <Link href="/clients">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-stark-border hover:bg-stark-bg"
                    >
                      <Users className="w-5 h-5" />
                      客戶管理
                    </Button>
                  </Link>
                  <Link href="/evaluations">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-stark-border hover:bg-stark-bg"
                    >
                      <FileText className="w-5 h-5" />
                      評估紀錄
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-stark-border hover:bg-stark-bg"
                    >
                      <LayoutTemplate className="w-5 h-5" />
                      範本管理
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* 使用者資訊 */}
            {isAuthenticated && user && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  歡迎回來,{user.name || "使用者"}
                </p>
                <Link href="/account">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <UserCog className="w-3.5 h-3.5" />
                    帳號設定
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 新手引導 */}
      {isAuthenticated && (
        <div className="container -mt-12 mb-8 relative z-10">
          <OnboardingBanner isAuthenticated={isAuthenticated} />
        </div>
      )}

      {/* Features Section */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ClipboardList className="w-8 h-8" />}
            title="完整評估表單"
            description="涵蓋基本資料、功能性動作檢測、紅繩動力鍊檢測等 7 大評估項目，完整記錄客戶狀況。"
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="專業 PDF 報告"
            description="一鍵生成與原始設計風格一致的專業 PDF 報告，方便列印或分享給客戶。"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="客戶資料管理"
            description="所有評估資料安全儲存於雲端，隨時查閱歷史紀錄，追蹤客戶進步狀況。"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground space-y-2">
          <p>© 2024 史塔克 STARK WORKS. All rights reserved.</p>
          <div className="flex justify-center gap-4 text-xs">
            <Link href="/privacy">
              <span className="hover:text-stark-orange cursor-pointer">隱私權政策</span>
            </Link>
            <span>·</span>
            <Link href="/terms">
              <span className="hover:text-stark-orange cursor-pointer">服務條款</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="stark-card hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 rounded-full bg-stark-orange/10 text-stark-orange">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-stark-text">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
