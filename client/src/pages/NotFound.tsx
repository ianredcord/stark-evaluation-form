import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ClipboardList, FileText, LayoutTemplate } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [path] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-stark-bg via-background to-stark-bg-card p-4">
      <Card className="w-full max-w-lg shadow-lg border-2 border-stark-border">
        <CardContent className="pt-8 pb-8 px-6 text-center">
          <Link href="/">
            <img
              src="/stark-logo.webp"
              alt="史塔克 STARK WORKS"
              className="h-16 w-auto mx-auto mb-6 cursor-pointer"
            />
          </Link>

          <div className="text-6xl font-bold text-stark-orange mb-2">404</div>

          <h1 className="text-xl font-semibold text-stark-text mb-2">
            找不到這個頁面
          </h1>

          <p className="text-sm text-muted-foreground mb-1">
            您要找的頁面可能已搬移或不存在。
          </p>
          {path && (
            <p className="text-xs text-muted-foreground font-mono break-all mb-6">
              {path}
            </p>
          )}

          <Link href="/">
            <Button className="bg-stark-orange hover:bg-stark-orange-dark text-white gap-2 mb-6">
              <Home className="w-4 h-4" />
              回到首頁
            </Button>
          </Link>

          <div className="border-t border-stark-border pt-4">
            <p className="text-xs text-muted-foreground mb-3">或直接前往:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <QuickLink
                href="/evaluation/new"
                icon={<ClipboardList className="w-3.5 h-3.5" />}
                label="新評估"
              />
              <QuickLink
                href="/evaluations"
                icon={<FileText className="w-3.5 h-3.5" />}
                label="評估紀錄"
              />
              <QuickLink
                href="/templates"
                icon={<LayoutTemplate className="w-3.5 h-3.5" />}
                label="範本管理"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs border-stark-border hover:bg-stark-bg"
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
}
