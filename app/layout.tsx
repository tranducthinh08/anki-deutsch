import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "🇩🇪 DeutschFlow • Bauhaus Obsidian & Gold Edition",
  description: "Luyện tập tiếng Đức A1 thông minh với phong cách Bauhaus Obsidian & Amber Gold",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body
        className={`${geist.className} bg-[#090a0f] text-slate-100 min-h-screen antialiased selection:bg-amber-400 selection:text-slate-950`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
