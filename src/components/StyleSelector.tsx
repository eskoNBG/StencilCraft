"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Check, Lock } from "lucide-react";
import { STENCIL_STYLES } from "@/lib/constants";
import { useLocale } from "@/hooks/useLocale";
import type { TranslationKey } from "@/lib/i18n";

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  userTier?: string;
}

const FREE_STYLES = ["outline", "simple"];

export function StyleSelector({ selectedStyle, onStyleChange, userTier = "free" }: StyleSelectorProps) {
  const { t } = useLocale();

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          {t("settings.stencilStyle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {STENCIL_STYLES.map((style) => {
          const isLocked = userTier === "free" && !FREE_STYLES.includes(style.id);

          return (
            <button
              key={style.id}
              onClick={() => !isLocked && onStyleChange(style.id)}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                isLocked
                  ? "border-border opacity-50 cursor-not-allowed"
                  : selectedStyle === style.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{style.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{t(`style.${style.id}` as TranslationKey)}</div>
                  <div className="text-xs text-muted-foreground">
                    {t(`style.${style.id}.desc` as TranslationKey)}
                  </div>
                </div>
                {isLocked ? (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                ) : selectedStyle === style.id ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : null}
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
