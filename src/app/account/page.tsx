"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/ThemeSelector";
import { User, Palette, CreditCard, ArrowLeft } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { type ThemeId } from "@/lib/themes";
import Link from "next/link";

export default function AccountPage() {
  const { data: session } = useSession();
  const { t } = useLocale();
  const [theme, setTheme] = useState<ThemeId>("purple");
  const [subscription, setSubscription] = useState<{ tier: string; status: string } | null>(null);

  useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem("stencilcraft_theme");
    if (stored) setTheme(stored as ThemeId);

    // Load subscription info
    fetch("/api/account")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          if (data.theme) setTheme(data.theme);
          if (data.subscription) setSubscription(data.subscription);
        }
      })
      .catch(() => {});
  }, []);

  const handleThemeChange = async (newTheme: ThemeId) => {
    setTheme(newTheme);
    // Apply theme immediately
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("stencilcraft_theme", newTheme);

    // Persist to server if logged in
    if (session?.user) {
      await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      }).catch(() => {});
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("auth.signInRequired")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>

        <h1 className="text-3xl font-bold mb-8">{t("account.title")}</h1>

        <div className="space-y-6">
          {/* Profile */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t("account.profile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">{t("auth.name")}</label>
                <p className="font-medium">{session.user.name || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t("auth.email")}</label>
                <p className="font-medium">{session.user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                {t("account.theme")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeSelector value={theme} onChange={handleThemeChange} />
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {t("account.subscription")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">{subscription?.tier || "free"}</p>
                  <p className="text-sm text-muted-foreground capitalize">{subscription?.status || "active"}</p>
                </div>
                <Link href="/pricing">
                  <Button variant="outline" size="sm">
                    {t("pricing.upgrade")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
