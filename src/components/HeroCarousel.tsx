"use client";

import { useState, useEffect } from "react";
import { Wand2 } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

const STYLES = ["Outline", "Simple", "Detailed", "Hatching", "Solid"];

export function HeroCarousel() {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STYLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-10 mb-4">
      <div className="flex justify-center gap-3 overflow-x-auto pb-2">
        {STYLES.map((style, i) => (
          <button
            key={style}
            onClick={() => setActiveIndex(i)}
            className={`flex-shrink-0 rounded-xl border-2 transition-all duration-300 ${
              activeIndex === i
                ? "border-primary scale-105 shadow-lg shadow-primary/20"
                : "border-border/30 opacity-60 hover:opacity-80"
            }`}
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-zinc-800/50 flex flex-col items-center justify-center gap-2">
              <Wand2 className={`w-8 h-8 ${activeIndex === i ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${activeIndex === i ? "text-primary" : "text-muted-foreground"}`}>
                {style}
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-4">
        {STYLES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              activeIndex === i ? "bg-primary w-6" : "bg-zinc-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
