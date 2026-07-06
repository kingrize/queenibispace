"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeOption = "light" | "dark" | "system";
export type WallpaperModeOption = "slideshow" | "static";

interface SettingsState {
  theme: ThemeOption;
  wallpaperMode: WallpaperModeOption;
  wallpaperIndex: number;
  wallpaperBlur: number;
  slideshowSpeed: number; // in seconds
}

interface SettingsContextType extends SettingsState {
  setTheme: (theme: ThemeOption) => void;
  setWallpaperMode: (mode: WallpaperModeOption) => void;
  setWallpaperIndex: (index: number) => void;
  setWallpaperBlur: (blur: number) => void;
  setSlideshowSpeed: (speed: number) => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
  theme: "system",
  wallpaperMode: "slideshow",
  wallpaperIndex: 0,
  wallpaperBlur: 4,
  slideshowSpeed: 30,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>(defaultSettings.theme);
  const [wallpaperMode, setWallpaperMode] = useState<WallpaperModeOption>(defaultSettings.wallpaperMode);
  const [wallpaperIndex, setWallpaperIndex] = useState<number>(defaultSettings.wallpaperIndex);
  const [wallpaperBlur, setWallpaperBlur] = useState<number>(defaultSettings.wallpaperBlur);
  const [slideshowSpeed, setSlideshowSpeed] = useState<number>(defaultSettings.slideshowSpeed);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("settings-theme") as ThemeOption;
      const savedWallpaperMode = localStorage.getItem("settings-wallpaperMode") as WallpaperModeOption;
      const savedWallpaperIndex = localStorage.getItem("settings-wallpaperIndex");
      const savedWallpaperBlur = localStorage.getItem("settings-wallpaperBlur");
      const savedSlideshowSpeed = localStorage.getItem("settings-slideshowSpeed");

      setTimeout(() => {
        if (savedTheme) setTheme(savedTheme);
        if (savedWallpaperMode) setWallpaperMode(savedWallpaperMode);
        if (savedWallpaperIndex !== null) {
          const parsed = parseInt(savedWallpaperIndex, 10);
          if (!isNaN(parsed)) setWallpaperIndex(parsed);
        }
        if (savedWallpaperBlur !== null) {
          const parsed = parseInt(savedWallpaperBlur, 10);
          if (!isNaN(parsed)) setWallpaperBlur(parsed);
        }
        if (savedSlideshowSpeed !== null) {
          const parsed = parseInt(savedSlideshowSpeed, 10);
          if (!isNaN(parsed)) setSlideshowSpeed(parsed);
        }
      }, 0);
    } catch (e) {
      console.warn("Failed to load settings from localStorage", e);
    }
    setMounted(true);
  }, []);

  // Save to localStorage when settings change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("settings-theme", theme);
    localStorage.setItem("settings-wallpaperMode", wallpaperMode);
    localStorage.setItem("settings-wallpaperIndex", wallpaperIndex.toString());
    localStorage.setItem("settings-wallpaperBlur", wallpaperBlur.toString());
    localStorage.setItem("settings-slideshowSpeed", slideshowSpeed.toString());
  }, [theme, wallpaperMode, wallpaperIndex, wallpaperBlur, slideshowSpeed, mounted]);

  // Apply theme class to HTML element
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      
      // Listener for system changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        if (theme === "system") {
          root.classList.remove("light", "dark");
          root.classList.add(e.matches ? "dark" : "light");
        }
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  const resetSettings = () => {
    setTheme(defaultSettings.theme);
    setWallpaperMode(defaultSettings.wallpaperMode);
    setWallpaperIndex(defaultSettings.wallpaperIndex);
    setWallpaperBlur(defaultSettings.wallpaperBlur);
    setSlideshowSpeed(defaultSettings.slideshowSpeed);
  };

  const value = {
    theme,
    wallpaperMode,
    wallpaperIndex,
    wallpaperBlur,
    slideshowSpeed,
    setTheme,
    setWallpaperMode,
    setWallpaperIndex,
    setWallpaperBlur,
    setSlideshowSpeed,
    resetSettings,
  };

  // Prevent flash of incorrect theme by rendering empty or generic wrapper before mount if absolutely necessary,
  // but it's generally fine to render children immediately since we do CSS manipulation directly.
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
