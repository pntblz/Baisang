import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ใบสั่ง (Baisang)",
  description: "แอปหารเงินที่สวยงาม ใช้งานง่าย คัดลอกเลขบัญชีได้ทันที",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${notoSansThai.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <main className="flex-1 w-full max-w-md mx-auto bg-card shadow-sm min-h-screen relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
