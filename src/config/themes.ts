// Theme registry for tournament visual themes

export interface ThemeConfig {
  value: string;
  label: string;
  description: string;
  emoji: string;
  // CSS class applied to the <html> or wrapper element
  className: string;
  // Tailwind color tokens as CSS variables
  colors: {
    primary: string;
    primaryFg: string;
    secondary: string;
    secondaryFg: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textMuted: string;
  };
}

export const THEMES: ThemeConfig[] = [
  {
    value: "default",
    label: "Modern",
    description: "Tema modern biru & putih",
    emoji: "🎯",
    className: "theme-default",
    colors: {
      primary: "#2563eb",
      primaryFg: "#ffffff",
      secondary: "#f1f5f9",
      secondaryFg: "#0f172a",
      accent: "#0ea5e9",
      background: "#f8fafc",
      surface: "#ffffff",
      border: "#e2e8f0",
      text: "#0f172a",
      textMuted: "#64748b",
    },
  },
  {
    value: "agustus",
    label: "17 Agustus",
    description: "Tema Kemerdekaan Indonesia merah-putih",
    emoji: "🇮🇩",
    className: "theme-agustus",
    colors: {
      primary: "#dc2626",
      primaryFg: "#ffffff",
      secondary: "#fef2f2",
      secondaryFg: "#7f1d1d",
      accent: "#b91c1c",
      background: "#fffbeb",
      surface: "#ffffff",
      border: "#fca5a5",
      text: "#1c1917",
      textMuted: "#78716c",
    },
  },
  {
    value: "lebaran",
    label: "Lebaran",
    description: "Tema Idul Fitri hijau emas",
    emoji: "🌙",
    className: "theme-lebaran",
    colors: {
      primary: "#15803d",
      primaryFg: "#ffffff",
      secondary: "#f0fdf4",
      secondaryFg: "#14532d",
      accent: "#ca8a04",
      background: "#fefce8",
      surface: "#ffffff",
      border: "#86efac",
      text: "#14532d",
      textMuted: "#4d7c0f",
    },
  },
  {
    value: "olahraga",
    label: "Sporty",
    description: "Tema hijau lapangan olahraga",
    emoji: "🏆",
    className: "theme-olahraga",
    colors: {
      primary: "#16a34a",
      primaryFg: "#ffffff",
      secondary: "#f0fdf4",
      secondaryFg: "#052e16",
      accent: "#eab308",
      background: "#f0fdf4",
      surface: "#ffffff",
      border: "#bbf7d0",
      text: "#052e16",
      textMuted: "#166534",
    },
  },
];

export function getThemeConfig(value: string): ThemeConfig {
  return THEMES.find((t) => t.value === value) ?? THEMES[0];
}

export function getThemeLabel(value: string): string {
  return getThemeConfig(value).label;
}
