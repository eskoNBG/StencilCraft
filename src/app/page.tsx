"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Sparkles,
  Download,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Wand2,
  Palette,
  Image as ImageIcon,
  Clock,
  Check,
  X,
  Heart,
  Trash2,
  ChevronRight,
  Menu,
  X as XIcon,
  Info,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Stencil styles
const STENCIL_STYLES = [
  {
    id: "outline",
    name: "Kontur",
    description: "Klare, dünne Linien - perfekt für feine Tattoos",
    icon: "✏️",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "simple",
    name: "Minimalistisch",
    description: "Reduzierte Details - ideal für kleinere Tattoos",
    icon: " ○ ",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "detailed",
    name: "Detailliert",
    description: "Hoher Detailgrad - für realistische Motive",
    icon: "🎨",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "dotwork",
    name: "Dotwork",
    description: "Punktierte Linien - traditioneller Stil",
    icon: "◉",
    color: "from-green-500 to-teal-500",
  },
  {
    id: "geometric",
    name: "Geometrisch",
    description: "Geometrische Muster - moderner Look",
    icon: "◇",
    color: "from-rose-500 to-red-500",
  },
  {
    id: "traditional",
    name: "Traditional",
    description: "Klassischer Old School Stil",
    icon: "⚓",
    color: "from-indigo-500 to-violet-500",
  },
];

// Body placement options
const BODY_PLACEMENTS = [
  { id: "arm", name: "Arm", width: 300, height: 400 },
  { id: "back", name: "Rücken", width: 400, height: 500 },
  { id: "chest", name: "Brust", width: 350, height: 300 },
  { id: "leg", name: "Bein", width: 250, height: 450 },
  { id: "wrist", name: "Handgelenk", width: 200, height: 150 },
  { id: "neck", name: "Nacken", width: 250, height: 200 },
];

interface StencilResult {
  id: string;
  originalImage: string;
  stencilImage: string;
  style: string;
  lineThickness: number;
  contrast: number;
  inverted: boolean;
  createdAt: Date;
  isFavorite: boolean;
}

