"use client";

import { useLocale } from "@/hooks/useLocale";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

export default function RefundPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl theme-gradient flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{t("legal.refundTitle")}</h1>
        </div>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">{t("legal.lastUpdated")}: 2026-02-01</p>
          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.refundPolicy")}</h2>
            <p>{t("legal.refundPolicyDesc")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.refundEligibility")}</h2>
            <p>{t("legal.refundEligibilityDesc")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.refundProcess")}</h2>
            <p>{t("legal.refundProcessDesc")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.refundExceptions")}</h2>
            <p>{t("legal.refundExceptionsDesc")}</p>
          </section>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50">
          <Link href="/" className="text-primary hover:underline text-sm">{t("common.back")}</Link>
        </div>
      </div>
    </div>
  );
}
