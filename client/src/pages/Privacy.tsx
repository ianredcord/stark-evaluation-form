// 隱私權政策(SaaS 法律必要靜態頁)

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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

      <main className="container mx-auto px-4 py-8 max-w-3xl prose prose-sm">
        <h1 className="text-2xl font-bold text-stark-text mb-2">隱私權政策</h1>
        <p className="text-xs text-muted-foreground mb-6">最後更新:2026 年 5 月</p>

        <Section title="一、我們蒐集的資料">
          <p>為提供評估服務,本系統會蒐集以下類型的個人資料:</p>
          <ul>
            <li><b>治療師資料:</b>姓名、電子郵件、Google 帳號識別碼、所屬診所</li>
            <li><b>客戶資料:</b>姓名、生日、職業、症狀描述、病史、姿勢檢測數值、訓練計畫等</li>
            <li><b>使用紀錄:</b>登入時間、評估操作、客戶端報告瀏覽次數</li>
          </ul>
        </Section>

        <Section title="二、資料用途">
          <p>蒐集的資料僅用於:</p>
          <ul>
            <li>提供您建立、管理、分享客戶評估報告的功能</li>
            <li>產生客戶端互動報告與 PDF 文件</li>
            <li>系統錯誤排查與服務改善</li>
            <li>同診所內部資料共享(依您設定的 clinicId)</li>
          </ul>
          <p>我們<b>不會</b>將您的客戶資料用於行銷、出售給第三方、或進行 AI 模型訓練。</p>
        </Section>

        <Section title="三、資料儲存與安全">
          <ul>
            <li>所有資料儲存於受 HTTPS 加密保護的雲端資料庫</li>
            <li>圖片與簽名以加密形式儲存於物件儲存服務</li>
            <li>客戶分享連結使用 nanoid 隨機代碼,不可猜測</li>
            <li>分享連結僅暴露評估結果與處方,治療師備註不會外洩</li>
          </ul>
        </Section>

        <Section title="四、資料保留">
          <p>您建立的評估資料保留至您主動刪除為止。註銷帳號時,將於 30 日內永久刪除所有相關資料。</p>
        </Section>

        <Section title="五、第三方服務">
          <p>本系統使用以下第三方服務:</p>
          <ul>
            <li>Google OAuth — 用於使用者登入驗證</li>
            <li>Cloudflare R2 / AWS S3 — 圖片與檔案儲存</li>
            <li>(若您透過分享連結看報告,系統會記錄匿名瀏覽次數,不含 IP)</li>
          </ul>
        </Section>

        <Section title="六、您的權利">
          <p>您有權:</p>
          <ul>
            <li>查閱、修改或刪除您的個人資料</li>
            <li>匯出您建立的所有評估資料(PDF 格式)</li>
            <li>撤銷分享連結(於評估管理頁刪除)</li>
            <li>註銷帳號</li>
          </ul>
        </Section>

        <Section title="七、聯絡方式">
          <p>如有隱私相關疑問,請聯絡史塔克診所:<a href="mailto:contact@stark.works" className="text-stark-orange underline">contact@stark.works</a></p>
        </Section>

        <div className="mt-10 pt-6 border-t border-stark-border text-xs text-muted-foreground">
          本政策可能不定期更新,異動將於本頁公告。
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
