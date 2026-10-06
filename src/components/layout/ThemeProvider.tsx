"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme.store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Also set color-scheme for native elements
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return <>{children}</>;
}
