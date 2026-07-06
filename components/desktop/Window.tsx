"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { useDesktop, WindowState } from "@/lib/desktop-context";
import { X, Minus, Maximize2 } from "lucide-react";

interface WindowProps {
  windowState: WindowState;
  children: React.ReactNode;
}

export const Window = React.memo(({ windowState, children }: WindowProps) => {
  const { closeApp, minimizeApp, maximizeApp, focusApp, activeWindowId } = useDesktop();

  const isActive = activeWindowId === windowState.id;

  if (windowState.isMinimized) {
    return null; // Hidden when minimized
  }

  const windowVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", damping: 30, stiffness: 400, mass: 0.8 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      drag={!windowState.isMaximized}
      dragMomentum={false}
      onMouseDown={() => focusApp(windowState.id)}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={windowVariants}
      style={{
        zIndex: windowState.zIndex,
        position: "absolute",
        ...(windowState.isMaximized
          ? { top: 0, left: 0, right: 0, bottom: "4rem", width: "100%", height: "calc(100% - 4rem)" }
          : { 
              top: "max(2vh, calc(50vh - 350px))", 
              left: "max(2vw, calc(50vw - 450px))", 
              width: "min(96vw, 900px)", 
              height: "min(85vh, 700px)" 
            }),
      }}
      className={`glass-panel rounded-3xl overflow-hidden flex flex-col transition-shadow duration-300 border ${
        isActive ? "border-primary/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-primary/20" : "border-white/40 dark:border-white/10"
      }`}
    >
      {/* Title Bar */}
      <div 
        className={`h-12 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing border-b border-border/50 select-none backdrop-blur-md transition-colors ${
          isActive ? "bg-gradient-to-b from-white/80 to-white/40 dark:from-white/10 dark:to-transparent" : "bg-white/40 dark:bg-black/40"
        }`}
        onDoubleClick={() => maximizeApp(windowState.id)}
      >
        <div className="flex items-center gap-2 group/traffic">
          {/* Traffic Lights */}
          <button 
            onClick={(e) => { e.stopPropagation(); closeApp(windowState.id); }}
            className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] flex items-center justify-center hover:brightness-110 active:scale-90 transition-all"
          >
            <X className="w-[8px] h-[8px] text-[#4c0000] opacity-0 group-hover/traffic:opacity-100 transition-opacity" strokeWidth={3} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); minimizeApp(windowState.id); }}
            className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] flex items-center justify-center hover:brightness-110 active:scale-90 transition-all"
          >
            <Minus className="w-[8px] h-[8px] text-[#5c3e00] opacity-0 group-hover/traffic:opacity-100 transition-opacity" strokeWidth={3} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); maximizeApp(windowState.id); }}
            className="w-3.5 h-3.5 rounded-full bg-[#27c93f] flex items-center justify-center hover:brightness-110 active:scale-90 transition-all"
          >
            <Maximize2 className="w-[8px] h-[8px] text-[#004d09] opacity-0 group-hover/traffic:opacity-100 transition-opacity" strokeWidth={3} />
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-80">
          {windowState.icon && <windowState.icon className="w-4 h-4 text-primary" />}
          <span className="text-sm font-semibold text-foreground tracking-wide">{windowState.title}</span>
        </div>
        
        <div className="w-[54px]"></div> {/* Exact width of traffic lights + gap for perfect centering */}
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-y-auto bg-background/90 relative p-0 custom-scrollbar">
        {children}
      </div>
    </motion.div>
  );
});
