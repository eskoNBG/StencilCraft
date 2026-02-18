"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/hooks/useLocale";
import type { StencilResult } from "@/lib/types";

interface GenerateParams {
  uploadedImage: string;
  selectedStyle: string;
  lineThickness: number;
  contrast: number;
  inverted: boolean;
  lineColor: string;
  transparentBg: boolean;
}

/** Convert a base64 data URL to a File object for FormData upload */
function dataURLtoFile(dataURL: string, filename: string): File {
  const [header, base64] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

export function useStencilGenerator() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentResult, setCurrentResult] = useState<StencilResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const generateStencil = useCallback(async (params: GenerateParams): Promise<StencilResult | null> => {
    // Abort any previous in-flight generation
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    setIsGenerating(true);
    setProgress(0);
    setStatusMessage(t("gen.starting"));

    // Animated progress messages
    const progressMessages = [
      { progress: 15, message: t("gen.initAI") },
      { progress: 30, message: t("gen.analyzingStyle") },
      { progress: 50, message: t("gen.generating") },
      { progress: 70, message: t("gen.processing") },
      { progress: 85, message: t("gen.finalizing") },
    ];

    let messageIndex = 0;
    const progressInterval = setInterval(() => {
      if (messageIndex < progressMessages.length) {
        setProgress(progressMessages[messageIndex].progress);
        setStatusMessage(progressMessages[messageIndex].message);
        messageIndex++;
      }
    }, 4000);

    // Clear interval on abort
    signal.addEventListener("abort", () => clearInterval(progressInterval));

    try {
      // Build FormData for efficient binary upload
      const formData = new FormData();
      formData.append("image", dataURLtoFile(params.uploadedImage, "upload.png"));
      formData.append("style", params.selectedStyle);
      formData.append("lineThickness", params.lineThickness.toString());
      formData.append("contrast", params.contrast.toString());
      formData.append("inverted", params.inverted.toString());
      formData.append("lineColor", params.lineColor);
      formData.append("transparentBg", params.transparentBg.toString());

      const startResponse = await fetch("/api/generate-stencil", {
        method: "POST",
        body: formData,
        signal,
      });

      const startData = await startResponse.json();

      if (startResponse.status === 429) {
        const retryAfter = startResponse.headers.get("Retry-After");
        throw new Error(
          retryAfter
            ? t("gen.rateLimitWait", { seconds: retryAfter })
            : t("gen.rateLimitGeneric")
        );
      }

      if (!startData.success || !startData.jobId) {
        throw new Error(startData.error || "Failed to start generation");
      }

      const jobId = startData.jobId;
      setStatusMessage(t("gen.generating"));

      // Wait for result via SSE stream
      const result = await new Promise<StencilResult>((resolve, reject) => {
        const eventSource = new EventSource(`/api/generate-stencil?jobId=${jobId}&stream=1`);

        // Abort handler: close SSE when cancelled
        const onAbort = () => {
          eventSource.close();
          reject(new DOMException("Aborted", "AbortError"));
        };
        signal.addEventListener("abort", onAbort);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.status === "completed" && data.result) {
              eventSource.close();
              signal.removeEventListener("abort", onAbort);

              clearInterval(progressInterval);
              setProgress(100);
              setStatusMessage(t("gen.done"));

              const stencilResult: StencilResult = {
                id: Date.now().toString(),
                originalImage: "",
                stencilImage: data.result,
                style: params.selectedStyle,
                lineThickness: params.lineThickness,
                contrast: params.contrast,
                inverted: params.inverted,
                createdAt: new Date(),
                isFavorite: false,
              };

              setCurrentResult(stencilResult);
              resolve(stencilResult);
              return;
            }

            if (data.status === "failed") {
              eventSource.close();
              signal.removeEventListener("abort", onAbort);
              reject(new Error(data.error || "Generation failed"));
              return;
            }

            // Still processing — update progress smoothly
          } catch {
            // Ignore parse errors on individual messages
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          signal.removeEventListener("abort", onAbort);
          reject(new Error(t("gen.connectionLost")));
        };
      });

      toast({
        title: t("gen.success"),
        description: t("gen.successDesc"),
      });
      return result;

    } catch (error) {
      clearInterval(progressInterval);

      // Don't show error toast if user intentionally aborted
      if (error instanceof DOMException && error.name === "AbortError") {
        return null;
      }

      toast({
        title: t("gen.error"),
        description: error instanceof Error ? error.message : t("gen.errorDesc"),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
      setStatusMessage("");
      setTimeout(() => setProgress(0), 500);
    }
  }, [toast, t]);

  const cancelGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { isGenerating, progress, statusMessage, currentResult, setCurrentResult, generateStencil, cancelGeneration };
}
