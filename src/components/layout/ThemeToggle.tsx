"use client";

import React from "react";
import { useTheme } from "@/lib/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        mounted
          ? `Switch to ${theme === "light" ? "dark" : "light"} mode`
          : "Toggle color theme"
      }
      className="group relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors duration-300 hover:text-accent-red focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red"
      title={mounted ? (theme === "light" ? "Dark mode" : "Light mode") : "Theme"}
    >
      <span className="sr-only">Toggle theme</span>
      {/* Fallback before mounting to match server render */}
      {!mounted ? (
        <span className="h-4 w-4 rounded-full border border-foreground/30 opacity-70" />
      ) : theme === "dark" ? (
        <Sun className="h-4 w-4 stroke-[1.4] transition-transform duration-300 group-hover:rotate-45 group-hover:text-accent-red" />
      ) : (
        <Moon className="h-4 w-4 stroke-[1.4] transition-transform duration-300 group-hover:-rotate-12 group-hover:text-accent-red" />
      )}
    </button>
  );
}
