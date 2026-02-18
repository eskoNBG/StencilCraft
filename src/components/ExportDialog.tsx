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
import { Sparkles, FileImage, Layers, FileDown, FileType } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/hooks/useLocale";
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
import { convertToSvg, downloadSvg } from "@/lib/svg-export";
import type { StencilResult } from "@/lib/types";

interface ExportDialogProps {
  currentResult: StencilResult;
  uploadedImage: string;
}

export function ExportDialog({ currentResult, uploadedImage }: ExportDialogProps) {
  const { toast } = useToast();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [exportPaperSize, setExportPaperSize] = useState<PaperSizeKey>("original");
  const [exportDpi, setExportDpi] = useState<DPIOption>(300);
  const [exportFormat, setExportFormat] = useState<"png" | "psd" | "svg">("png");
  const [exportIncludeOriginal, setExportIncludeOriginal] = useState(true);
  const [exportIncludeStencil, setExportIncludeStencil] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === "svg") {
        const svgString = await convertToSvg(currentResult.stencilImage);
        downloadSvg(svgString, generateFilename("svg", currentResult.style));
        toast({
          title: t("export.svgSuccess"),
          description: t("export.svgSuccessDesc"),
        });
      } else if (exportFormat === "psd") {
        const options: ExportOptions = {
          paperSize: exportPaperSize,
          dpi: exportDpi,
          format: "psd",
          includeOriginal: exportIncludeOriginal,
          includeStencil: exportIncludeStencil,
        };
        const psdBuffer = await createPsdWithLayers(uploadedImage, currentResult.stencilImage, options);
        const blob = new Blob([psdBuffer], { type: "image/vnd.adobe.photoshop" });
        downloadFile(blob, generateFilename("psd", currentResult.style));
        toast({
          title: t("export.psdSuccess"),
          description: t("export.psdSuccessDesc"),
        });
      } else {
        const options: ExportOptions = {
          paperSize: exportPaperSize,
          dpi: exportDpi,
          format: "png",
          includeOriginal: exportIncludeOriginal,
          includeStencil: exportIncludeStencil,
        };
        const blob = await exportAsPng(currentResult.stencilImage, options);
        downloadFile(blob, generateFilename("png", currentResult.style));
        toast({
          title: t("export.pngSuccess"),
          description: `${PAPER_SIZES[exportPaperSize].name} @ ${exportDpi} DPI`,
        });
      }

      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t("export.error"),
        description: t("export.errorDesc"),
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
          className="h-12 px-6 border-primary/50 hover:bg-primary/10"
        >
          <Layers className="w-5 h-5 mr-2" />
          {t("export.title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-zinc-900 border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Layers className="w-5 h-5 text-primary" />
            {t("export.title")}
          </DialogTitle>
          <DialogDescription>
            {t("export.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t("export.format")}</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportFormat("png")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exportFormat === "png"
                    ? "border-primary bg-primary/20"
                    : "border-zinc-700 hover:border-primary/50"
                }`}
              >
                <FileImage className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="font-medium text-sm">PNG</div>
                <div className="text-xs text-muted-foreground">{t("export.singleFile")}</div>
              </button>
              <button
                onClick={() => setExportFormat("psd")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exportFormat === "psd"
                    ? "border-primary bg-primary/20"
                    : "border-zinc-700 hover:border-primary/50"
                }`}
              >
                <Layers className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="font-medium text-sm">PSD</div>
                <div className="text-xs text-muted-foreground">{t("export.withLayers")}</div>
              </button>
              <button
                onClick={() => setExportFormat("svg")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exportFormat === "svg"
                    ? "border-primary bg-primary/20"
                    : "border-zinc-700 hover:border-primary/50"
                }`}
              >
                <FileType className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="font-medium text-sm">SVG</div>
                <div className="text-xs text-muted-foreground">{t("export.vector")}</div>
              </button>
            </div>
          </div>

          {/* Paper Size & DPI (not for SVG) */}
          {exportFormat !== "svg" && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("export.paperSize")}</Label>
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

              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("export.resolution")}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {([72, 150, 300] as DPIOption[]).map((dpi) => (
                    <button
                      key={dpi}
                      onClick={() => setExportDpi(dpi)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        exportDpi === dpi
                          ? "border-primary bg-primary/20"
                          : "border-zinc-700 hover:border-primary/50"
                      }`}
                    >
                      <div className="font-bold">{dpi}</div>
                      <div className="text-xs text-muted-foreground">
                        {dpi === 72 ? t("export.web") : dpi === 150 ? t("export.medium") : t("export.print")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Layer Options (PSD only) */}
          {exportFormat === "psd" && (
            <div className="space-y-3 p-4 bg-zinc-800/50 rounded-xl">
              <Label className="text-sm font-medium">{t("export.layers")}</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t("export.stencilLayer")}</span>
                  <Switch checked={exportIncludeStencil} onCheckedChange={setExportIncludeStencil} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t("export.originalLayer")}</span>
                  <Switch checked={exportIncludeOriginal} onCheckedChange={setExportIncludeOriginal} />
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || (exportFormat === "psd" && !exportIncludeStencil && !exportIncludeOriginal)}
            className="w-full h-12 bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] hover:opacity-90"
          >
            {isExporting ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                {t("export.exporting")}
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5 mr-2" />
                {exportFormat === "psd"
                  ? t("export.exportPsd")
                  : exportFormat === "svg"
                  ? t("export.exportSvg")
                  : t("export.exportPng")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
