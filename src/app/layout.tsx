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
  description: "Turn any photo into a professional tattoo stencil in seconds. The fastest AI stencil maker for artists.",
  keywords: ["Tattoo Stencil AI", "Tattoo Stencil Generator", "AI Tattoo", "Photo to Stencil", "Tattoo Design", "StencilCraft"],
  authors: [{ name: "StencilCraft" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "StencilCraft - Tattoo Stencil Generator",
    description: "AI-powered tattoo stencil generator. Turn any photo into a professional stencil.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StencilCraft - Tattoo Stencil Generator",
    description: "AI-powered tattoo stencil generator for professional tattoo artists.",
  },
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