export default function Home() {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("outline");
  const [lineThickness, setLineThickness] = useState(2);
  const [contrast, setContrast] = useState(50);
  const [inverted, setInverted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<StencilResult | null>(null);
  const [gallery, setGallery] = useState<StencilResult[]>([]);
  const [activeTab, setActiveTab] = useState("create");
  const [zoom, setZoom] = useState(1);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load gallery from localStorage
  useEffect(() => {
    const savedGallery = localStorage.getItem("inkcraft_gallery");
    if (savedGallery) {
      try {
        setGallery(JSON.parse(savedGallery));
      } catch (e) {
        console.error("Failed to load gallery:", e);
      }
    }
  }, []);

  // Save gallery to localStorage
  useEffect(() => {
    localStorage.setItem("inkcraft_gallery", JSON.stringify(gallery));
  }, [gallery]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ungültiges Format",
        description: "Bitte laden Sie eine Bilddatei hoch (JPG, PNG, WEBP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Die Datei darf maximal 10MB groß sein",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setCurrentResult(null);
      setFlipH(false);
      setFlipV(false);
      setZoom(1);
      toast({
        title: "Bild hochgeladen",
        description: "Wählen Sie einen Stil und generieren Sie Ihr Stencil",
      });
    };
    reader.readAsDataURL(file);
  }, [toast]);

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
  }, []);

  const [statusMessage, setStatusMessage] = useState("");
  
  const generateStencil = async () => {
    if (!uploadedImage) {
      toast({
        title: "Kein Bild",
        description: "Bitte laden Sie zuerst ein Bild hoch",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatusMessage("Starte Generierung...");

    // Progress animation
    const progressMessages = [
      { progress: 15, message: "Initialisiere AI..." },
      { progress: 30, message: "Analysiere Stil..." },
      { progress: 50, message: "Generiere Stencil..." },
      { progress: 70, message: "Verarbeite Bild..." },
      { progress: 85, message: "Finalisiere..." },
    ];
    
    let messageIndex = 0;
    const progressInterval = setInterval(() => {
      if (messageIndex < progressMessages.length) {
        setProgress(progressMessages[messageIndex].progress);
        setStatusMessage(progressMessages[messageIndex].message);
        messageIndex++;
      }
    }, 4000);

    try {
      // Step 1: Start the generation job
      const startResponse = await fetch("/api/generate-stencil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: selectedStyle,
          lineThickness,
          contrast,
          inverted,
        }),
      });

      const startData = await startResponse.json();
      
      if (!startData.success || !startData.jobId) {
        throw new Error(startData.error || "Failed to start generation");
      }

      const jobId = startData.jobId;
      console.log("Job started:", jobId);
      setStatusMessage("Generiere Stencil...");

      // Step 2: Poll for results
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max (60 * 5s)
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const checkResponse = await fetch(`/api/generate-stencil?jobId=${jobId}`);
        const checkData = await checkResponse.json();
        
        if (checkData.status === "completed" && checkData.result) {
          clearInterval(progressInterval);
          setProgress(100);
          setStatusMessage("Fertig!");

          const result: StencilResult = {
            id: Date.now().toString(),
            originalImage: uploadedImage,
            stencilImage: checkData.result,
            style: selectedStyle,
            lineThickness,
            contrast,
            inverted,
            createdAt: new Date(),
            isFavorite: false,
          };

          setCurrentResult(result);
          setGallery((prev) => [result, ...prev]);

          toast({
            title: "Stencil erstellt!",
            description: "Ihr Tattoo-Stencil wurde erfolgreich generiert",
          });
          return;
        }
        
        if (checkData.status === "failed") {
          throw new Error(checkData.error || "Generation failed");
        }
        
        // Update progress while waiting
        setProgress(Math.min(90, 30 + attempts * 2));
        attempts++;
      }
      
      throw new Error("Zeitüberschreitung - bitte versuchen Sie es erneut");

    } catch (error) {
      clearInterval(progressInterval);
      
      let errorMessage = "Das Stencil konnte nicht erstellt werden.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setStatusMessage("");
      setTimeout(() => setProgress(0), 500);
    }
  };

  const downloadStencil = () => {
    if (!currentResult) return;

    const link = document.createElement("a");
    link.href = currentResult.stencilImage;
    link.download = `inkcraft-stencil-${currentResult.style}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download gestartet",
      description: "Das Stencil wird heruntergeladen",
    });
  };

  const toggleFavorite = (id: string) => {
    setGallery((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const deleteFromGallery = (id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Gelöscht",
      description: "Das Stencil wurde aus der Galerie entfernt",
    });
  };

  const getImageTransform = () => {
    let transform = `scale(${zoom})`;
    if (flipH) transform += " scaleX(-1)";
    if (flipV) transform += " scaleY(-1)";
    return transform;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  InkCraft AI
                </h1>
                <p className="text-xs text-muted-foreground">Tattoo Stencil Generator</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Button
                variant={activeTab === "create" ? "default" : "ghost"}
                onClick={() => setActiveTab("create")}
                className={activeTab === "create" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Erstellen
              </Button>
              <Button
                variant={activeTab === "gallery" ? "default" : "ghost"}
                onClick={() => setActiveTab("gallery")}
                className={activeTab === "gallery" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Galerie
                {gallery.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-300">
                    {gallery.length}
                  </Badge>
                )}
              </Button>
            </nav>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setActiveTab(activeTab === "create" ? "gallery" : "create")}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                  <div className="text-2xl font-bold text-purple-400">6</div>
                  <div className="text-sm text-muted-foreground">Stile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">30s</div>
                  <div className="text-sm text-muted-foreground">Ø Zeit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">∞</div>
                  <div className="text-sm text-muted-foreground">Kostenlos</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Upload Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-purple-400" />
                      Bild hochladen
                    </CardTitle>
                    <CardDescription>
                      JPG, PNG, WEBP bis 10MB
                    </CardDescription>
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
                        <div className="p-4">
                          <div className="relative aspect-square max-h-[500px] mx-auto overflow-hidden rounded-lg bg-black/20">
                            <img
                              src={currentResult?.stencilImage || uploadedImage}
                              alt="Preview"
                              className="w-full h-full object-contain"
                              style={{ transform: getImageTransform() }}
                            />
                            {currentResult && (
                              <Badge className="absolute top-2 right-2 bg-green-500/80">
                                <Check className="w-3 h-3 mr-1" />
                                Stencil
                              </Badge>
                            )}
                          </div>
                          {/* Image Controls */}
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                            >
                              <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground w-16 text-center">
                              {Math.round(zoom * 100)}%
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6 mx-2" />
                            <Button
                              variant={flipH ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFlipH(!flipH)}
                              className={flipH ? "bg-purple-600" : ""}
                            >
                              <FlipHorizontal className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={flipV ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFlipV(!flipV)}
                              className={flipV ? "bg-purple-600" : ""}
                            >
                              <FlipVertical className="w-4 h-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6 mx-2" />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setZoom(1);
                                setFlipH(false);
                                setFlipV(false);
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center py-16 cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                            <Upload className="w-10 h-10 text-purple-400" />
                          </div>
                          <p className="text-lg font-medium mb-2">
                            Bild hierher ziehen oder klicken
                          </p>
                          <p className="text-sm text-muted-foreground">
                            oder wählen Sie eine Datei aus
                          </p>
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

                {/* Generate Button */}
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
                        onClick={generateStencil}
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
                        <Button
                          onClick={downloadStencil}
                          variant="outline"
                          className="h-12 px-8 border-purple-500/50 hover:bg-purple-500/10"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Panel */}
              <div className="space-y-6">
                {/* Style Selection */}
                <Card className="glass border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-400" />
                      Stencil-Stil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {STENCIL_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${
                          selectedStyle === style.id
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-border hover:border-purple-500/30 hover:bg-purple-500/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{style.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{style.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {style.description}
                            </div>
                          </div>
                          {selectedStyle === style.id && (
                            <Check className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Advanced Settings */}
                <Card className="glass border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-400" />
                      Einstellungen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="lineThickness">Linienstärke</Label>
                        <span className="text-sm text-muted-foreground">{lineThickness}px</span>
                      </div>
                      <Slider
                        id="lineThickness"
                        min={1}
                        max={5}
                        step={0.5}
                        value={[lineThickness]}
                        onValueChange={(value) => setLineThickness(value[0])}
                        className="data-[slot=slider-track]:bg-purple-500/20 data-[slot=slider-range]:bg-purple-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="contrast">Kontrast</Label>
                        <span className="text-sm text-muted-foreground">{contrast}%</span>
                      </div>
                      <Slider
                        id="contrast"
                        min={0}
                        max={100}
                        step={5}
                        value={[contrast]}
                        onValueChange={(value) => setContrast(value[0])}
                        className="data-[slot=slider-track]:bg-purple-500/20 data-[slot=slider-range]:bg-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="inverted">Invertiert</Label>
                      <Switch
                        id="inverted"
                        checked={inverted}
                        onCheckedChange={setInverted}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
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
          /* Gallery Tab */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Ihre Galerie</h2>
              <p className="text-muted-foreground">
                Alle generierten Stencils werden hier gespeichert
              </p>
            </div>

            {gallery.length === 0 ? (
              <Card className="glass border-purple-500/20">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium mb-2">Keine Stencils vorhanden</p>
                  <p className="text-muted-foreground mb-4">
                    Generieren Sie Ihr erstes Stencil
                  </p>
                  <Button onClick={() => setActiveTab("create")} className="bg-purple-600 hover:bg-purple-700">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Stencil erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gallery.map((item) => (
                  <Card key={item.id} className="glass border-purple-500/20 overflow-hidden group">
                    <div className="relative aspect-square bg-black/20">
                      <img
                        src={item.stencilImage}
                        alt="Stencil"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = item.stencilImage;
                            link.download = `stencil-${item.id}.png`;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={item.isFavorite ? "default" : "secondary"}
                          onClick={() => toggleFavorite(item.id)}
                          className={item.isFavorite ? "bg-pink-600" : ""}
                        >
                          <Heart className={`w-4 h-4 ${item.isFavorite ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteFromGallery(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {item.isFavorite && (
                        <div className="absolute top-2 right-2">
                          <Heart className="w-5 h-5 text-pink-500 fill-current" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-purple-500/50">
                          {STENCIL_STYLES.find((s) => s.id === item.style)?.name || item.style}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("de-DE")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
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
              <span className="text-sm text-muted-foreground">
                Professionelle Tattoo-Stencils in Sekunden
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Made with ❤️ for Tattoo Artists</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Settings icon component
function Settings({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
