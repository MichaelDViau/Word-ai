import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { APP_NAME } from "@/lib/constants";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Editor de documentos profesional`,
  description:
    "Crea, edita, da formato, importa y exporta documentos en un editor rápido, moderno y premium de Nopal.",
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
    <html lang="es" className={inter.variable} suppressHydrationWarning>
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&family=Nunito:wght@400;600;700&family=EB+Garamond:wght@400;600&family=Lora:wght@400;600&family=PT+Serif:wght@400;700&family=Raleway:wght@400;500;600&family=Work+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=Rubik:wght@400;500;600&family=Karla:wght@400;600;700&family=Oswald:wght@400;500;600&family=Source+Serif+4:wght@400;600;700&family=IBM+Plex+Serif:wght@400;600&family=Libre+Baskerville:wght@400;700&family=Bitter:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&family=Source+Code+Pro:wght@400;600&display=swap"
        />
      </head>
      <body className="min-h-screen bg-ink-50 font-sans text-ink-950 antialiased transition-colors duration-300 dark:bg-night-base dark:text-ink-100">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
