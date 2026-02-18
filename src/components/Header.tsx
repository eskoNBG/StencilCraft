"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Image as ImageIcon, Globe, CreditCard } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { AuthButton } from "@/components/AuthButton";
import Link from "next/link";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  galleryCount: number;
}

export function Header({ activeTab, onTabChange, galleryCount }: HeaderProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-gradient flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold theme-gradient-text">
                {t("brand.name")}
              </h1>
              <p className="text-xs text-muted-foreground">{t("brand.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex items-center gap-2 sm:gap-4">
              <Button
                variant={activeTab === "create" ? "default" : "ghost"}
                onClick={() => onTabChange("create")}
                size="sm"
                className={activeTab === "create" ? "bg-primary hover:bg-primary/90" : ""}
              >
                <Wand2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("common.create")}</span>
              </Button>
              <Button
                variant={activeTab === "gallery" ? "default" : "ghost"}
                onClick={() => onTabChange("gallery")}
                size="sm"
                className={activeTab === "gallery" ? "bg-primary hover:bg-primary/90" : ""}
              >
                <ImageIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("common.gallery")}</span>
                {galleryCount > 0 && (
                  <Badge variant="secondary" className="ml-1 sm:ml-2 bg-primary/20 text-primary text-xs">
                    {galleryCount}
                  </Badge>
                )}
              </Button>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">
                  <CreditCard className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t("pricing.nav")}</span>
                </Button>
              </Link>
            </nav>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale(locale === "de" ? "en" : "de")}
              className="text-xs font-medium gap-1"
            >
              <Globe className="w-4 h-4" />
              {locale.toUpperCase()}
            </Button>
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
