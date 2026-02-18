"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { ColorPicker } from "@/components/ColorPicker";
import { useLocale } from "@/hooks/useLocale";

interface SettingsPanelProps {
  transparentBg: boolean;
  onTransparentBgChange: (value: boolean) => void;
  inverted: boolean;
  onInvertedChange: (value: boolean) => void;
  lineColor: string;
  onLineColorChange: (color: string) => void;
  lineThickness: number;
  onLineThicknessChange: (value: number) => void;
  contrast: number;
  onContrastChange: (value: number) => void;
  showComparison: boolean;
  onShowComparisonChange: (value: boolean) => void;
  hasResult: boolean;
}

export function SettingsPanel({
  transparentBg,
  onTransparentBgChange,
  inverted,
  onInvertedChange,
  lineColor,
  onLineColorChange,
  lineThickness,
  onLineThicknessChange,
  contrast,
  onContrastChange,
  showComparison,
  onShowComparisonChange,
  hasResult,
}: SettingsPanelProps) {
  const { t } = useLocale();

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          {t("common.settings")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transparent Background Toggle */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
          <div>
            <div className="font-medium">{t("settings.transparentBg")}</div>
            <div className="text-sm text-muted-foreground">{t("settings.transparentBgDesc")}</div>
          </div>
          <Switch checked={transparentBg} onCheckedChange={onTransparentBgChange} />
        </div>

        {/* Inverted Toggle */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
          <div>
            <div className="font-medium">{t("settings.inverted")}</div>
            <div className="text-sm text-muted-foreground">{t("settings.invertedDesc")}</div>
          </div>
          <Switch checked={inverted} onCheckedChange={onInvertedChange} />
        </div>

        {/* Color Picker */}
        <ColorPicker value={lineColor} onChange={onLineColorChange} />

        {/* Line Thickness Slider */}
        <div className="p-4 bg-zinc-800/50 rounded-xl">
          <div className="mb-3">
            <span className="font-medium">{t("settings.lineThickness")}</span>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              min={1}
              max={5}
              step={1}
              value={[lineThickness]}
              onValueChange={(value) => onLineThicknessChange(value[0])}
              className="flex-1"
            />
            <span className="text-sm font-mono bg-zinc-700/50 rounded-md px-3 py-1 min-w-[3rem] text-center">
              {lineThickness}px
            </span>
          </div>
        </div>

        {/* Contrast Slider */}
        <div className="p-4 bg-zinc-800/50 rounded-xl">
          <div className="mb-3">
            <span className="font-medium">{t("settings.contrast")}</span>
            <div className="text-sm text-muted-foreground">{t("settings.contrastDesc")}</div>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              min={0}
              max={100}
              step={5}
              value={[contrast]}
              onValueChange={(value) => onContrastChange(value[0])}
              className="flex-1"
            />
            <span className="text-sm font-mono bg-zinc-700/50 rounded-md px-3 py-1 min-w-[3rem] text-center">
              {contrast}%
            </span>
          </div>
        </div>

        {/* Comparison Toggle */}
        {hasResult && (
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("settings.comparison")}</Label>
              <p className="text-xs text-muted-foreground">{t("settings.comparisonDesc")}</p>
            </div>
            <Switch checked={showComparison} onCheckedChange={onShowComparisonChange} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
