"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Wand2, Download, Heart, Trash2, LogIn, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { STENCIL_STYLES } from "@/lib/constants";
import { useLocale } from "@/hooks/useLocale";
import type { TranslationKey } from "@/lib/i18n";
import type { StencilResult } from "@/lib/types";
import Link from "next/link";

interface GalleryViewProps {
  gallery: StencilResult[];
  isLoading?: boolean;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onSwitchToCreate: () => void;
}

function GallerySkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="glass border-primary/20 rounded-lg overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="p-3 flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GalleryCard({
  item,
  onToggleFavorite,
  onDelete,
}: {
  item: StencilResult;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { locale, t } = useLocale();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const styleName = STENCIL_STYLES.find((s) => s.id === item.style)?.id;

  return (
    <Card className="glass border-primary/20 overflow-hidden group">
      <div className="relative aspect-square bg-black/20">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
          </div>
        ) : (
          <img
            src={item.stencilImage}
            alt={styleName ? t(`style.${styleName}` as TranslationKey) : item.style}
            className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            aria-label={t("gallery.download")}
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
            aria-label={item.isFavorite ? t("gallery.removeFav") : t("gallery.addFav")}
            onClick={() => onToggleFavorite(item.id)}
            className={item.isFavorite ? "bg-pink-600" : ""}
          >
            <Heart className={`w-4 h-4 ${item.isFavorite ? "fill-current" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            aria-label={t("gallery.deleteStencil")}
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
          <Badge variant="outline" className="border-primary/50">
            {styleName ? t(`style.${styleName}` as TranslationKey) : item.style}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function AuthGate() {
  const { t } = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="glass border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl theme-gradient flex items-center justify-center mb-4 opacity-50">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium mb-2">{t("gallery.authRequired")}</p>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            {t("gallery.authRequiredDesc")}
          </p>
          <Link href="/auth/signin">
            <Button className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]">
              <LogIn className="w-4 h-4 mr-2" />
              {t("auth.signIn")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export function GalleryView({ gallery, isLoading, onToggleFavorite, onDelete, onSwitchToCreate }: GalleryViewProps) {
  const { t } = useLocale();
  const { data: session } = useSession();

  // Auth gate: gallery requires login
  if (!session?.user) {
    return <AuthGate />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{t("gallery.title")}</h2>
        <p className="text-muted-foreground">{t("gallery.subtitle")}</p>
      </div>

      {isLoading ? (
        <GallerySkeleton />
      ) : gallery.length === 0 ? (
        <Card className="glass border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium mb-2">{t("gallery.empty")}</p>
            <p className="text-muted-foreground mb-4">{t("gallery.emptyDesc")}</p>
            <Button onClick={onSwitchToCreate} className="bg-primary hover:bg-primary/90">
              <Wand2 className="w-4 h-4 mr-2" />
              {t("gallery.createStencil")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gallery.map((item) => (
            <GalleryCard key={item.id} item={item} onToggleFavorite={onToggleFavorite} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
