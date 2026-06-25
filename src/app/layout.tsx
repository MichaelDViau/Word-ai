import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Professional document editor`,
  description:
    "Create, edit, format, import and export documents in a fast, modern, premium editor by Nopal AI.",
};

export const viewport: Viewport = {
  themeColor: "#16834c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-ink-50 font-sans text-ink-950 antialiased">
        {children}
      </body>
    </html>
  );
}
