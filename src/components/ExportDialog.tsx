"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, FileImage, Layers, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  PAPER_SIZES,
  createPsdWithLayers,
  exportAsPng,
  downloadFile,
  generateFilename,
  type PaperSizeKey,
  type DPIOption,
  type ExportOptions,
} from "@/lib/psd-export";
import type { StencilResult } from "@/lib/types";

interface ExportDialogProps {
  currentResult: StencilResult;
  uploadedImage: string;
}

export function ExportDialog({ currentResult, uploadedImage }: ExportDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exportPaperSize, setExportPaperSize] = useState<PaperSizeKey>("original");
  const [exportDpi, setExportDpi] = useState<DPIOption>(300);
  const [exportFormat, setExportFormat] = useState<"png" | "psd">("png");
  const [exportIncludeOriginal, setExportIncludeOriginal] = useState(true);
  const [exportIncludeStencil, setExportIncludeStencil] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        paperSize: exportPaperSize,
        dpi: exportDpi,
        format: exportFormat,
        includeOriginal: exportIncludeOriginal,
        includeStencil: exportIncludeStencil,
      };

      if (exportFormat === "psd") {
        const psdBuffer = await createPsdWithLayers(uploadedImage, currentResult.stencilImage, options);
        const blob = new Blob([psdBuffer], { type: "image/vnd.adobe.photoshop" });
        downloadFile(blob, generateFilename("psd", currentResult.style));
        toast({
          title: "PSD exportiert!",
          description: "Die Datei kann direkt in Procreate geöffnet werden",
        });
      } else {
        const blob = await exportAsPng(currentResult.stencilImage, options);
        downloadFile(blob, generateFilename("png", currentResult.style));
        toast({
          title: "PNG exportiert!",
          description: `${PAPER_SIZES[exportPaperSize].name} @ ${exportDpi} DPI`,
        });
      }

      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-12 px-6 border-pink-500/50 hover:bg-pink-500/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10"
        >
          <Layers className="w-5 h-5 mr-2" />
          Procreate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-zinc-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Layers className="w-5 h-5 text-purple-400" />
            Export für Procreate
          </DialogTitle>
          <DialogDescription>
            PSD-Datei mit Ebenen für nahtlose Procreate-Integration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat("png")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exportFormat === "png"
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-zinc-700 hover:border-purple-500/50"
                }`}
              >
                <FileImage className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <div className="font-medium">PNG</div>
                <div className="text-xs text-muted-foreground">Einzeldatei</div>
              </button>
              <button
                onClick={() => setExportFormat("psd")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exportFormat === "psd"
                    ? "border-pink-500 bg-pink-500/20"
                    : "border-zinc-700 hover:border-pink-500/50"
                }`}
              >
                <Layers className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                <div className="font-medium">PSD</div>
                <div className="text-xs text-muted-foreground">Mit Ebenen</div>
              </button>
            </div>
          </div>

          {/* Paper Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Papierformat</Label>
            <Select value={exportPaperSize} onValueChange={(v) => setExportPaperSize(v as PaperSizeKey)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {Object.entries(PAPER_SIZES).map(([key, size]) => (
                  <SelectItem key={key} value={key}>
                    {size.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DPI Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Auflösung (DPI)</Label>
            <div className="grid grid-cols-3 gap-3">
              {([72, 150, 300] as DPIOption[]).map((dpi) => (
                <button
                  key={dpi}
                  onClick={() => setExportDpi(dpi)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    exportDpi === dpi
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-zinc-700 hover:border-purple-500/50"
                  }`}
                >
                  <div className="font-bold">{dpi}</div>
                  <div className="text-xs text-muted-foreground">
                    {dpi === 72 ? "Web" : dpi === 150 ? "Mittel" : "Print"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Layer Options (PSD only) */}
          {exportFormat === "psd" && (
            <div className="space-y-3 p-4 bg-zinc-800/50 rounded-xl">
              <Label className="text-sm font-medium">Ebenen</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stencil-Ebene</span>
                  <Switch checked={exportIncludeStencil} onCheckedChange={setExportIncludeStencil} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Original-Ebene (Referenz)</span>
                  <Switch checked={exportIncludeOriginal} onCheckedChange={setExportIncludeOriginal} />
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || (exportFormat === "psd" && !exportIncludeStencil && !exportIncludeOriginal)}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isExporting ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Wird exportiert...
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5 mr-2" />
                {exportFormat === "psd" ? "PSD exportieren" : "PNG exportieren"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
