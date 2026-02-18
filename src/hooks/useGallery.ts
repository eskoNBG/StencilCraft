"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/hooks/useLocale";
import type { StencilResult } from "@/lib/types";

export function useGallery() {
  const { toast } = useToast();
  const { t } = useLocale();
  const { data: session } = useSession();
  const [gallery, setGallery] = useState<StencilResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isAuthenticated = !!session?.user;

  // Load gallery from server when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setGallery([]);
      setIsLoaded(true);
      return;
    }

    async function loadFromServer() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          setGallery(data);
        }
      } catch {
        console.error("Failed to load gallery from server");
      }
      setIsLoaded(true);
    }
    loadFromServer();
  }, [isAuthenticated]);

  const addToGallery = useCallback(async (item: StencilResult) => {
    if (!isAuthenticated) {
      // Not logged in - gallery not available
      return;
    }

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        const data = await res.json();
        setGallery((prev) => [{ ...item, id: data.id }, ...prev]);
      } else if (res.status === 403) {
        toast({
          title: t("gallery.full"),
          description: t("gallery.fullDesc", { max: 50 }),
        });
      }
    } catch {
      console.error("Failed to add to gallery");
    }
  }, [isAuthenticated, toast, t]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!isAuthenticated) return;

    setGallery((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );

    try {
      await fetch("/api/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Revert on failure
      setGallery((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
    }
  }, [isAuthenticated]);

  const deleteFromGallery = useCallback(async (id: string) => {
    if (!isAuthenticated) return;

    const previous = gallery;
    setGallery((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({
          title: t("gallery.deleted"),
          description: t("gallery.deletedDesc"),
        });
      } else {
        setGallery(previous);
      }
    } catch {
      setGallery(previous);
    }
  }, [isAuthenticated, gallery, toast, t]);

  return { gallery, isLoaded, requiresAuth: !isAuthenticated, addToGallery, toggleFavorite, deleteFromGallery };
}
