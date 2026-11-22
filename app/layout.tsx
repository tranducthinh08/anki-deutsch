import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "🇩🇪 Anki Deutsch Practice",
  description: "Luyện viết câu tiếng Đức từ những từ đã học hôm nay",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={geist.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
