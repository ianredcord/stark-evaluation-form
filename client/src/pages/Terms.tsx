// 服務條款(SaaS 法律必要靜態頁)

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <img src="/stark-logo.webp" alt="史塔克 STARK WORKS" className="h-10 w-auto cursor-pointer" />
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回首頁
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-stark-text mb-2">服務條款</h1>
        <p className="text-xs text-muted-foreground mb-6">最後更新:2026 年 5 月</p>

        <Section title="一、服務說明">
          <p>史塔克評估系統(以下稱「本服務」)提供物理治療師建立、管理、分享客戶體態評估報告的工具。本服務由史塔克診所(STARK WORKS)營運。</p>
        </Section>

        <Section title="二、使用者責任">
          <ul>
            <li>使用者應為合格物理治療師或受診所授權之專業人員</li>
            <li>使用者需妥善保管帳號,不得轉讓或共用</li>
            <li>使用者應取得客戶同意後才得建立評估資料</li>
            <li>使用者不得將本服務用於非法、商業詐欺或侵權用途</li>
          </ul>
        </Section>

        <Section title="三、評估資料的歸屬">
          <p>使用者建立的評估資料著作權屬於使用者(及其所屬診所),但您授權本服務於提供功能必要之範圍內處理、儲存、傳輸該資料。</p>
        </Section>

        <Section title="四、評估報告的免責聲明">
          <ul>
            <li>本服務產出的評估報告與處方建議,僅為治療師輔助工具,<b>不構成醫療診斷</b></li>
            <li>系統提供的處方知識庫內容僅供參考,實際治療方案應由治療師依專業判斷決定</li>
            <li>本服務不對客戶因執行報告建議所產生之任何結果負責</li>
          </ul>
        </Section>

        <Section title="五、服務可用性">
          <p>本服務以「現狀」(as-is) 提供。我們會盡力維持系統穩定,但不保證 100% 不間斷服務。維護或故障期間造成的不便,敬請見諒。</p>
        </Section>

        <Section title="六、付費條款">
          <p>本服務目前處於 Beta 試用階段,免費提供。正式商業化後將另行公告計費方案,並提前 30 日通知所有使用者。</p>
        </Section>

        <Section title="七、終止服務">
          <ul>
            <li>使用者可隨時於帳號設定頁註銷帳號</li>
            <li>若使用者違反本條款,我們保留終止服務的權利</li>
            <li>服務終止後,資料處置依隱私權政策辦理</li>
          </ul>
        </Section>

        <Section title="八、準據法">
          <p>本條款依中華民國法律解釋與適用,如有爭議,以臺灣臺北地方法院為第一審管轄法院。</p>
        </Section>

        <Section title="九、聯絡方式">
          <p>如有條款相關疑問,請聯絡:<a href="mailto:contact@stark.works" className="text-stark-orange underline">contact@stark.works</a></p>
        </Section>

        <div className="mt-10 pt-6 border-t border-stark-border text-xs text-muted-foreground">
          本條款可能不定期更新,異動將於本頁公告。
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-stark-text mt-6 mb-3">{title}</h2>
      <div className="text-sm text-stark-text leading-relaxed space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:leading-relaxed">
        {children}
      </div>
    </section>
  );
}
