import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UIVault — 디자인 레퍼런스 갤러리",
  description: "UI/UX 디자이너를 위한 모바일 앱 레퍼런스 갤러리",
  openGraph: {
    title: "UIVault",
    description: "UI/UX 디자인 레퍼런스 갤러리",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} bg-[#0a0a0a] text-[#f0f0f0] antialiased`}>
        {children}
      </body>
    </html>
  );
}
