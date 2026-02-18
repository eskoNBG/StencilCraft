import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InkCraft AI - Professionelle Tattoo Stencil Generator",
  description: "Verwandle jedes Foto in ein professionelles Tattoo-Stencil in Sekunden. Der schnellste AI Tattoo Stencil Maker für Künstler.",
  keywords: ["Tattoo Stencil AI", "Tattoo Stencil Generator", "AI Tattoo", "Photo to Stencil", "Tattoo Design", "Tattoo Vorlagen"],
  authors: [{ name: "InkCraft AI Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "InkCraft AI - Tattoo Stencil Generator",
    description: "KI-gestützter Tattoo Stencil Generator. Verwandle jedes Foto in ein professionelles Tattoo-Stencil.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InkCraft AI - Tattoo Stencil Generator",
    description: "KI-gestützter Tattoo Stencil Generator für professionelle Tattoo-Künstler.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
