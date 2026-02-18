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
  FileImage,
  Layers,
  FileDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
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

// Stencil styles - Professional quality with AI enhancement
const STENCIL_STYLES = [
  {
    id: "outline",
    name: "Outline",
    description: "Klare Umrisse - perfekt für feine Tattoos",
    icon: "✏️",
    thumbnail: "outline",
    aiEnhanced: false,
  },
  {
    id: "simple",
    name: "Simple",
    description: "Reduzierte Details - ideal für kleinere Tattoos",
    icon: "○",
    thumbnail: "simple",
    aiEnhanced: false,
  },
  {
    id: "detailed",
    name: "Detailed",
    description: "Hoher Detailgrad - für realistische Motive",
    icon: "🎨",
    thumbnail: "detailed",
    aiEnhanced: false,
  },
  {
    id: "hatching",
    name: "Hatching",
    description: "AI-verstärkte professionelle Schraffur",
    icon: "▤",
    thumbnail: "hatching",
    aiEnhanced: true,
  },
  {
    id: "solid",
    name: "Solid",
    description: "AI-verstärkte flächige Schattierungen",
    icon: "▣",
    thumbnail: "solid",
    aiEnhanced: true,
  },
];

// Preset line colors - Simple selection like TattoostencilPro
const LINE_COLORS = [
  { value: "#000000", name: "Schwarz" },
  { value: "#dc2626", name: "Rot" },
  { value: "#2563eb", name: "Blau" },
  { value: "#16a34a", name: "Grün" },
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
  const [lineThickness, setLineThickness] = useState(3);
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
  
  // New state for color and background
  const [lineColor, setLineColor] = useState("#000000");
  const [transparentBg, setTransparentBg] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [comparisonPosition, setComparisonPosition] = useState(50); // 0-100, position of slider
  const [originalOpacity, setOriginalOpacity] = useState(100); // Opacity of original image in comparison

  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportPaperSize, setExportPaperSize] = useState<PaperSizeKey>("original");
  const [exportDpi, setExportDpi] = useState<DPIOption>(300);
  const [exportFormat, setExportFormat] = useState<"png" | "psd">("png");
  const [exportIncludeOriginal, setExportIncludeOriginal] = useState(true);
  const [exportIncludeStencil, setExportIncludeStencil] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Maximum gallery items to prevent localStorage quota issues
  const MAX_GALLERY_ITEMS = 10;

  // Load gallery from localStorage
  useEffect(() => {
    try {
      const savedGallery = localStorage.getItem("inkcraft_gallery");
      if (savedGallery) {
        const parsed = JSON.parse(savedGallery);
        // Limit to max items on load
        setGallery(parsed.slice(0, MAX_GALLERY_ITEMS));
      }
    } catch (e) {
      console.error("Failed to load gallery:", e);
      // Clear corrupted data
      localStorage.removeItem("inkcraft_gallery");
    }
  }, []);

  // Save gallery to localStorage with error handling
  useEffect(() => {
    try {
      // Limit gallery size before saving
      const limitedGallery = gallery.slice(0, MAX_GALLERY_ITEMS);
      localStorage.setItem("inkcraft_gallery", JSON.stringify(limitedGallery));
    } catch (e) {
      // If quota exceeded, remove oldest items
      console.warn("localStorage quota exceeded, clearing old items");
      try {
        // Keep only 5 most recent items
        const reducedGallery = gallery.slice(0, 5);
        localStorage.setItem("inkcraft_gallery", JSON.stringify(reducedGallery));
        setGallery(reducedGallery);
      } catch (e2) {
        // If still failing, clear gallery
        localStorage.removeItem("inkcraft_gallery");
      }
    }
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
      // Step 1: Start the generation job with the uploaded image
      const startResponse = await fetch("/api/generate-stencil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,  // Pass the uploaded image!
          style: selectedStyle,
          lineThickness,
          contrast,
          inverted,
          lineColor,
          transparentBg,
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
            originalImage: "", // Don't store original to save space
            stencilImage: checkData.result,
            style: selectedStyle,
            lineThickness,
            contrast,
            inverted,
            createdAt: new Date(),
            isFavorite: false,
          };

          setCurrentResult(result);
          // Add to gallery and limit to max items
          setGallery((prev) => [result, ...prev].slice(0, MAX_GALLERY_ITEMS));

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

  // Advanced export function for Procreate and high-res
  const handleAdvancedExport = async () => {
    if (!currentResult || !uploadedImage) return;

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
        // Create PSD with layers
        const psdBuffer = await createPsdWithLayers(uploadedImage, currentResult.stencilImage, options);
        const blob = new Blob([psdBuffer], { type: "image/vnd.adobe.photoshop" });
        downloadFile(blob, generateFilename("psd", currentResult.style));
        
        toast({
          title: "PSD exportiert!",
          description: "Die Datei kann direkt in Procreate geöffnet werden",
        });
      } else {
        // Export as PNG
        const blob = await exportAsPng(currentResult.stencilImage, options);
        downloadFile(blob, generateFilename("png", currentResult.style));
        
        toast({
          title: "PNG exportiert!",
          description: `${PAPER_SIZES[exportPaperSize].name} @ ${exportDpi} DPI`,
        });
      }

      setShowExportDialog(false);
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
                            {/* Comparison Slider View */}
                            {currentResult && showComparison ? (
                              <div className="relative w-full h-full">
                                {/* Before Image (Original) with opacity control */}
                                <img
                                  src={uploadedImage}
                                  alt="Original"
                                  className="absolute inset-0 w-full h-full object-contain"
                                  style={{ 
                                    transform: getImageTransform(),
                                    opacity: originalOpacity / 100 
                                  }}
                                />
                                
                                {/* After Image (Stencil) with clip */}
                                <div 
                                  className="absolute inset-0 overflow-hidden"
                                  style={{ clipPath: `inset(0 ${100 - comparisonPosition}% 0 0)` }}
                                >
                                  <img
                                    src={currentResult.stencilImage}
                                    alt="Stencil"
                                    className="w-full h-full object-contain"
                                    style={{ transform: getImageTransform() }}
                                  />
                                </div>
                                
                                {/* Slider */}
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
                                
                                {/* Slider track for interaction */}
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={comparisonPosition}
                                  onChange={(e) => setComparisonPosition(Number(e.target.value))}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                                />
                                
                                {/* Labels */}
                                <Badge className="absolute top-2 left-2 bg-purple-500/80">
                                  Original
                                </Badge>
                                <Badge className="absolute top-2 right-2 bg-green-500/80">
                                  <Check className="w-3 h-3 mr-1" />
                                  Stencil
                                </Badge>
                              </div>
                            ) : (
                              /* Normal single image view */
                              <img
                                src={currentResult?.stencilImage || uploadedImage}
                                alt="Preview"
                                className="w-full h-full object-contain"
                                style={{ transform: getImageTransform() }}
                              />
                            )}
                            
                            {currentResult && !showComparison && (
                              <Badge className="absolute top-2 right-2 bg-green-500/80">
                                <Check className="w-3 h-3 mr-1" />
                                Stencil
                              </Badge>
                            )}
                          </div>
                          
                          {/* Original Opacity Slider - Like TattoostencilPro */}
                          {currentResult && showComparison && (
                            <div className="flex items-center gap-3 mt-4 px-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
                                <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path>
                                <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path>
                                <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>
                              </svg>
                              <span className="text-xs text-muted-foreground min-w-[80px]">Original Deckkraft</span>
                              <Slider
                                min={0}
                                max={100}
                                step={10}
                                value={[originalOpacity]}
                                onValueChange={(value) => setOriginalOpacity(value[0])}
                                className="flex-1"
                              />
                              <span className="text-xs text-muted-foreground min-w-[3rem] text-right font-mono">{originalOpacity}%</span>
                            </div>
                          )}
                          
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
                        <>
                          {/* Quick Download Button */}
                          <Button
                            onClick={downloadStencil}
                            variant="outline"
                            className="h-12 px-6 border-purple-500/50 hover:bg-purple-500/10"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            PNG
                          </Button>
                          {/* Advanced Export Dialog */}
                          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
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
                                        <Switch
                                          checked={exportIncludeStencil}
                                          onCheckedChange={setExportIncludeStencil}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm">Original-Ebene (Referenz)</span>
                                        <Switch
                                          checked={exportIncludeOriginal}
                                          onCheckedChange={setExportIncludeOriginal}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Export Button */}
                                <Button
                                  onClick={handleAdvancedExport}
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
                        </>
                      )}
                    </div>
                    
                    {/* Procreate Tip - Like TattoostencilPro */}
                    {currentResult && (
                      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-zinc-800/50 rounded-lg">
                        <p className="font-medium text-foreground">💡 Pro-Tipp für Procreate:</p>
                        <p>Klicke auf "Procreate" für eine PSD-Datei mit Ebenen, die du direkt in Procreate öffnen kannst.</p>
                      </div>
                    )}
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

                {/* Advanced Settings - Simplified like TattoostencilPro */}
                <Card className="glass border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-400" />
                      Einstellungen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Transparent Background Toggle - Like TattoostencilPro */}
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div>
                        <div className="font-medium">Transparenter Hintergrund</div>
                        <div className="text-sm text-muted-foreground">Nur Linien - für einfaches Transferieren</div>
                      </div>
                      <Switch
                        id="transparentBg"
                        checked={transparentBg}
                        onCheckedChange={setTransparentBg}
                      />
                    </div>
                    
                    {/* Line Color - Simple 4 color selection like TattoostencilPro */}
                    <div className="p-4 bg-zinc-800/50 rounded-xl">
                      <div className="mb-3">
                        <span className="font-medium">Linienfarbe</span>
                        <div className="text-sm text-muted-foreground">Wähle die Farbe der Linien</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {LINE_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setLineColor(color.value)}
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
                          id="lineThickness"
                          min={1}
                          max={5}
                          step={1}
                          value={[lineThickness]}
                          onValueChange={(value) => setLineThickness(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono bg-zinc-700/50 rounded-md px-3 py-1 min-w-[3rem] text-center">{lineThickness}px</span>
                      </div>
                    </div>
                    
                    {/* Comparison Toggle */}
                    {currentResult && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Vergleichsansicht</Label>
                          <p className="text-xs text-muted-foreground">Vorher/Nachher Slider</p>
                        </div>
                        <Switch
                          checked={showComparison}
                          onCheckedChange={setShowComparison}
                        />
                      </div>
                    )}
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
