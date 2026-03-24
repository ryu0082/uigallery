import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UIVault — 디자인 레퍼런스 갤러리",
  description: "UI/UX 디자이너를 위한 모바일 앱 레퍼런스 갤러리",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body
        style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
        className="bg-[#0a0a0a] text-[#f0f0f0] antialiased"
      >
        {children}
      </body>
    </html>
  );
}
