"use client";

import { Upload, Palette, Download } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

export function HowItWorks() {
  const { t } = useLocale();

  const steps = [
    {
      icon: Upload,
      step: "1",
      title: t("hiw.step1Title"),
      desc: t("hiw.step1Desc"),
    },
    {
      icon: Palette,
      step: "2",
      title: t("hiw.step2Title"),
      desc: t("hiw.step2Desc"),
    },
    {
      icon: Download,
      step: "3",
      title: t("hiw.step3Title"),
      desc: t("hiw.step3Desc"),
    },
  ];

  return (
    <section id="how-it-works" className="py-16 border-t border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">{t("hiw.title")}</h2>
          <p className="text-muted-foreground">{t("hiw.subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="text-center group">
              <div className="relative mx-auto mb-6">
                <div className="w-16 h-16 rounded-2xl theme-gradient flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <s.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                  {s.step}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              {i < 2 && (
                <div className="hidden md:block absolute-arrow" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
