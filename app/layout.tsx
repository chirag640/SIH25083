import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Migrant Worker Healthcare System",
  description:
    "Comprehensive healthcare record management system for migrant workers with multilingual support, QR code access, and secure document storage.",
  generator: "v0.app",
  keywords: ["healthcare", "migrant workers", "medical records", "QR codes", "multilingual"],
  authors: [{ name: "Healthcare System Team" }],
  openGraph: {
    title: "Migrant Worker Healthcare System",
    description: "Secure healthcare record management for migrant workers",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
