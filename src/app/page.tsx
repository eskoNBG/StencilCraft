"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Sparkles, Download, Wand2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useStencilGenerator } from "@/hooks/useStencilGenerator";
import { useGallery } from "@/hooks/useGallery";
import { Header } from "@/components/Header";
import { ImagePreview } from "@/components/ImagePreview";
import { StyleSelector } from "@/components/StyleSelector";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ExportDialog } from "@/components/ExportDialog";
import { GalleryView } from "@/components/GalleryView";

export default function Home() {
  const { toast } = useToast();
  const { isGenerating, progress, statusMessage, currentResult, setCurrentResult, generateStencil } = useStencilGenerator();
  const { gallery, addToGallery, toggleFavorite, deleteFromGallery } = useGallery();

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
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
      toast({ title: "Ungültiges Format", description: "Bitte laden Sie eine Bilddatei hoch (JPG, PNG, WEBP)", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Datei zu groß", description: "Die Datei darf maximal 10MB groß sein", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setCurrentResult(null);
      setFlipH(false);
      setFlipV(false);
      setZoom(1);
      toast({ title: "Bild hochgeladen", description: "Wählen Sie einen Stil und generieren Sie Ihr Stencil" });
    };
    reader.readAsDataURL(file);
  }, [toast, setCurrentResult]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setCurrentResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, [setCurrentResult]);

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) {
      toast({ title: "Kein Bild", description: "Bitte laden Sie zuerst ein Bild hoch", variant: "destructive" });
      return;
    }
    const result = await generateStencil({ uploadedImage, selectedStyle, lineThickness, contrast, inverted, lineColor, transparentBg });
    if (result) addToGallery(result);
  }, [uploadedImage, selectedStyle, lineThickness, contrast, inverted, lineColor, transparentBg, generateStencil, addToGallery]);

  const downloadStencil = useCallback(() => {
    if (!currentResult) return;
    const link = document.createElement("a");
    link.href = currentResult.stencilImage;
    link.download = `inkcraft-stencil-${currentResult.style}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download gestartet", description: "Das Stencil wird heruntergeladen" });
  }, [currentResult, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} galleryCount={gallery.length} />

      <main className="flex-1">
        {activeTab === "create" ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Verwandle jedes Foto in ein{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  perfektes Stencil
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professionelle Tattoo-Schablonen in Sekunden. Klarere Linien für bessere Tattoos und zufriedenere Kunden.
              </p>
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">5</div>
                  <div className="text-sm text-muted-foreground">Stile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">&lt;5s</div>
                  <div className="text-sm text-muted-foreground">Ø Zeit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">∞</div>
                  <div className="text-sm text-muted-foreground">Kostenlos</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Upload & Preview */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-purple-400" />
                      Bild hochladen
                    </CardTitle>
                    <CardDescription>JPG, PNG, WEBP bis 10MB</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                        uploadedImage
                          ? "border-purple-500/50 bg-purple-500/5"
                          : "border-border hover:border-purple-500/30 hover:bg-purple-500/5"
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
                          className="flex flex-col items-center justify-center py-16 cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                            <Upload className="w-10 h-10 text-purple-400" />
                          </div>
                          <p className="text-lg font-medium mb-2">Bild hierher ziehen oder klicken</p>
                          <p className="text-sm text-muted-foreground">oder wählen Sie eine Datei aus</p>
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
                          <span className="text-purple-300 font-medium">{statusMessage || "Generiere Stencil..."}</span>
                          <span className="text-purple-400">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-purple-500/20" />
                        <p className="text-xs text-muted-foreground text-center">
                          Dies kann 30-60 Sekunden dauern. Bitte warten...
                        </p>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg font-semibold disabled:opacity-70"
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                            Bitte warten...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5 mr-2" />
                            Stencil generieren
                          </>
                        )}
                      </Button>
                      {currentResult && (
                        <>
                          <Button
                            onClick={downloadStencil}
                            variant="outline"
                            className="h-12 px-6 border-purple-500/50 hover:bg-purple-500/10"
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
                        <p className="font-medium text-foreground">Pro-Tipp für Procreate:</p>
                        <p>Klicke auf &quot;Procreate&quot; für eine PSD-Datei mit Ebenen, die du direkt in Procreate öffnen kannst.</p>
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
                  lineColor={lineColor}
                  onLineColorChange={setLineColor}
                  lineThickness={lineThickness}
                  onLineThicknessChange={setLineThickness}
                  showComparison={showComparison}
                  onShowComparisonChange={setShowComparison}
                  hasResult={!!currentResult}
                />
                <Card className="glass border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Pro-Tipp</p>
                        <p>
                          Für beste Ergebnisse verwenden Sie Bilder mit klaren Kontrasten und
                          gut definierten Kanten. Portraits und einfache Motive funktionieren
                          am besten.
                        </p>
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

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">InkCraft AI</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">Professionelle Tattoo-Stencils in Sekunden</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Made for Tattoo Artists</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
