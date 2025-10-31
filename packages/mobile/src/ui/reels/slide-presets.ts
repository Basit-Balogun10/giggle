import { ThemeTokens } from "../../ui/themeTokens";

export function defaultSlidePresets(tokens: ThemeTokens) {
  return [
    tokens.colors.background,
    tokens.colors.surface,
    tokens.colors.error,
    "#F59E0B", // warm amber accent
    tokens.colors.success,
    tokens.colors.secondary,
    tokens.colors.accent,
  ];
}
