"use client";

import { THEMES, type ThemeId } from "@/lib/themes";
import { useLocale } from "@/hooks/useLocale";
import { Check } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

interface ThemeSelectorProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              value === theme.id
                ? "border-white bg-zinc-800"
                : "border-zinc-700 hover:border-zinc-500"
            }`}
          >
            <div
              className="w-10 h-10 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
              }}
            />
            <span className="text-xs font-medium">
              {t(theme.nameKey as TranslationKey)}
            </span>
            {value === theme.id && (
              <Check className="absolute top-1 right-1 w-4 h-4 text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
