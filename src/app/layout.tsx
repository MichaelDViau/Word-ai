import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { APP_NAME } from "@/lib/constants";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16834c" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1217" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Set theme before paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Professional web fonts for the font selector. Loaded once, used by
            the editor's font-family picker. preconnect speeds up the fetch. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&family=Nunito:wght@400;600;700&family=EB+Garamond:wght@400;600&family=Lora:wght@400;600&family=PT+Serif:wght@400;700&family=Raleway:wght@400;500;600&family=Work+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap"
        />
      </head>
      <body className="min-h-screen bg-ink-50 font-sans text-ink-950 antialiased transition-colors duration-300 dark:bg-night-base dark:text-ink-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
