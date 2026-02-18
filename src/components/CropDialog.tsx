"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crop, SkipForward, ZoomIn } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

interface CropDialogProps {
  image: string;
  open: boolean;
  onCropComplete: (croppedImage: string) => void;
  onSkip: () => void;
}

export function CropDialog({ image, open, onCropComplete, onSkip }: CropDialogProps) {
  const { t } = useLocale();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropDone = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const croppedImage = await getCroppedImage(image, croppedAreaPixels);
    onCropComplete(croppedImage);
  }, [image, croppedAreaPixels, onCropComplete]);

  return (
    <Dialog open={open} onOpenChange={() => onSkip()}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-primary" />
            {t("crop.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-[400px] bg-black rounded-lg overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropDone}
          />
        </div>

        <div className="flex items-center gap-3">
          <ZoomIn className="w-4 h-4 text-muted-foreground" />
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={([v]) => setZoom(v)}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground font-mono w-12 text-right">
            {zoom.toFixed(1)}x
          </span>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onSkip}>
            <SkipForward className="w-4 h-4 mr-2" />
            {t("crop.skip")}
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] hover:opacity-90"
          >
            <Crop className="w-4 h-4 mr-2" />
            {t("crop.apply")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function getCroppedImage(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return canvas.toDataURL("image/png");
}
