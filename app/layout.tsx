import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/hooks/auth'
import MockUserSwitcherWrapper from '@/components/debug/MockUserSwitcherWrapper'
import QueryProvider from '@/lib/providers/query-provider'

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Eneca Work",
  description: "Eneca Work Application",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
              <MockUserSwitcherWrapper>
                {children}
              </MockUserSwitcherWrapper>
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import './globals.css'