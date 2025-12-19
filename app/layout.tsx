import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Prompt Gallery | 提示词美化站",
  description: "发现、优化并分享你的 AI 提示词",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          /* 核心修改：让明暗模式的背景色与 HomeClient 完美融合 */
          bg-white dark:bg-[#0f1115] 
          text-slate-900 dark:text-slate-50 
          transition-colors duration-500
        `}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {/* 这里的 children 包含 Page.tsx 以及里面的 HomeClient */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}