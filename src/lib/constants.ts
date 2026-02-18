export const STENCIL_STYLES = [
  {
    id: "outline",
    name: "Outline",
    description: "Klare Umrisse - perfekt für feine Tattoos",
    icon: "\u270F\uFE0F",
    thumbnail: "outline",
    aiEnhanced: false,
  },
  {
    id: "simple",
    name: "Simple",
    description: "Reduzierte Details - ideal für kleinere Tattoos",
    icon: "\u25CB",
    thumbnail: "simple",
    aiEnhanced: false,
  },
  {
    id: "detailed",
    name: "Detailed",
    description: "Hoher Detailgrad - für realistische Motive",
    icon: "\uD83C\uDFA8",
    thumbnail: "detailed",
    aiEnhanced: false,
  },
  {
    id: "hatching",
    name: "Hatching",
    description: "AI-verstärkte professionelle Schraffur",
    icon: "\u25A4",
    thumbnail: "hatching",
    aiEnhanced: true,
  },
  {
    id: "solid",
    name: "Solid",
    description: "AI-verstärkte flächige Schattierungen",
    icon: "\u25A3",
    thumbnail: "solid",
    aiEnhanced: true,
  },
];

export const LINE_COLORS = [
  { value: "#000000", name: "Schwarz" },
  { value: "#dc2626", name: "Rot" },
  { value: "#2563eb", name: "Blau" },
  { value: "#16a34a", name: "Grün" },
];

export const BODY_PLACEMENTS = [
  { id: "arm", name: "Arm", width: 300, height: 400 },
  { id: "back", name: "Rücken", width: 400, height: 500 },
  { id: "chest", name: "Brust", width: 350, height: 300 },
  { id: "leg", name: "Bein", width: 250, height: 450 },
  { id: "wrist", name: "Handgelenk", width: 200, height: 150 },
  { id: "neck", name: "Nacken", width: 250, height: 200 },
];
