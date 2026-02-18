export const THEMES = [
  { id: "purple", nameKey: "theme.purple" as const, primary: "#8B5CF6", accent: "#ec4899", gradientFrom: "#7c3aed", gradientTo: "#ec4899" },
  { id: "blue", nameKey: "theme.blue" as const, primary: "#06b6d4", accent: "#3b82f6", gradientFrom: "#0891b2", gradientTo: "#3b82f6" },
  { id: "green", nameKey: "theme.green" as const, primary: "#10b981", accent: "#14b8a6", gradientFrom: "#059669", gradientTo: "#14b8a6" },
  { id: "rose", nameKey: "theme.rose" as const, primary: "#f43f5e", accent: "#fb923c", gradientFrom: "#e11d48", gradientTo: "#fb923c" },
  { id: "amber", nameKey: "theme.amber" as const, primary: "#f59e0b", accent: "#eab308", gradientFrom: "#d97706", gradientTo: "#eab308" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export function getTheme(id: string) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
