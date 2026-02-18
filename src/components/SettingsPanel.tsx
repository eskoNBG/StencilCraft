"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { LINE_COLORS } from "@/lib/constants";

interface SettingsPanelProps {
  transparentBg: boolean;
  onTransparentBgChange: (value: boolean) => void;
  lineColor: string;
  onLineColorChange: (color: string) => void;
  lineThickness: number;
  onLineThicknessChange: (value: number) => void;
  showComparison: boolean;
  onShowComparisonChange: (value: boolean) => void;
  hasResult: boolean;
}

export function SettingsPanel({
  transparentBg,
  onTransparentBgChange,
  lineColor,
  onLineColorChange,
  lineThickness,
  onLineThicknessChange,
  showComparison,
  onShowComparisonChange,
  hasResult,
}: SettingsPanelProps) {
  return (
    <Card className="glass border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Einstellungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transparent Background Toggle */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
          <div>
            <div className="font-medium">Transparenter Hintergrund</div>
            <div className="text-sm text-muted-foreground">Nur Linien - für einfaches Transferieren</div>
          </div>
          <Switch checked={transparentBg} onCheckedChange={onTransparentBgChange} />
        </div>

        {/* Line Color */}
        <div className="p-4 bg-zinc-800/50 rounded-xl">
          <div className="mb-3">
            <span className="font-medium">Linienfarbe</span>
            <div className="text-sm text-muted-foreground">Wähle die Farbe der Linien</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {LINE_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => onLineColorChange(color.value)}
                className={`p-3 rounded-lg flex items-center justify-center transition-all ${
                  lineColor === color.value
                    ? "bg-zinc-700 border-2 border-white"
                    : "bg-zinc-900 border-2 border-zinc-700 hover:bg-zinc-800"
                }`}
                title={color.name}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-400"
                  style={{ backgroundColor: color.value }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Line Thickness Slider */}
        <div className="p-4 bg-zinc-800/50 rounded-xl">
          <div className="mb-3">
            <span className="font-medium">Linienstärke</span>
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

        {/* Comparison Toggle */}
        {hasResult && (
          <div className="flex items-center justify-between">
            <div>
              <Label>Vergleichsansicht</Label>
              <p className="text-xs text-muted-foreground">Vorher/Nachher Slider</p>
            </div>
            <Switch checked={showComparison} onCheckedChange={onShowComparisonChange} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
