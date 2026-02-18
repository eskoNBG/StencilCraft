"use client";

import { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Sparkles, Download, Wand2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStencilGenerator } from "@/hooks/useStencilGenerator";
import { useGallery } from "@/hooks/useGallery";
import { Header } from "@/components/Header";
import { ImagePreview } from "@/components/ImagePreview";
import { StyleSelector } from "@/components/StyleSelector";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ExportDialog } from "@/components/ExportDialog";
import { GalleryView } from "@/components/GalleryView";
import { CropDialog } from "@/components/CropDialog";
import { FAQSection } from "@/components/FAQSection";
import { SocialProof } from "@/components/SocialProof";
import { ImageTips } from "@/components/ImageTips";
import { useLocale } from "@/hooks/useLocale";

export default function Home() {
  const { toast } = useToast();
  const { t } = useLocale();
  const { data: session } = useSession();
  const { isGenerating, progress, statusMessage, currentResult, setCurrentResult, generateStencil } = useStencilGenerator();
  const { gallery, addToGallery, toggleFavorite, deleteFromGallery } = useGallery();

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [rawUploadedImage, setRawUploadedImage] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings state
  const [selectedStyle, setSelectedStyle] = useState("outline");
  const [lineThickness, setLineThickness] = useState(3);
  const [contrast, setContrast] = useState(50);
  const [inverted, setInverted] = useState(false);
  const [lineColor, setLineColor] = useState("#000000");
  const [transparentBg, setTransparentBg] = useState(false);

  // View state
  const [activeTab, setActiveTab] = useState("create");
  const [zoom, setZoom] = useState(1);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [comparisonPosition, setComparisonPosition] = useState(50);
  const [originalOpacity, setOriginalOpacity] = useState(100);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: t("upload.invalidFormat"), description: t("upload.invalidFormatDesc"), variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t("upload.tooLarge"), description: t("upload.tooLargeDesc"), variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setRawUploadedImage(imageData);
      setShowCropDialog(true);
      setCurrentResult(null);
    };
    reader.readAsDataURL(file);
  }, [toast, setCurrentResult, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setRawUploadedImage(imageData);
        setShowCropDialog(true);
        setCurrentResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, [setCurrentResult]);

  const handleCropComplete = useCallback((croppedImage: string) => {
    setUploadedImage(croppedImage);
    setRawUploadedImage(null);
    setShowCropDialog(false);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    toast({ title: t("upload.success"), description: t("upload.successDesc") });
  }, [toast, t]);

  const handleCropSkip = useCallback(() => {
    setUploadedImage(rawUploadedImage);
    setRawUploadedImage(null);
    setShowCropDialog(false);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    toast({ title: t("upload.success"), description: t("upload.successDesc") });
  }, [rawUploadedImage, toast, t]);

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) {
      toast({ title: t("upload.noImage"), description: t("upload.noImageDesc"), variant: "destructive" });
      return;
    }
    const result = await generateStencil({ uploadedImage, selectedStyle, lineThickness, contrast, inverted, lineColor, transparentBg });
    if (result) addToGallery(result);
  }, [uploadedImage, selectedStyle, lineThickness, contrast, inverted, lineColor, transparentBg, generateStencil, addToGallery, t]);

  const downloadStencil = useCallback(() => {
    if (!currentResult) return;
    const link = document.createElement("a");
    link.href = currentResult.stencilImage;
    link.download = `stencilcraft-stencil-${currentResult.style}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: t("gen.downloadStarted"), description: t("gen.downloadDesc") });
  }, [currentResult, toast, t]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} galleryCount={gallery.length} />

      {/* Crop Dialog */}
      {rawUploadedImage && (
        <CropDialog
          image={rawUploadedImage}
          open={showCropDialog}
          onCropComplete={handleCropComplete}
          onSkip={handleCropSkip}
        />
      )}

      <main className="flex-1">
        {activeTab === "create" ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {t("hero.title1")}
                <span className="theme-gradient-text">
                  {t("hero.titleHighlight")}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("hero.subtitle")}
              </p>
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">5</div>
                  <div className="text-sm text-muted-foreground">{t("hero.styles")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">&lt;5s</div>
                  <div className="text-sm text-muted-foreground">{t("hero.avgTime")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">&infin;</div>
                  <div className="text-sm text-muted-foreground">{t("hero.free")}</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Upload & Preview */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-primary" />
                      {t("upload.title")}
                    </CardTitle>
                    <CardDescription>{t("upload.subtitle")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                        uploadedImage
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-primary/5"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {uploadedImage ? (
                        <ImagePreview
                          uploadedImage={uploadedImage}
                          currentResult={currentResult}
                          showComparison={showComparison}
                          comparisonPosition={comparisonPosition}
                          onComparisonPositionChange={setComparisonPosition}
                          originalOpacity={originalOpacity}
                          onOriginalOpacityChange={setOriginalOpacity}
                          zoom={zoom}
                          onZoomChange={setZoom}
                          flipH={flipH}
                          onFlipHChange={setFlipH}
                          flipV={flipV}
                          onFlipVChange={setFlipV}
                        />
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center py-16 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
                          role="button"
                          tabIndex={0}
                          aria-label={t("upload.dropzoneAria")}
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              fileInputRef.current?.click();
                            }
                          }}
                        >
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--gradient-from)]/20 to-[var(--gradient-to)]/20 flex items-center justify-center mb-4">
                            <Upload className="w-10 h-10 text-primary" />
                          </div>
                          <p className="text-lg font-medium mb-2">{t("upload.dropzone")}</p>
                          <p className="text-sm text-muted-foreground">{t("upload.dropzoneAlt")}</p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Generate & Export Buttons */}
                {uploadedImage && (
                  <div className="space-y-4">
                    {isGenerating && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-primary font-medium">{statusMessage || t("gen.generating")}</span>
                          <span className="text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-primary/20" />
                        <p className="text-xs text-muted-foreground text-center">
                          {t("gen.waitMessage")}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 h-12 bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] hover:opacity-90 text-lg font-semibold disabled:opacity-70"
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                            {t("gen.pleaseWait")}
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5 mr-2" />
                            {t("common.generate")}
                          </>
                        )}
                      </Button>
                      {currentResult && (
                        <>
                          <Button
                            onClick={downloadStencil}
                            variant="outline"
                            className="h-12 px-6 border-primary/50 hover:bg-primary/10"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            PNG
                          </Button>
                          <ExportDialog currentResult={currentResult} uploadedImage={uploadedImage} />
                        </>
                      )}
                    </div>

                    {currentResult && (
                      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-zinc-800/50 rounded-lg">
                        <p className="font-medium text-foreground">{t("tip.procreateTitle")}</p>
                        <p>{t("tip.procreateDesc")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Settings Panel */}
              <div className="space-y-6">
                <StyleSelector selectedStyle={selectedStyle} onStyleChange={setSelectedStyle} />
                <SettingsPanel
                  transparentBg={transparentBg}
                  onTransparentBgChange={setTransparentBg}
                  inverted={inverted}
                  onInvertedChange={setInverted}
                  lineColor={lineColor}
                  onLineColorChange={setLineColor}
                  lineThickness={lineThickness}
                  onLineThicknessChange={setLineThickness}
                  contrast={contrast}
                  onContrastChange={setContrast}
                  showComparison={showComparison}
                  onShowComparisonChange={setShowComparison}
                  hasResult={!!currentResult}
                />
                <Card className="glass border-primary/20 bg-gradient-to-br from-[var(--gradient-from)]/10 to-[var(--gradient-to)]/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">{t("common.proTip")}</p>
                        <p>{t("tip.bestResults")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <GalleryView
            gallery={gallery}
            onToggleFavorite={toggleFavorite}
            onDelete={deleteFromGallery}
            onSwitchToCreate={() => setActiveTab("create")}
          />
        )}
      </main>

      {/* Landing Page Sections (only on create tab) */}
      {activeTab === "create" && (
        <>
          <ImageTips />
          <SocialProof />
          <FAQSection />
        </>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold">{t("brand.name")}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("brand.tagline")}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">{t("footer.product")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setActiveTab("create")} className="hover:text-primary transition-colors">{t("common.create")}</button></li>
                <li><button onClick={() => setActiveTab("gallery")} className="hover:text-primary transition-colors">{t("common.gallery")}</button></li>
                <li><a href="/pricing" className="hover:text-primary transition-colors">{t("pricing.nav")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">{t("footer.legal")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-primary transition-colors">{t("footer.privacy")}</a></li>
                <li><a href="/terms" className="hover:text-primary transition-colors">{t("footer.terms")}</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} StencilCraft. {t("footer.rights")}</p>
            <p className="text-xs text-muted-foreground">{t("footer.madeFor")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
