// AQI category → visual treatment. Colors are deliberately muted/earthy
// (not stock Tailwind red/purple) but keep the real semantic ordering of
// the US AQI scale, since that ordering is meaningful content, not decor.

export interface AqiStyle {
  hex: string; // the category's core color
  wash: string; // full-bleed atmosphere gradient (inline style)
  badgeText: string; // tailwind text color class for small labels
}

const STYLES: Record<string, AqiStyle> = {
  Good: {
    hex: "#4f9e6e",
    wash: "linear-gradient(135deg, #e9f3ec 0%, #cfe6d8 100%)",
    badgeText: "text-[#3c7a54]",
  },
  Moderate: {
    hex: "#c9a227",
    wash: "linear-gradient(135deg, #faf2d9 0%, #eed9a0 100%)",
    badgeText: "text-[#9c7d1a]",
  },
  "Unhealthy for Sensitive Groups": {
    hex: "#d1793a",
    wash: "linear-gradient(135deg, #fbe9d9 0%, #edc49a 100%)",
    badgeText: "text-[#a85c25]",
  },
  Unhealthy: {
    hex: "#bf4b3c",
    wash: "linear-gradient(135deg, #f8dcd7 0%, #e4a69a 100%)",
    badgeText: "text-[#963a2e]",
  },
  "Very Unhealthy": {
    hex: "#8a4a82",
    wash: "linear-gradient(135deg, #ecdcea 0%, #c9a0c1 100%)",
    badgeText: "text-[#6e3a67]",
  },
  Hazardous: {
    hex: "#5c2430",
    wash: "linear-gradient(135deg, #ddc0c4 0%, #9b6a71 100%)",
    badgeText: "text-[#4a1c26]",
  },
};

const DEFAULT: AqiStyle = STYLES.Moderate;

export function aqiStyle(category: string): AqiStyle {
  return STYLES[category] ?? DEFAULT;
}
