import type { ReactNode } from "react";
import type { Theme } from "~/lib/storage";
import { useLayoutEffect, useMemo } from "react";
import { useStorageItem } from "~/hooks/use-storage-item";
import { ThemeContext } from "~/hooks/use-theme";
import { themePreference } from "~/lib/storage";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function resolveTheme(theme: Theme) {
  if (theme !== "system") {
    return theme;
  }
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}

function disableTransitionsTemporarily(target: HTMLElement) {
  const root = target.getRootNode();
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}";
  // A content script UI only sees styles inside its own shadow root.
  (root instanceof ShadowRoot ? root : document.head).append(style);

  return () => {
    window.getComputedStyle(target);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => style.remove());
    });
  };
}

interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Element that gets the `light` or `dark` class: `<html>` on extension pages,
   * the shadow root container in content scripts.
   */
  target: HTMLElement;
}

export function ThemeProvider({ children, target }: ThemeProviderProps) {
  const [theme, setTheme, ready] = useStorageItem(themePreference);

  useLayoutEffect(() => {
    const apply = () => {
      const restoreTransitions = disableTransitionsTemporarily(target);
      target.classList.remove("light", "dark");
      target.classList.add(resolveTheme(theme));
      restoreTransitions();
    };

    apply();
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, [target, theme]);

  const value = useMemo(() => ({ theme, setTheme, ready }), [theme, setTheme, ready]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
