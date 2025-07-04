/// <reference types="react" />
import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Chatbot from "@/components/Chatbot"

const inter = Inter({ subsets: ["latin"] })

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
