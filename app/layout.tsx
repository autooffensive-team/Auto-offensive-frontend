import type { Metadata } from "next";
import { Noto_Sans_Khmer, Geist, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { OfflineProvider } from "@/components/providers/offline-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const googleSans = localFont({
  src: "./fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf",
  variable: "--font-google-sans",
  display: "swap",
});

const hackdaddy = localFont({
  src: "./fonts/Hackdaddy.otf",
  variable: "--font-hackdaddy",
  display: "swap",
});

const notoKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  variable: "--font-noto-khmer",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Auto-Offensive | Next-Gen PaaS for Hackers",
  description: "Automated Security Workflows and Pentesting Platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        googleSans.variable,
        hackdaddy.variable,
        notoKhmer.variable,
        jetbrainsMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <OfflineProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </OfflineProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}