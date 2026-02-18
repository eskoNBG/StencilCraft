"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { LINE_COLORS } from "@/lib/constants";
import { useLocale } from "@/hooks/useLocale";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { t } = useLocale();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isPreset = LINE_COLORS.some((c) => c.value === value);

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  return (
    <div className="p-4 bg-zinc-800/50 rounded-xl">
      <div className="mb-3">
        <span className="font-medium">{t("settings.lineColor")}</span>
        <div className="text-sm text-muted-foreground">{t("settings.lineColorDesc")}</div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {LINE_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className={`p-3 rounded-lg flex items-center justify-center transition-all ${
              value === color.value
                ? "bg-zinc-700 border-2 border-white"
                : "bg-zinc-900 border-2 border-zinc-700 hover:bg-zinc-800"
            }`}
            title={t(color.nameKey)}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-400"
              style={{ backgroundColor: color.value }}
            />
          </button>
        ))}
        <button
          onClick={() => colorInputRef.current?.click()}
          className={`p-3 rounded-lg flex items-center justify-center transition-all ${
            !isPreset
              ? "bg-zinc-700 border-2 border-white"
              : "bg-zinc-900 border-2 border-zinc-700 hover:bg-zinc-800"
          }`}
          title={t("settings.customColor")}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center"
            style={{ backgroundColor: !isPreset ? value : "transparent" }}
          >
            {isPreset && <Plus className="w-4 h-4 text-gray-400" />}
          </div>
        </button>
      </div>
      <input
        ref={colorInputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      <div className="mt-3 flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full border border-zinc-600"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={handleHexInput}
          placeholder="#000000"
          className="bg-zinc-700/50 rounded-md px-3 py-1 text-sm font-mono w-24 border border-zinc-600 focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );
}
