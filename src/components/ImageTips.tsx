"use client";

import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

export function ImageTips() {
  const { t } = useLocale();

  const doTips = [
    t("tips.do1"),
    t("tips.do2"),
    t("tips.do3"),
    t("tips.do4"),
  ];

  const dontTips = [
    t("tips.dont1"),
    t("tips.dont2"),
    t("tips.dont3"),
    t("tips.dont4"),
  ];

  return (
    <section className="py-16 border-t border-border/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gradient-from)]/20 to-[var(--gradient-to)]/20 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">{t("tips.title")}</h2>
          <p className="text-muted-foreground">{t("tips.subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* DO */}
          <div className="glass rounded-xl p-6 border-green-500/20">
            <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5" />
              {t("tips.doTitle")}
            </h3>
            <ul className="space-y-3">
              {doTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* DON'T */}
          <div className="glass rounded-xl p-6 border-red-500/20">
            <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5" />
              {t("tips.dontTitle")}
            </h3>
            <ul className="space-y-3">
              {dontTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
