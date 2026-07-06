"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface WindowState {
  id: string;
  title: string;
  icon?: any; // Lucide icon
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface DesktopContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  openApp: (id: string, title: string, icon?: any) => void;
  closeApp: (id: string) => void;
  minimizeApp: (id: string) => void;
  maximizeApp: (id: string) => void;
  focusApp: (id: string) => void;
}

const DesktopContext = createContext<DesktopContextType | null>(null);

export const useDesktop = () => {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error("useDesktop must be used within a DesktopProvider");
  }
  return context;
};

export const DesktopProvider = ({ children }: { children: ReactNode }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [zIndexCounter, setZIndexCounter] = useState(10);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const focusApp = useCallback((id: string) => {
    setZIndexCounter((prev) => prev + 1);
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          return { ...win, zIndex: zIndexCounter + 1, isMinimized: false };
        }
        return win;
      })
    );
    setActiveWindowId(id);
  }, [zIndexCounter]);

  const openApp = useCallback((id: string, title: string, icon?: any) => {
    setWindows((prev) => {
      const exists = prev.find((w) => w.id === id);
      if (exists) {
        // App is already open, just focus it and ensure it's not minimized
        setTimeout(() => focusApp(id), 0);
        return prev;
      }
      // Open new app
      setZIndexCounter((z) => z + 1);
      setActiveWindowId(id);
      return [
        ...prev,
        {
          id,
          title,
          icon,
          isMinimized: false,
          isMaximized: false,
          zIndex: zIndexCounter + 1,
        },
      ];
    });
  }, [zIndexCounter, focusApp]);

  const closeApp = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const minimizeApp = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w))
    );
  }, []);

  const maximizeApp = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
    focusApp(id);
  }, [focusApp]);

  const value = React.useMemo(() => ({
    windows,
    activeWindowId,
    openApp,
    closeApp,
    minimizeApp,
    toggleMinimize,
    maximizeApp,
    focusApp,
  }), [windows, activeWindowId, openApp, closeApp, minimizeApp, toggleMinimize, maximizeApp, focusApp]);

  return (
    <DesktopContext.Provider value={value}>
      {children}
    </DesktopContext.Provider>
  );
};
