export const STENCIL_STYLES = [
  { id: "outline", icon: "\u270F\uFE0F", thumbnail: "outline", aiEnhanced: false },
  { id: "simple", icon: "\u25CB", thumbnail: "simple", aiEnhanced: false },
  { id: "detailed", icon: "\uD83C\uDFA8", thumbnail: "detailed", aiEnhanced: false },
  { id: "hatching", icon: "\u25A4", thumbnail: "hatching", aiEnhanced: true },
  { id: "solid", icon: "\u25A3", thumbnail: "solid", aiEnhanced: true },
];

export const LINE_COLORS = [
  { value: "#000000", nameKey: "color.black" as const },
  { value: "#dc2626", nameKey: "color.red" as const },
  { value: "#2563eb", nameKey: "color.blue" as const },
  { value: "#16a34a", nameKey: "color.green" as const },
];
