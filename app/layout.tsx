import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google"
import type { Metadata } from "next"
import Script from "next/script"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { STORE_LOGO_SRC } from "@/lib/store-config"
import { THEME_INIT_SCRIPT } from "@/lib/theme-init-script"
import { cn } from "@/lib/utils"

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Kalibri Texnika",
  description: "Kalibri Texnika — online store for technical equipment.",
  icons: {
    icon: [
      { url: STORE_LOGO_SRC, type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: STORE_LOGO_SRC, type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="uz"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        spaceGroteskHeading.variable,
      )}
    >
      <body suppressHydrationWarning>
        <Script
          id="kalibri-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
