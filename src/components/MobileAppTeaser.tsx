"use client";

import { Smartphone } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

export function MobileAppTeaser() {
  const { t } = useLocale();

  return (
    <section className="py-16 border-t border-border/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass rounded-2xl p-8 md:p-12 border-primary/10">
          <div className="w-16 h-16 rounded-2xl theme-gradient flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">{t("mobile.title")}</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            {t("mobile.desc")}
          </p>
          <div className="flex justify-center gap-4">
            <div className="px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm">
              <div className="text-[10px] text-muted-foreground">{t("mobile.comingSoon")}</div>
              <div className="font-semibold">App Store</div>
            </div>
            <div className="px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm">
              <div className="text-[10px] text-muted-foreground">{t("mobile.comingSoon")}</div>
              <div className="font-semibold">Google Play</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{t("mobile.launchDate")}</p>
        </div>
      </div>
    </section>
  );
}
