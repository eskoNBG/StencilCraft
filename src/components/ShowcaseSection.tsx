"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

const CATEGORIES = ["portrait", "nature", "animal", "realism"] as const;

export function ShowcaseSection() {
  const { t } = useLocale();
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>("portrait");

  const showcaseData: Record<typeof CATEGORIES[number], { desc: string }> = {
    portrait: { desc: t("showcase.portraitDesc") },
    nature: { desc: t("showcase.natureDesc") },
    animal: { desc: t("showcase.animalDesc") },
    realism: { desc: t("showcase.realismDesc") },
  };

  return (
    <section id="results" className="py-16 border-t border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gradient-from)]/20 to-[var(--gradient-to)]/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">{t("showcase.title")}</h2>
          <p className="text-muted-foreground">{t("showcase.subtitle")}</p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
              }`}
            >
              {t(`showcase.${cat}` as any)}
            </button>
          ))}
        </div>

        {/* Showcase Display */}
        <div className="glass rounded-2xl p-8 border-primary/10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Before */}
            <div className="text-center">
              <div className="aspect-square rounded-xl bg-zinc-800/50 border border-border/50 flex items-center justify-center mb-3 overflow-hidden">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-600 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl opacity-50">📸</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t("showcase.originalPhoto")}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t("preview.original")}</span>
            </div>

            {/* After */}
            <div className="text-center">
              <div className="aspect-square rounded-xl bg-zinc-800/50 border border-primary/20 flex items-center justify-center mb-3 overflow-hidden">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--gradient-from)]/20 to-[var(--gradient-to)]/20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">✏️</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t("showcase.stencilResult")}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-primary">{t("preview.stencil")}</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {showcaseData[activeCategory].desc}
          </p>
          <p className="text-center text-xs text-muted-foreground/60 mt-2">
            {t("showcase.uploadNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
