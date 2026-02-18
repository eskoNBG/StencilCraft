"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

const CATEGORIES = ["portrait", "nature", "animal", "realism"] as const;
const SHADING_MODES = ["hatching", "solid"] as const;

export function ShowcaseSection() {
  const { t } = useLocale();
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>("portrait");
  const [shadingMode, setShadingMode] = useState<typeof SHADING_MODES[number]>("hatching");

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

        {/* Shading Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-zinc-800/50 p-1">
            {SHADING_MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => setShadingMode(mode)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                  shadingMode === mode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`showcase.${mode}Mode` as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
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
                    {shadingMode === "hatching" ? (
                      <svg className="w-12 h-12 text-primary" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="4" y1="44" x2="44" y2="4" /><line x1="4" y1="36" x2="36" y2="4" />
                        <line x1="4" y1="28" x2="28" y2="4" /><line x1="4" y1="20" x2="20" y2="4" />
                        <line x1="4" y1="12" x2="12" y2="4" /><line x1="12" y1="44" x2="44" y2="12" />
                        <line x1="20" y1="44" x2="44" y2="20" /><line x1="28" y1="44" x2="44" y2="28" />
                        <line x1="36" y1="44" x2="44" y2="36" />
                      </svg>
                    ) : (
                      <svg className="w-12 h-12 text-primary" viewBox="0 0 48 48" fill="currentColor">
                        <circle cx="24" cy="24" r="18" opacity="0.3" />
                        <circle cx="24" cy="24" r="12" opacity="0.5" />
                        <circle cx="24" cy="24" r="6" opacity="0.8" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {shadingMode === "hatching" ? t("showcase.hatchingResult") : t("showcase.solidResult")}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-primary">
                {t("preview.stencil")} ({t(`showcase.${shadingMode}Mode` as any)})
              </span>
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
