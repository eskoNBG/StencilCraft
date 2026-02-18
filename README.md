# InkCraft AI - Tattoo Stencil Generator

Eine professionelle AI-gestützte Tattoo-Stencil-Generator-Anwendung für Tattoo-Künstler.

## Features

- **6 Stencil-Stile**: Kontur, Minimalistisch, Detailliert, Dotwork, Geometrisch, Traditional
- **Anpassbare Einstellungen**: Linienstärke, Kontrast, Invertierung
- **Bildsteuerung**: Zoom, Spiegeln (Horizontal/Vertikal)
- **Galerie**: Speichern, Favorisieren und Download von Stencils
- **Responsive Design**: Optimiert für Desktop und Mobile

## Tech Stack

- **Framework**: Next.js 16 mit App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 mit shadcn/ui
- **Database**: Prisma ORM (SQLite)
- **AI**: z-ai-web-dev-sdk (VLM & Image Generation)

## Erste Schritte

```bash
# Dependencies installieren
bun install

# Datenbank initialisieren
bun run db:push

# Entwicklungsserver starten
bun run dev
```

## Umgebungsvoraussetzungen

Erstellen Sie eine `.env` Datei mit:

```env
DATABASE_URL="file:./db/custom.db"
```

## Projektstruktur

```
src/
├── app/
│   ├── api/
│   │   └── generate-stencil/    # API für Stencil-Generierung
│   ├── globals.css              # Globale Styles
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # Hauptseite
├── components/ui/               # shadcn/ui Komponenten
├── hooks/                       # React Hooks
└── lib/                         # Utilities
```

## Lizenz

MIT

---

Made with ❤️ for Tattoo Artists
