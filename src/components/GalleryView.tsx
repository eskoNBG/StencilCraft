"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Wand2, Download, Heart, Trash2 } from "lucide-react";
import { STENCIL_STYLES } from "@/lib/constants";
import type { StencilResult } from "@/lib/types";

interface GalleryViewProps {
  gallery: StencilResult[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onSwitchToCreate: () => void;
}

export function GalleryView({ gallery, onToggleFavorite, onDelete, onSwitchToCreate }: GalleryViewProps) {
  return (
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
            <Button onClick={onSwitchToCreate} className="bg-purple-600 hover:bg-purple-700">
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
                    onClick={() => onToggleFavorite(item.id)}
                    className={item.isFavorite ? "bg-pink-600" : ""}
                  >
                    <Heart className={`w-4 h-4 ${item.isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
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
  );
}
