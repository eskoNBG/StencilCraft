"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getAllItems, putItem, deleteItem } from "@/lib/indexeddb";
import type { StencilResult } from "@/lib/types";

const MAX_GALLERY_ITEMS = 10;

export function useGallery() {
  const { toast } = useToast();
  const [gallery, setGallery] = useState<StencilResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from IndexedDB on mount, with one-time localStorage migration
  useEffect(() => {
    async function load() {
      try {
        // Migrate from localStorage if data exists
        const legacyData = localStorage.getItem("inkcraft_gallery");
        if (legacyData) {
          const parsed = JSON.parse(legacyData) as StencilResult[];
          for (const item of parsed) {
            await putItem(item.id, item);
          }
          localStorage.removeItem("inkcraft_gallery");
        }
      } catch {
        // Migration failed, not critical
      }

      try {
        const items = await getAllItems<StencilResult>();
        setGallery(items.slice(0, MAX_GALLERY_ITEMS));
      } catch {
        console.error("Failed to load gallery from IndexedDB");
      }
      setIsLoaded(true);
    }
    load();
  }, []);

  const addToGallery = useCallback(async (item: StencilResult) => {
    setGallery((prev) => [item, ...prev].slice(0, MAX_GALLERY_ITEMS));
    await putItem(item.id, item);
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    setGallery((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      const toggled = updated.find((item) => item.id === id);
      if (toggled) putItem(toggled.id, toggled);
      return updated;
    });
  }, []);

  const deleteFromGallery = useCallback(async (id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
    await deleteItem(id);
    toast({
      title: "Gelöscht",
      description: "Das Stencil wurde aus der Galerie entfernt",
    });
  }, [toast]);

  return { gallery, isLoaded, addToGallery, toggleFavorite, deleteFromGallery };
}
