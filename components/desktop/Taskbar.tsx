"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { useDesktop } from "@/lib/desktop-context";
import { Flower2, Gamepad2, Settings, Home, FileText, Music, MessageCircle } from "lucide-react";

const PINNED_APPS = [
  { id: "chat", title: "Messages", icon: MessageCircle },
  { id: "gallery", title: "Gallery", icon: Flower2 },
  { id: "notes", title: "Notes", icon: FileText },
  { id: "music", title: "Music", icon: Music },
  { id: "games", title: "Minigames", icon: Gamepad2 },
];

function DockIcon({ app, isActive, isOpen, onClick, mouseX, isSettings = false, isSettingsRotated = false }: {
  app: any, isActive: boolean, isOpen: boolean, onClick: (app: any) => void, mouseX: MotionValue, isSettings?: boolean, isSettingsRotated?: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null);
  
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [56, 80, 56]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <div className="relative h-full flex items-end justify-center px-1 pb-2">
      <motion.button
        ref={ref}
        style={{ width, height: width }}
        onClick={() => onClick(app)}
        className={`relative flex items-center justify-center rounded-[18px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 origin-bottom ${
          isActive ? "bg-white/20 dark:bg-white/10 shadow-sm" : "hover:bg-white/30 dark:hover:bg-white/10"
        }`}
        title={app.title}
      >
        <app.icon className={`w-3/5 h-3/5 transition-all duration-300 ${
          isActive ? "text-primary drop-shadow-md" : "text-foreground/80"
        } ${isSettingsRotated ? "rotate-90" : ""}`} strokeWidth={1.5} />
      </motion.button>
      
      {isOpen && (
        <motion.div 
          layoutId={`indicator-${app.id}`}
          className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-colors duration-300 ${
            isActive ? "bg-foreground shadow-[0_0_4px_currentColor]" : "bg-foreground/40"
          }`} 
        />
      )}
    </div>
  );
}

export const Taskbar = () => {
  const { windows, openApp, minimizeApp, focusApp, activeWindowId } = useDesktop();
  const mouseX = useMotionValue(Infinity);

  const taskbarApps: { id: string; title: string; icon: any }[] = [...PINNED_APPS];
  
  windows.forEach((w) => {
    if (w.id === "settings") return;
    if (!taskbarApps.find((p) => p.id === w.id)) {
      taskbarApps.push({ id: w.id, title: w.title, icon: (w.icon as any) || Home });
    }
  });

  const handleAppClick = (app: { id: string; title: string; icon: any }) => {
    const windowState = windows.find((w) => w.id === app.id);
    if (!windowState) {
      openApp(app.id, app.title, app.icon);
    } else if (activeWindowId === app.id && !windowState.isMinimized) {
      minimizeApp(app.id);
    } else {
      focusApp(app.id);
    }
  };

  const isSettingsOpen = !!windows.find(w => w.id === "settings");
  const isSettingsActive = activeWindowId === "settings" && !windows.find(w => w.id === "settings")?.isMinimized;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-[100] flex items-end justify-center pb-4"
    >
      <div 
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="glass-taskbar pointer-events-auto h-[72px] rounded-[24px] px-3 flex items-end justify-center relative"
      >
        {taskbarApps.map((app) => (
          <DockIcon 
            key={app.id}
            app={app}
            isActive={activeWindowId === app.id && !windows.find((w) => w.id === app.id)?.isMinimized}
            isOpen={!!windows.find((w) => w.id === app.id)}
            onClick={handleAppClick}
            mouseX={mouseX}
          />
        ))}

        <div className="w-px h-10 bg-border/40 mx-2 mb-4 rounded-full"></div>

        <DockIcon 
          app={{ id: "settings", title: "Settings", icon: Settings }}
          isActive={isSettingsActive}
          isOpen={isSettingsOpen}
          onClick={handleAppClick}
          mouseX={mouseX}
          isSettings={true}
          isSettingsRotated={isSettingsOpen || false} // Add hover rotation in icon class normally, but this is simpler
        />
      </div>
    </div>
  );
};
