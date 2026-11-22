import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "🇩🇪 DeutschFlow • Anki A1 Mastery",
  description: "Luyện tập tiếng Đức A1 thông minh với màu đen xanh cyber & Gemini AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body
        className={`${geist.className} bg-[#060913] text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-slate-950`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
