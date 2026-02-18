"use client";

import { useLocale } from "@/hooks/useLocale";
import { Scale } from "lucide-react";
import Link from "next/link";

export default function LicensingPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl theme-gradient flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{t("legal.licensingTitle")}</h1>
        </div>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">{t("legal.lastUpdated")}: 2026-02-01</p>
          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.licenseGrant")}</h2>
            <p>{t("legal.licenseGrantDesc")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.licenseOutput")}</h2>
            <p>{t("legal.licenseOutputDesc")}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.licenseRestrictions")}</h2>
            <p>{t("legal.licenseRestrictionsDesc")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("legal.licenseRestriction1")}</li>
              <li>{t("legal.licenseRestriction2")}</li>
              <li>{t("legal.licenseRestriction3")}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("legal.licenseCommercial")}</h2>
            <p>{t("legal.licenseCommercialDesc")}</p>
          </section>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50">
          <Link href="/" className="text-primary hover:underline text-sm">{t("common.back")}</Link>
        </div>
      </div>
    </div>
  );
}
