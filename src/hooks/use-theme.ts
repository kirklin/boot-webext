import type { Theme } from "~/lib/storage";
import { createContext, use } from "react";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
}

export const ThemeContext = createContext<ThemeState | undefined>(undefined);

export function useTheme() {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
