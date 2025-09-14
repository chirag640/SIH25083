import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "Migrant Worker Healthcare System | Digital Health Records & Support",
  description:
    "Comprehensive healthcare record management system for migrant workers with multilingual support, QR code access, secure document storage, and 24/7 emergency assistance. Ensuring healthcare accessibility and dignity for all workers.",
  keywords: [
    "healthcare", 
    "migrant workers", 
    "medical records", 
    "QR codes", 
    "multilingual", 
    "digital health",
    "emergency support",
    "healthcare accessibility",
    "worker welfare",
    "government healthcare"
  ],
  authors: [{ name: "Chirag Chaudhary" }],
  creator: "Migrant Worker Healthcare Initiative",
  publisher: "Healthcare System",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Migrant Worker Healthcare System | Digital Health Records & Support",
    description: "Comprehensive healthcare solutions for migrant workers with multilingual support and 24/7 emergency assistance",
    type: "website",
    locale: "en_US",
    alternateLocale: ["hi_IN", "ml_IN"],
    siteName: "Migrant Worker Healthcare System",
  },
  twitter: {
    card: "summary_large_image",
    title: "Migrant Worker Healthcare System",
    description: "Digital healthcare solutions for migrant workers",
  },
  verification: {
    google: "verification_token_here", // Replace with actual Google verification token
  },
  category: "Healthcare",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0369a1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading healthcare system...</p>
            </div>
          </div>
        }>
          {children}
        </Suspense>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
