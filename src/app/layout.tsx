import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const SITE_URL = "https://example.com"; // TODO: 실제 배포 도메인으로 교체하세요

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "타임패널 — 무료 카운트다운 타이머 · 스탑워치",
    template: "%s | 타임패널",
  },
  description:
    "설치 없이 바로 쓰는 온라인 카운트다운 타이머와 스탑워치. 요리, 운동, 공부, 발표 준비에 딱 맞는 무료 도구입니다.",
  keywords: ["카운트다운", "타이머", "스탑워치", "온라인 타이머", "무료 타이머"],
  openGraph: {
    title: "타임패널 — 무료 카운트다운 타이머 · 스탑워치",
    description: "설치 없이 바로 쓰는 온라인 카운트다운 타이머와 스탑워치.",
    url: SITE_URL,
    siteName: "타임패널",
    locale: "ko_KR",
    type: "website",
  },
};

// ============================================================
// 애드센스 안내: 아래 ADSENSE_CLIENT_ID 값을 실제 발급받은
// 애드센스 client ID로 교체하면 사이트 전체에 스크립트가 적용됩니다.
// 승인 전에는 비워둬도 무방합니다.
// ============================================================
const ADSENSE_CLIENT_ID = ""; // 예: "ca-pub-1234567890123456"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col text-text antialiased">
        {ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        <header className="border-b border-hairline">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2.5 group">
              <span className="font-mono font-extrabold text-[13px] tracking-[0.14em] text-text bg-white/15 border border-hairline px-2.5 py-1 rounded-lg group-hover:bg-white/25 transition-colors">
                TIME/PANEL
              </span>
              <span className="text-[11px] text-muted tracking-wide hidden sm:inline">
                카운트다운 · 스탑워치
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-[13px] text-muted">
              <Link href="/about" className="hover:text-text transition-colors">
                소개
              </Link>
              <Link href="/privacy" className="hover:text-text transition-colors">
                개인정보처리방침
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-hairline mt-10">
          <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted">
            <span>© {new Date().getFullYear()} 타임패널. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-text transition-colors">소개</Link>
              <Link href="/privacy" className="hover:text-text transition-colors">개인정보처리방침</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
