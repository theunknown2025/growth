import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../global.css";
import { ThemeProvider } from "@/utils/theme";
import { AuthProvider } from "@/sections/auth/context/AuthProvider";
import { Toaster } from "@/shadcn/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Modern Dashboard",
  description: "Professional dashboard with modern aesthetic",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

