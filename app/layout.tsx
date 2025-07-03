/// <reference types="react" />
import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toggle } from "@/components/ui/toggle"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import Chatbot from "@/components/Chatbot"

const inter = Inter({ subsets: ["latin"] })

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  return (
    <Toggle
      aria-label="Toggle dark mode"
      pressed={isDark}
      onPressedChange={() => setTheme(isDark ? "light" : "dark")}
      className="fixed left-4 bottom-4 z-50 bg-white/80 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full p-2 flex items-center justify-center transition-colors"
      size="sm"
      variant="outline"
    >
      {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
    </Toggle>
  )
}

export const metadata: Metadata = {
  title: "Weather Forecast App",
  description: "Get detailed weather information for any city worldwide"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeToggle />
          <Chatbot />
          {children}
          <footer
            style={{
              position: "fixed",
              right: 0,
              bottom: 0,
              zIndex: 50,
              background: "rgba(255,255,255,0.85)",
              padding: "0.5rem 1rem",
              borderTopLeftRadius: "0.75rem",
              fontWeight: 500,
              fontSize: "1rem",
              color: "#1e293b",
              boxShadow: "-2px -2px 8px rgba(0,0,0,0.04)"
            }}
            aria-label="Built by Rajnish"
          >
            Built by Rajnish<span aria-hidden="true" style={{marginLeft: 4}}>❤️</span>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
