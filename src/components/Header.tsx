"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Image as ImageIcon, Menu } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  galleryCount: number;
}

export function Header({ activeTab, onTabChange, galleryCount }: HeaderProps) {
  return (
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
              onClick={() => onTabChange("create")}
              className={activeTab === "create" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Erstellen
            </Button>
            <Button
              variant={activeTab === "gallery" ? "default" : "ghost"}
              onClick={() => onTabChange("gallery")}
              className={activeTab === "gallery" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Galerie
              {galleryCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-300">
                  {galleryCount}
                </Badge>
              )}
            </Button>
          </nav>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => onTabChange(activeTab === "create" ? "gallery" : "create")}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
