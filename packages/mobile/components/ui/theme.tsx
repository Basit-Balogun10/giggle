import * as React from "react";
import { View, type ViewProps } from "react-native";
import { useColorScheme } from "./utils/use-color-scheme";
import { cn } from "./utils/cn";
import { lightTokens, darkTokens, type ThemeTokens } from "../../src/ui/themeTokens";

interface ThemeProviderProps extends ViewProps {
  theme?: "light" | "dark" | "system";
}

const ThemeContext = React.createContext<ThemeTokens | null>(null);

export function useThemeTokens() {
  const tokens = React.useContext(ThemeContext);
  if (!tokens) throw new Error('useThemeTokens must be used inside ThemeProvider');
  return tokens;
}

const ThemeProvider = React.forwardRef<
  React.ElementRef<typeof View>,
  ThemeProviderProps
>(({ theme = "system", className, children, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const isDark = theme === "system" ? colorScheme === "dark" : theme === "dark";
  const tokens = isDark ? darkTokens : lightTokens;

  // Map tokens to CSS-variable-like keys that NativeWind / Tailwind can reference
  const cssVars: Record<string, string | number> = {
    // color tokens
    '--background': tokens.colors.background,
    '--foreground': tokens.colors.text,
    '--primary': tokens.colors.primary,
    '--secondary': tokens.colors.secondary,
    '--muted': tokens.colors.muted,
    '--accent': tokens.colors.accent,
    '--card': tokens.colors.surface,
    // semantic helpers used by Tailwind class names in the UI
    '--input': tokens.colors.surface,
    '--ring': tokens.colors.secondary,
    '--ring-offset-background': tokens.colors.background,
    '--primary-foreground': tokens.colors.surface,
    '--secondary-foreground': tokens.colors.surface,
    '--destructive': tokens.colors.error,
    '--destructive-foreground': tokens.colors.surface,
    '--border': tokens.colors.muted,
    '--muted-foreground': tokens.colors.muted,
    // radius
    '--radius': `${tokens.radii.md}px`,
  };

  const combinedStyle = [cssVars as any, props.style].filter(Boolean) as any;

  return (
    <ThemeContext.Provider value={tokens}>
      <View
        ref={ref}
        className={cn(
          'flex-1 bg-background',
          isDark && 'dark',
          className
        )}
        style={combinedStyle}
        {...props}
      >
        {children}
      </View>
    </ThemeContext.Provider>
  );
});

ThemeProvider.displayName = "ThemeProvider";

export { ThemeProvider };