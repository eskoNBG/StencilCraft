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
import { HowItWorks } from "@/components/HowItWorks";
import { ShowcaseSection } from "@/components/ShowcaseSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import { TeamSection } from "@/components/TeamSection";
import { MobileAppTeaser } from "@/components/MobileAppTeaser";
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
              <HeroCarousel />
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
          <HowItWorks />
          <ShowcaseSection />
          <ImageTips />
          <SocialProof />
          <TeamSection />
          <MobileAppTeaser />
          <FAQSection />
        </>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold">{t("brand.name")}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{t("brand.tagline")}</p>
              {/* Social Links */}
              <div className="flex gap-3">
                <a href="https://instagram.com/stencilcraft" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label="Instagram">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://tiktok.com/@stencilcraft" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label="TikTok">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.97a8.27 8.27 0 004.76 1.5v-3.5a4.82 4.82 0 01-1-.28z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">{t("footer.product")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setActiveTab("create")} className="hover:text-primary transition-colors">{t("common.create")}</button></li>
                <li><button onClick={() => setActiveTab("gallery")} className="hover:text-primary transition-colors">{t("common.gallery")}</button></li>
                <li><a href="/pricing" className="hover:text-primary transition-colors">{t("pricing.nav")}</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">{t("footer.support")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">{t("footer.legal")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-primary transition-colors">{t("footer.privacy")}</a></li>
                <li><a href="/terms" className="hover:text-primary transition-colors">{t("footer.terms")}</a></li>
                <li><a href="/cookies" className="hover:text-primary transition-colors">{t("footer.cookiePolicy")}</a></li>
                <li><a href="/gdpr" className="hover:text-primary transition-colors">{t("footer.gdpr")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">{t("footer.more")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/licensing" className="hover:text-primary transition-colors">{t("footer.licensing")}</a></li>
                <li><a href="/refund" className="hover:text-primary transition-colors">{t("footer.refundPolicy")}</a></li>
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
