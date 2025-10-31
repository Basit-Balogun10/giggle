export type ThemeTokens = {
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    accent: string;
    success: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    bodySize: number;
    headingSize: number;
    mono: string;
  };
};

export const lightTokens: ThemeTokens = {
  colors: {
    background: "#ffffff",
    surface: "#f7f7f8",
    primary: "#0f172a",
    secondary: "#3b82f6",
    text: "#0f172a",
    muted: "#6b7280",
    accent: "#06b6d4",
    success: "#10B981",
    error: "#EF4444",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  typography: {
    bodySize: 16,
    headingSize: 20,
    mono: "Menlo, monospace",
  },
};

export const darkTokens: ThemeTokens = {
  colors: {
    background: "#0b1220",
    surface: "#071024",
    primary: "#e6eef8",
    secondary: "#60a5fa",
    text: "#e6eef8",
    muted: "#9ca3af",
    accent: "#67e8f9",
    success: "#10B981",
    error: "#EF4444",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  typography: {
    bodySize: 16,
    headingSize: 20,
    mono: "Menlo, monospace",
  },
};
