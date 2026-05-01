import type { Metadata } from "next";
import { Noto_Sans_Khmer, Geist } from "next/font/google"; 
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { Providers } from "@/components/providers/providers";
const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Font english (Google Sans)
const googleSans = localFont({
  src: "./fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf",
  variable: "--font-google-sans",
  display: "swap",
});

// Font Hacker (Hackdaddy)
const hackdaddy = localFont({
  src: "./fonts/Hackdaddy.otf",
  variable: "--font-hackdaddy",
  display: "swap",
});

// Font khmer (Noto Sans Khmer)
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


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning className={cn("h-full", "antialiased", googleSans.variable, hackdaddy.variable, notoKhmer.variable, "font-sans", geist.variable)}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              <LayoutWrapper>{children}</LayoutWrapper>
            </Providers>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
