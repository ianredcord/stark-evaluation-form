import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import {
  Bone,
  Activity,
  Brain,
  Scale,
  ArrowRight,
  LogIn,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";

const FEATURE_PILLARS = [
  {
    icon: <Bone className="w-6 h-6" />,
    title: "整合多系統檢測",
    desc: "MOTI Physio / RONFIC / InBody / Redcord 四大評估系統一次整合,異常項目自動標記。",
    color: "bg-brand-primary text-white",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "治療師單頁工作台",
    desc: "8 個編號區塊讓你在一頁完成主訴判讀、優先問題排序、處方開立、計畫排程。",
    color: "bg-brand-accent text-white",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "客戶端互動報告",
    desc: "shareCode 連結 + 生日驗證,讓客戶在手機看見白話說明、身體地圖、4 週改善路線圖。",
    color: "bg-client-violet text-white",
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: "處方知識庫",
    desc: "8 個基礎動作種子 + 自訂處方庫,選擇後一鍵帶入評估,客戶報告同步顯示。",
    color: "bg-status-good text-white",
  },
];

const HIGHLIGHTS = [
  "8 個治療師工作區塊,符合臨床判讀流程",
  "Mobile-first 客戶端報告,手機可加入主畫面",
  "雙簽名 + shareCode 自動產生,流程合規",
  "自動儲存 + Drawer 編輯,不打斷判讀節奏",
  "4 週改善路線圖,客戶看得懂、能執行",
  "處方影片 / R2 雲端整合(Phase 2)",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-client-warm text-foreground font-body">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-client-warm/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2">
              <span className="text-brand-accent text-xl">✦</span>
              <span className="font-display text-xl font-bold text-brand-primary tracking-wide">
                STARK
              </span>
            </a>
          </Link>
          <nav className="flex items-center gap-2">
            <a
              href="#features"
              className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground px-3 py-1.5"
            >
              功能介紹
            </a>
            <a
              href="#for-clients"
              className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground px-3 py-1.5"
            >
              我有報告連結
            </a>
            <Link href="/auth/login">
              <a>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-card"
                >
                  <LogIn className="w-4 h-4" />
                  登入
                </Button>
              </a>
            </Link>
            <Link href="/clients">
              <a>
                <Button
                  size="sm"
                  className="gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white"
                >
                  進入系統
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 text-center space-y-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 text-brand-primary px-3 py-1 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-status-good animate-pulse" />
            v1.0 MVP · 內部試用中
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-primary leading-tight">
            運動科學評估
            <br className="sm:hidden" />
            <span className="text-brand-accent"> · </span>
            從填表到對話
          </h1>
          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            史塔克整合 MOTI / RONFIC / InBody / Redcord 四大檢測,
            為治療師打造單頁工作台,
            <br className="hidden sm:inline" />
            為客戶生成手機可看的互動式整合報告。
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-2 justify-center pt-3"
        >
          <Link href="/clients">
            <a>
              <Button
                size="lg"
                className="gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white"
              >
                我是治療師
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </Link>
          <a href="#for-clients">
            <Button
              size="lg"
              variant="outline"
              className="gap-1.5 bg-card w-full sm:w-auto"
            >
              <LinkIcon className="w-4 h-4" />
              我有報告連結
            </Button>
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="pt-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card/60 rounded-full px-4 py-2 border">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-good" />
            目前處於開發模式 · 訪客自動以治療師「林昱辰」身份進入
          </div>
        </motion.div>
      </motion.section>

      {/* Feature pillars */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20">
        <div className="text-center space-y-2 mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            一個系統 · 兩種介面
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            DB 存治療師輸入的原始資料 + 治療師寫的白話說明。
            <br />
            治療師看精準數據,客戶看易懂報告,讀的是同一份資料。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURE_PILLARS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-xl border bg-card p-5 space-y-3"
            >
              <span
                className={`inline-flex w-12 h-12 items-center justify-center rounded-xl ${p.color}`}
              >
                {p.icon}
              </span>
              <h3 className="font-display text-lg font-semibold">{p.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Highlights checklist */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl bg-brand-primary text-white p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-start">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                MVP 已涵蓋的關鍵流程
              </h2>
              <p className="text-sm text-white/70 mt-2">
                從建檔到報告產出,12 步治療師工作流 + 4 步客戶體驗流。
              </p>
              <Link href="/clients">
                <a className="inline-flex items-center gap-1 text-sm font-medium text-brand-accent hover:underline mt-4">
                  立即試用
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HIGHLIGHTS.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-white/90"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Client section */}
      <section
        id="for-clients"
        className="max-w-3xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20"
      >
        <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-4 text-center">
          <span className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-client-violet/10 text-client-violet">
            <LinkIcon className="w-6 h-6" />
          </span>
          <h2 className="font-display text-2xl font-bold">
            我是客戶,我有報告連結
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            你的治療師會傳一條形如{" "}
            <code className="font-mono text-xs bg-bg-subtle px-1.5 py-0.5 rounded">
              /r/abc123
            </code>{" "}
            的連結給你。
            <br />
            打開後輸入生日驗證,即可查看整合諮詢報告。
          </p>
          <p className="text-xs text-muted-foreground">
            想看 demo?
            <Link href="/r/abc123">
              <a className="text-brand-primary hover:underline ml-1">
                打開示範報告(生日 2002-03-15)
              </a>
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-brand-accent">✦</span>
            <span className="font-display font-semibold text-brand-primary">
              STARK
            </span>
            <span>運動科學評估系統</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <a className="hover:text-foreground">登入</a>
            </Link>
            <Link href="/clients">
              <a className="hover:text-foreground">治療師後台</a>
            </Link>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
