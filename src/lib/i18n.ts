export type Locale = "de" | "en";

const translations = {
  de: {
    // Common
    "common.generate": "Stencil generieren",
    "common.download": "Download",
    "common.delete": "L\u00F6schen",
    "common.cancel": "Abbrechen",
    "common.retry": "Erneut versuchen",
    "common.create": "Erstellen",
    "common.gallery": "Galerie",
    "common.settings": "Einstellungen",
    "common.proTip": "Pro-Tipp",
    "common.back": "Zur\u00FCck",

    // Brand
    "brand.name": "StencilCraft",
    "brand.subtitle": "Tattoo Stencil Generator",
    "brand.tagline": "Professionelle Tattoo-Stencils in Sekunden",

    // Hero
    "hero.title1": "Verwandle jedes Foto in ein ",
    "hero.titleHighlight": "perfektes Stencil",
    "hero.subtitle": "Professionelle Tattoo-Schablonen in Sekunden. Klarere Linien f\u00FCr bessere Tattoos und zufriedenere Kunden.",
    "hero.styles": "Stile",
    "hero.avgTime": "\u00D8 Zeit",
    "hero.free": "Kostenlos",

    // Upload
    "upload.title": "Bild hochladen",
    "upload.subtitle": "JPG, PNG, WEBP bis 10MB",
    "upload.dropzone": "Bild hierher ziehen oder klicken",
    "upload.dropzoneAlt": "oder w\u00E4hlen Sie eine Datei aus",
    "upload.dropzoneAria": "Bild hochladen \u2014 klicken oder Datei hierher ziehen",
    "upload.invalidFormat": "Ung\u00FCltiges Format",
    "upload.invalidFormatDesc": "Bitte laden Sie eine Bilddatei hoch (JPG, PNG, WEBP)",
    "upload.tooLarge": "Datei zu gro\u00DF",
    "upload.tooLargeDesc": "Die Datei darf maximal 10MB gro\u00DF sein",
    "upload.success": "Bild hochgeladen",
    "upload.successDesc": "W\u00E4hlen Sie einen Stil und generieren Sie Ihr Stencil",
    "upload.noImage": "Kein Bild",
    "upload.noImageDesc": "Bitte laden Sie zuerst ein Bild hoch",

    // Generator
    "gen.starting": "Starte Generierung...",
    "gen.initAI": "Initialisiere AI...",
    "gen.analyzingStyle": "Analysiere Stil...",
    "gen.generating": "Generiere Stencil...",
    "gen.processing": "Verarbeite Bild...",
    "gen.finalizing": "Finalisiere...",
    "gen.done": "Fertig!",
    "gen.pleaseWait": "Bitte warten...",
    "gen.waitMessage": "Dies kann 30-60 Sekunden dauern. Bitte warten...",
    "gen.success": "Stencil erstellt!",
    "gen.successDesc": "Ihr Tattoo-Stencil wurde erfolgreich generiert",
    "gen.error": "Fehler",
    "gen.errorDesc": "Das Stencil konnte nicht erstellt werden.",
    "gen.connectionLost": "Verbindung zum Server verloren",
    "gen.rateLimitWait": "Zu viele Anfragen. Bitte warte {seconds} Sekunden.",
    "gen.rateLimitGeneric": "Zu viele Anfragen. Bitte warte einen Moment.",
    "gen.downloadStarted": "Download gestartet",
    "gen.downloadDesc": "Das Stencil wird heruntergeladen",

    // Settings
    "settings.transparentBg": "Transparenter Hintergrund",
    "settings.transparentBgDesc": "Nur Linien - f\u00FCr einfaches Transferieren",
    "settings.inverted": "Invertiert",
    "settings.invertedDesc": "Helle Linien auf dunklem Grund",
    "settings.lineColor": "Linienfarbe",
    "settings.lineColorDesc": "W\u00E4hle die Farbe der Linien",
    "settings.customColor": "Benutzerdefiniert",
    "settings.lineThickness": "Linienst\u00E4rke",
    "settings.contrast": "Kontrast",
    "settings.contrastDesc": "St\u00E4rke der Kantenerkennung",
    "settings.comparison": "Vergleichsansicht",
    "settings.comparisonDesc": "Vorher/Nachher Slider",
    "settings.stencilStyle": "Stencil-Stil",

    // Styles
    "style.outline": "Outline",
    "style.outline.desc": "Klare Umrisse - perfekt f\u00FCr feine Tattoos",
    "style.simple": "Simple",
    "style.simple.desc": "Reduzierte Details - ideal f\u00FCr kleinere Tattoos",
    "style.detailed": "Detailed",
    "style.detailed.desc": "Hoher Detailgrad - f\u00FCr realistische Motive",
    "style.hatching": "Hatching",
    "style.hatching.desc": "AI-verst\u00E4rkte professionelle Schraffur",
    "style.solid": "Solid",
    "style.solid.desc": "AI-verst\u00E4rkte fl\u00E4chige Schattierungen",

    // Colors
    "color.black": "Schwarz",
    "color.red": "Rot",
    "color.blue": "Blau",
    "color.green": "Gr\u00FCn",

    // Gallery
    "gallery.title": "Ihre Galerie",
    "gallery.subtitle": "Alle generierten Stencils werden hier gespeichert",
    "gallery.empty": "Keine Stencils vorhanden",
    "gallery.emptyDesc": "Generieren Sie Ihr erstes Stencil",
    "gallery.createStencil": "Stencil erstellen",
    "gallery.deleted": "Gel\u00F6scht",
    "gallery.deletedDesc": "Das Stencil wurde aus der Galerie entfernt",
    "gallery.full": "Galerie voll",
    "gallery.fullDesc": "Maximal {max} Stencils \u2014 \u00E4lteste wurden entfernt",
    "gallery.download": "Stencil herunterladen",
    "gallery.addFav": "Zu Favoriten hinzuf\u00FCgen",
    "gallery.removeFav": "Aus Favoriten entfernen",
    "gallery.deleteStencil": "Stencil l\u00F6schen",
    "gallery.authRequired": "Anmeldung erforderlich",
    "gallery.authRequiredDesc": "Melden Sie sich an, um Ihre Galerie zu nutzen. Speichern Sie Stencils, markieren Sie Favoriten und greifen Sie von \u00FCberall auf Ihre Sammlung zu.",

    // Export
    "export.title": "Export",
    "export.subtitle": "PSD-Datei mit Ebenen f\u00FCr nahtlose Procreate-Integration",
    "export.format": "Format",
    "export.singleFile": "Einzeldatei",
    "export.withLayers": "Mit Ebenen",
    "export.vector": "Vektor",
    "export.paperSize": "Papierformat",
    "export.resolution": "Aufl\u00F6sung (DPI)",
    "export.web": "Web",
    "export.medium": "Mittel",
    "export.print": "Print",
    "export.layers": "Ebenen",
    "export.stencilLayer": "Stencil-Ebene",
    "export.originalLayer": "Original-Ebene (Referenz)",
    "export.exporting": "Wird exportiert...",
    "export.exportPsd": "PSD exportieren",
    "export.exportPng": "PNG exportieren",
    "export.exportSvg": "SVG exportieren",
    "export.psdSuccess": "PSD exportiert!",
    "export.psdSuccessDesc": "Die Datei kann direkt in Procreate ge\u00F6ffnet werden",
    "export.pngSuccess": "PNG exportiert!",
    "export.svgSuccess": "SVG exportiert!",
    "export.svgSuccessDesc": "Perfekt f\u00FCr Schneidemaschinen und skalierbare Ausgabe",
    "export.error": "Export fehlgeschlagen",
    "export.errorDesc": "Bitte versuchen Sie es erneut",

    // Preview
    "preview.original": "Original",
    "preview.stencil": "Stencil",
    "preview.comparisonAria": "Vergleichsposition zwischen Original und Stencil",
    "preview.originalOpacity": "Original Deckkraft",
    "preview.zoomOut": "Verkleinern",
    "preview.zoomIn": "Vergr\u00F6\u00DFern",
    "preview.flipH": "Horizontal spiegeln",
    "preview.flipV": "Vertikal spiegeln",
    "preview.reset": "Ansicht zur\u00FCcksetzen",

    // Crop
    "crop.title": "Bild zuschneiden",
    "crop.apply": "Zuschnitt anwenden",
    "crop.skip": "\u00DCberspringen",

    // Auth
    "auth.signIn": "Anmelden",
    "auth.signUp": "Registrieren",
    "auth.signOut": "Abmelden",
    "auth.signInDesc": "Melden Sie sich bei StencilCraft an",
    "auth.signUpDesc": "Erstellen Sie Ihr StencilCraft-Konto",
    "auth.email": "E-Mail",
    "auth.password": "Passwort",
    "auth.name": "Name",
    "auth.orContinueWith": "Oder weiter mit",
    "auth.noAccount": "Noch kein Konto?",
    "auth.hasAccount": "Bereits ein Konto?",
    "auth.invalidCredentials": "Ung\u00FCltige Anmeldedaten",
    "auth.signingIn": "Anmeldung...",
    "auth.signingUp": "Registrierung...",
    "auth.signUpError": "Registrierung fehlgeschlagen",
    "auth.signInRequired": "Bitte melden Sie sich an",

    // Account
    "account.title": "Konto",
    "account.profile": "Profil",
    "account.theme": "Farbthema",
    "account.subscription": "Abonnement",

    // Themes
    "theme.purple": "Violett",
    "theme.blue": "Blau",
    "theme.green": "Gr\u00FCn",
    "theme.rose": "Rose",
    "theme.amber": "Gold",

    // Pricing
    "pricing.nav": "Preise",
    "pricing.title": "Preise",
    "pricing.subtitle": "W\u00E4hlen Sie den Plan, der zu Ihnen passt",
    "pricing.free": "Kostenlos",
    "pricing.freePrice": "Kostenlos",
    "pricing.pro": "Pro",
    "pricing.studio": "Studio",
    "pricing.perMonth": "/Monat",
    "pricing.getStarted": "Loslegen",
    "pricing.subscribe": "Abonnieren",
    "pricing.currentPlan": "Aktueller Plan",
    "pricing.upgrade": "Upgrade",
    "pricing.feat.stencilsDay": "{count} Stencils/Tag",
    "pricing.feat.stencilsMonth": "{count} Stencils/Monat",
    "pricing.feat.unlimited": "Unbegrenzte Stencils",
    "pricing.feat.basicStyles": "Outline & Simple Stile",
    "pricing.feat.allStyles": "Alle 5 Stile",
    "pricing.feat.gallery": "Cloud-Galerie",
    "pricing.feat.svgExport": "SVG-Export",
    "pricing.feat.psdExport": "PSD-Export (Procreate)",
    "pricing.feat.pngExport": "PNG-Export",
    "pricing.feat.priority": "Priorit\u00E4ts-Verarbeitung",

    // Pro Tips
    "tip.procreateTitle": "Pro-Tipp f\u00FCr Procreate:",
    "tip.procreateDesc": "Klicke auf \"Export\" f\u00FCr eine PSD-Datei mit Ebenen, die du direkt in Procreate \u00F6ffnen kannst.",
    "tip.bestResults": "F\u00FCr beste Ergebnisse verwenden Sie Bilder mit klaren Kontrasten und gut definierten Kanten. Portraits und einfache Motive funktionieren am besten.",

    // Error page
    "error.title": "Etwas ist schiefgelaufen",
    "error.description": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",

    // Footer
    "footer.madeFor": "Made for Tattoo Artists",
  },

  en: {
    // Common
    "common.generate": "Generate Stencil",
    "common.download": "Download",
    "common.delete": "Delete",
    "common.cancel": "Cancel",
    "common.retry": "Try Again",
    "common.create": "Create",
    "common.gallery": "Gallery",
    "common.settings": "Settings",
    "common.proTip": "Pro Tip",
    "common.back": "Back",

    // Brand
    "brand.name": "StencilCraft",
    "brand.subtitle": "Tattoo Stencil Generator",
    "brand.tagline": "Professional Tattoo Stencils in Seconds",

    // Hero
    "hero.title1": "Turn any photo into a ",
    "hero.titleHighlight": "perfect stencil",
    "hero.subtitle": "Professional tattoo stencils in seconds. Clearer lines for better tattoos and happier clients.",
    "hero.styles": "Styles",
    "hero.avgTime": "Avg Time",
    "hero.free": "Free",

    // Upload
    "upload.title": "Upload Image",
    "upload.subtitle": "JPG, PNG, WEBP up to 10MB",
    "upload.dropzone": "Drag image here or click",
    "upload.dropzoneAlt": "or select a file",
    "upload.dropzoneAria": "Upload image \u2014 click or drag a file here",
    "upload.invalidFormat": "Invalid Format",
    "upload.invalidFormatDesc": "Please upload an image file (JPG, PNG, WEBP)",
    "upload.tooLarge": "File Too Large",
    "upload.tooLargeDesc": "File must be 10MB or smaller",
    "upload.success": "Image Uploaded",
    "upload.successDesc": "Choose a style and generate your stencil",
    "upload.noImage": "No Image",
    "upload.noImageDesc": "Please upload an image first",

    // Generator
    "gen.starting": "Starting generation...",
    "gen.initAI": "Initializing AI...",
    "gen.analyzingStyle": "Analyzing style...",
    "gen.generating": "Generating stencil...",
    "gen.processing": "Processing image...",
    "gen.finalizing": "Finalizing...",
    "gen.done": "Done!",
    "gen.pleaseWait": "Please wait...",
    "gen.waitMessage": "This may take 30-60 seconds. Please wait...",
    "gen.success": "Stencil Created!",
    "gen.successDesc": "Your tattoo stencil was generated successfully",
    "gen.error": "Error",
    "gen.errorDesc": "The stencil could not be created.",
    "gen.connectionLost": "Connection to server lost",
    "gen.rateLimitWait": "Too many requests. Please wait {seconds} seconds.",
    "gen.rateLimitGeneric": "Too many requests. Please wait a moment.",
    "gen.downloadStarted": "Download Started",
    "gen.downloadDesc": "Your stencil is being downloaded",

    // Settings
    "settings.transparentBg": "Transparent Background",
    "settings.transparentBgDesc": "Lines only \u2014 for easy transfer",
    "settings.inverted": "Inverted",
    "settings.invertedDesc": "Light lines on dark background",
    "settings.lineColor": "Line Color",
    "settings.lineColorDesc": "Choose the line color",
    "settings.customColor": "Custom",
    "settings.lineThickness": "Line Thickness",
    "settings.contrast": "Contrast",
    "settings.contrastDesc": "Edge detection strength",
    "settings.comparison": "Comparison View",
    "settings.comparisonDesc": "Before/After slider",
    "settings.stencilStyle": "Stencil Style",

    // Styles
    "style.outline": "Outline",
    "style.outline.desc": "Clean outlines \u2014 perfect for fine tattoos",
    "style.simple": "Simple",
    "style.simple.desc": "Reduced detail \u2014 ideal for smaller tattoos",
    "style.detailed": "Detailed",
    "style.detailed.desc": "High detail \u2014 for realistic subjects",
    "style.hatching": "Hatching",
    "style.hatching.desc": "AI-enhanced professional cross-hatching",
    "style.solid": "Solid",
    "style.solid.desc": "AI-enhanced solid shading",

    // Colors
    "color.black": "Black",
    "color.red": "Red",
    "color.blue": "Blue",
    "color.green": "Green",

    // Gallery
    "gallery.title": "Your Gallery",
    "gallery.subtitle": "All generated stencils are saved here",
    "gallery.empty": "No stencils yet",
    "gallery.emptyDesc": "Generate your first stencil",
    "gallery.createStencil": "Create Stencil",
    "gallery.deleted": "Deleted",
    "gallery.deletedDesc": "Stencil removed from gallery",
    "gallery.full": "Gallery Full",
    "gallery.fullDesc": "Maximum {max} stencils \u2014 oldest were removed",
    "gallery.download": "Download stencil",
    "gallery.addFav": "Add to favorites",
    "gallery.removeFav": "Remove from favorites",
    "gallery.deleteStencil": "Delete stencil",
    "gallery.authRequired": "Sign in required",
    "gallery.authRequiredDesc": "Sign in to access your gallery. Save stencils, mark favorites, and access your collection from anywhere.",

    // Export
    "export.title": "Export",
    "export.subtitle": "PSD file with layers for seamless Procreate integration",
    "export.format": "Format",
    "export.singleFile": "Single File",
    "export.withLayers": "With Layers",
    "export.vector": "Vector",
    "export.paperSize": "Paper Size",
    "export.resolution": "Resolution (DPI)",
    "export.web": "Web",
    "export.medium": "Medium",
    "export.print": "Print",
    "export.layers": "Layers",
    "export.stencilLayer": "Stencil Layer",
    "export.originalLayer": "Original Layer (Reference)",
    "export.exporting": "Exporting...",
    "export.exportPsd": "Export PSD",
    "export.exportPng": "Export PNG",
    "export.exportSvg": "Export SVG",
    "export.psdSuccess": "PSD Exported!",
    "export.psdSuccessDesc": "File can be opened directly in Procreate",
    "export.pngSuccess": "PNG Exported!",
    "export.svgSuccess": "SVG Exported!",
    "export.svgSuccessDesc": "Perfect for cutting machines and scalable output",
    "export.error": "Export Failed",
    "export.errorDesc": "Please try again",

    // Preview
    "preview.original": "Original",
    "preview.stencil": "Stencil",
    "preview.comparisonAria": "Comparison position between original and stencil",
    "preview.originalOpacity": "Original Opacity",
    "preview.zoomOut": "Zoom Out",
    "preview.zoomIn": "Zoom In",
    "preview.flipH": "Flip Horizontal",
    "preview.flipV": "Flip Vertical",
    "preview.reset": "Reset View",

    // Crop
    "crop.title": "Crop Image",
    "crop.apply": "Apply Crop",
    "crop.skip": "Skip",

    // Auth
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.signOut": "Sign Out",
    "auth.signInDesc": "Sign in to StencilCraft",
    "auth.signUpDesc": "Create your StencilCraft account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Name",
    "auth.orContinueWith": "Or continue with",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.invalidCredentials": "Invalid credentials",
    "auth.signingIn": "Signing in...",
    "auth.signingUp": "Signing up...",
    "auth.signUpError": "Sign up failed",
    "auth.signInRequired": "Please sign in",

    // Account
    "account.title": "Account",
    "account.profile": "Profile",
    "account.theme": "Color Theme",
    "account.subscription": "Subscription",

    // Themes
    "theme.purple": "Purple",
    "theme.blue": "Blue",
    "theme.green": "Green",
    "theme.rose": "Rose",
    "theme.amber": "Gold",

    // Pricing
    "pricing.nav": "Pricing",
    "pricing.title": "Pricing",
    "pricing.subtitle": "Choose the plan that fits your needs",
    "pricing.free": "Free",
    "pricing.freePrice": "Free",
    "pricing.pro": "Pro",
    "pricing.studio": "Studio",
    "pricing.perMonth": "/month",
    "pricing.getStarted": "Get Started",
    "pricing.subscribe": "Subscribe",
    "pricing.currentPlan": "Current Plan",
    "pricing.upgrade": "Upgrade",
    "pricing.feat.stencilsDay": "{count} stencils/day",
    "pricing.feat.stencilsMonth": "{count} stencils/month",
    "pricing.feat.unlimited": "Unlimited stencils",
    "pricing.feat.basicStyles": "Outline & Simple styles",
    "pricing.feat.allStyles": "All 5 styles",
    "pricing.feat.gallery": "Cloud gallery",
    "pricing.feat.svgExport": "SVG export",
    "pricing.feat.psdExport": "PSD export (Procreate)",
    "pricing.feat.pngExport": "PNG export",
    "pricing.feat.priority": "Priority processing",

    // Pro Tips
    "tip.procreateTitle": "Pro Tip for Procreate:",
    "tip.procreateDesc": "Click \"Export\" for a PSD file with layers that you can open directly in Procreate.",
    "tip.bestResults": "For best results, use images with clear contrasts and well-defined edges. Portraits and simple subjects work best.",

    // Error page
    "error.title": "Something went wrong",
    "error.description": "An unexpected error occurred. Please try again.",

    // Footer
    "footer.madeFor": "Made for Tattoo Artists",
  },
} as const;

export type TranslationKey = keyof typeof translations.de;

export function getTranslation(locale: Locale, key: TranslationKey, params?: Record<string, string | number>): string {
  let text: string = translations[locale][key] || translations.de[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "de", label: "DE" },
  { value: "en", label: "EN" },
];
