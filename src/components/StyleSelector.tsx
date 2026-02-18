"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Check } from "lucide-react";
import { STENCIL_STYLES } from "@/lib/constants";

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

export function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  return (
    <Card className="glass border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          Stencil-Stil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {STENCIL_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`w-full p-3 rounded-lg border transition-all text-left ${
              selectedStyle === style.id
                ? "border-purple-500 bg-purple-500/10"
                : "border-border hover:border-purple-500/30 hover:bg-purple-500/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{style.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{style.name}</div>
                <div className="text-xs text-muted-foreground">
                  {style.description}
                </div>
              </div>
              {selectedStyle === style.id && (
                <Check className="w-5 h-5 text-purple-400" />
              )}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
