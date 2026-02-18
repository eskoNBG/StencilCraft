"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Check,
} from "lucide-react";
import type { StencilResult } from "@/lib/types";
import { useLocale } from "@/hooks/useLocale";

interface ImagePreviewProps {
  uploadedImage: string;
  currentResult: StencilResult | null;
  showComparison: boolean;
  comparisonPosition: number;
  onComparisonPositionChange: (value: number) => void;
  originalOpacity: number;
  onOriginalOpacityChange: (value: number) => void;
  zoom: number;
  onZoomChange: (value: number) => void;
  flipH: boolean;
  onFlipHChange: (value: boolean) => void;
  flipV: boolean;
  onFlipVChange: (value: boolean) => void;
}

export function ImagePreview({
  uploadedImage,
  currentResult,
  showComparison,
  comparisonPosition,
  onComparisonPositionChange,
  originalOpacity,
  onOriginalOpacityChange,
  zoom,
  onZoomChange,
  flipH,
  onFlipHChange,
  flipV,
  onFlipVChange,
}: ImagePreviewProps) {
  const { t } = useLocale();

  const getImageTransform = () => {
    let transform = `scale(${zoom})`;
    if (flipH) transform += " scaleX(-1)";
    if (flipV) transform += " scaleY(-1)";
    return transform;
  };

  return (
    <div className="p-4">
      <div className="relative aspect-square max-h-[500px] mx-auto overflow-hidden rounded-lg bg-black/20">
        {/* Comparison Slider View */}
        {currentResult && showComparison ? (
          <div className="relative w-full h-full">
            <img
              src={uploadedImage}
              alt={t("preview.original")}
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                transform: getImageTransform(),
                opacity: originalOpacity / 100,
              }}
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - comparisonPosition}% 0 0)` }}
            >
              <img
                src={currentResult.stencilImage}
                alt={t("preview.stencil")}
                className="w-full h-full object-contain"
                style={{ transform: getImageTransform() }}
              />
            </div>
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
              style={{ left: `${comparisonPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-gray-400 rounded" />
                  <div className="w-1 h-4 bg-gray-400 rounded" />
                </div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={comparisonPosition}
              onChange={(e) => onComparisonPositionChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              aria-label={t("preview.comparisonAria")}
            />
            <Badge className="absolute top-2 left-2 bg-primary/80">{t("preview.original")}</Badge>
            <Badge className="absolute top-2 right-2 bg-green-500/80">
              <Check className="w-3 h-3 mr-1" />
              {t("preview.stencil")}
            </Badge>
          </div>
        ) : (
          <>
            <img
              src={currentResult?.stencilImage || uploadedImage}
              alt="Preview"
              className="w-full h-full object-contain"
              style={{ transform: getImageTransform() }}
            />
            {currentResult && (
              <Badge className="absolute top-2 right-2 bg-green-500/80">
                <Check className="w-3 h-3 mr-1" />
                {t("preview.stencil")}
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Original Opacity Slider */}
      {currentResult && showComparison && (
        <div className="flex items-center gap-3 mt-4 px-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
          </svg>
          <span className="text-xs text-muted-foreground min-w-[80px]">{t("preview.originalOpacity")}</span>
          <Slider
            min={0}
            max={100}
            step={10}
            value={[originalOpacity]}
            onValueChange={(value) => onOriginalOpacityChange(value[0])}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground min-w-[3rem] text-right font-mono">{originalOpacity}%</span>
        </div>
      )}

      {/* Image Controls */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button variant="outline" size="sm" aria-label={t("preview.zoomOut")} onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground w-16 text-center" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="outline" size="sm" aria-label={t("preview.zoomIn")} onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Button
          variant={flipH ? "default" : "outline"}
          size="sm"
          aria-label={t("preview.flipH")}
          aria-pressed={flipH}
          onClick={() => onFlipHChange(!flipH)}
          className={flipH ? "bg-primary" : ""}
        >
          <FlipHorizontal className="w-4 h-4" />
        </Button>
        <Button
          variant={flipV ? "default" : "outline"}
          size="sm"
          aria-label={t("preview.flipV")}
          aria-pressed={flipV}
          onClick={() => onFlipVChange(!flipV)}
          className={flipV ? "bg-primary" : ""}
        >
          <FlipVertical className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Button
          variant="outline"
          size="sm"
          aria-label={t("preview.reset")}
          onClick={() => {
            onZoomChange(1);
            onFlipHChange(false);
            onFlipVChange(false);
          }}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
