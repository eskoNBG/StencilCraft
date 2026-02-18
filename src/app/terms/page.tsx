"use client";

import { useLocale } from "@/hooks/useLocale";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl theme-gradient flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{t("legal.termsTitle")}</h1>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">{t("legal.lastUpdated")}: 2026-02-01</p>

          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.acceptance")}</h2>
            <p>{t("legal.acceptanceDesc")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.serviceDesc")}</h2>
            <p>{t("legal.serviceDescText")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.accounts")}</h2>
            <p>{t("legal.accountsDesc")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.subscriptions")}</h2>
            <p>{t("legal.subscriptionsDesc")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.intellectualProperty")}</h2>
            <p>{t("legal.intellectualPropertyDesc")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.refunds")}</h2>
            <p>{t("legal.refundsDesc")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.liability")}</h2>
            <p>{t("legal.liabilityDesc")}</p>
          </section>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50">
          <Link href="/" className="text-primary hover:underline text-sm">{t("common.back")}</Link>
        </div>
      </div>
    </div>
  );
}
