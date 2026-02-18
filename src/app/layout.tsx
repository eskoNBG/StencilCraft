import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LocaleProvider } from "@/hooks/useLocale";
import { SessionProvider } from "next-auth/react";
import { ThemeInitScript } from "@/components/ThemeInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StencilCraft - Professional Tattoo Stencil Generator",
  description: "Turn any photo into a professional tattoo stencil in seconds. AI-powered stencil generation with 5 styles, PSD/SVG export, and Procreate integration.",
  keywords: ["Tattoo Stencil AI", "Tattoo Stencil Generator", "AI Tattoo", "Photo to Stencil", "Tattoo Design", "StencilCraft", "Procreate Stencil", "Tattoo Transfer"],
  authors: [{ name: "StencilCraft" }],
  creator: "StencilCraft",
  publisher: "StencilCraft",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://stencilcraft.app"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "StencilCraft - Professional Tattoo Stencil Generator",
    description: "AI-powered tattoo stencil generator. Turn any photo into a professional stencil with 5 styles, PSD export, and more.",
    type: "website",
    siteName: "StencilCraft",
    locale: "de_DE",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "StencilCraft - Tattoo Stencil Generator",
    description: "AI-powered tattoo stencil generator for professional tattoo artists. 5 styles, PSD/SVG export, Procreate-ready.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "StencilCraft",
      url: process.env.NEXTAUTH_URL || "https://stencilcraft.app",
      description: "Professional AI-powered tattoo stencil generator",
    },
    {
      "@type": "SoftwareApplication",
      name: "StencilCraft",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", price: "0", priceCurrency: "EUR", name: "Free" },
        { "@type": "Offer", price: "14", priceCurrency: "EUR", name: "Pro" },
        { "@type": "Offer", price: "29", priceCurrency: "EUR", name: "Studio" },
      ],
    },
    {
      "@type": "Organization",
      name: "StencilCraft",
      url: process.env.NEXTAUTH_URL || "https://stencilcraft.app",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className="dark">
      <head>
        <ThemeInitScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <SessionProvider>
          <LocaleProvider>
            {children}
            <Toaster />
          </LocaleProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
