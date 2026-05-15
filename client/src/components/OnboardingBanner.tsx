// 首次使用引導 — 3 步流程,完成後存於 localStorage 不再顯示

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutTemplate,
  ClipboardList,
  Share2,
  Check,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const ONBOARDING_KEY = "stark-onboarding-v1";

interface OnboardingProps {
  isAuthenticated: boolean;
}

export function OnboardingBanner({ isAuthenticated }: OnboardingProps) {
  const [dismissed, setDismissed] = useState(true); // 預設關閉,避免閃爍

  const { data: stats } = trpc.stats.overview.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const stored = localStorage.getItem(ONBOARDING_KEY);
    setDismissed(stored === "done");
  }, [isAuthenticated]);

  if (!isAuthenticated || dismissed || !stats) return null;

  // 三步完成狀態(由實際資料推斷)
  const hasTemplate = stats.templates > 0;
  const hasEvaluation = stats.total > 0;
  const hasShared = stats.shared > 0;
  const allDone = hasTemplate && hasEvaluation && hasShared;

  // 全部都做完,自動標記為 done(本次不顯示後,localStorage 防再次出現)
  if (allDone) {
    localStorage.setItem(ONBOARDING_KEY, "done");
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "done");
    setDismissed(true);
  };

  return (
    <Card className="border-2 border-stark-orange/40 bg-gradient-to-br from-stark-orange/5 to-transparent">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-stark-text">
              新手引導 — 3 步開始使用
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              完成下方步驟以解鎖完整功能
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-stark-text"
            title="關閉引導"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Step
            done={hasTemplate}
            number={1}
            icon={<LayoutTemplate className="w-4 h-4" />}
            title="建立第一個範本"
            description="先設定常用的檢測項目,加快後續評估"
            cta="前往範本管理"
            href="/templates"
          />
          <Step
            done={hasEvaluation}
            number={2}
            icon={<ClipboardList className="w-4 h-4" />}
            title="完成第一份評估"
            description="從第 1 頁到第 8 頁,完整跑一遍"
            cta="開始新評估"
            href="/evaluation/new"
          />
          <Step
            done={hasShared}
            number={3}
            icon={<Share2 className="w-4 h-4" />}
            title="分享給第一位客戶"
            description="複製連結,讓客戶用手機看互動報告"
            cta="查看評估紀錄"
            href="/evaluations"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Step({
  done,
  number,
  icon,
  title,
  description,
  cta,
  href,
}: {
  done: boolean;
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-3 transition-all ${
        done
          ? "border-green-500 bg-green-50/50"
          : "border-stark-border bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            done
              ? "bg-green-500 text-white"
              : "bg-stark-orange text-white"
          }`}
        >
          {done ? <Check className="w-3 h-3" /> : number}
        </div>
        <span className="font-semibold text-sm text-stark-text">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        {description}
      </p>
      {!done && (
        <Link href={href}>
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1 text-xs h-8"
          >
            {icon}
            {cta}
          </Button>
        </Link>
      )}
    </div>
  );
}
