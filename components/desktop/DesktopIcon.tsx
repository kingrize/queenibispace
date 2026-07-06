"use client";

import React from "react";
import { useDesktop } from "@/lib/desktop-context";
import { motion } from "framer-motion";

interface DesktopIconProps {
  id: string;
  title: string;
  icon: any;
  delay?: number;
}

export const DesktopIcon = ({ id, title, icon: Icon, delay = 0 }: DesktopIconProps) => {
  const { openApp } = useDesktop();

  // Give each app a unique gradient to mimic native OS icons
  const getAppStyle = (appId: string) => {
    switch (appId) {
      case 'gallery':
        return 'bg-gradient-to-br from-pink-400 to-purple-600 text-white border-pink-300/30';
      case 'music':
        return 'bg-gradient-to-br from-red-400 to-rose-600 text-white border-red-300/30';
      case 'chat':
        return 'bg-gradient-to-br from-[#34c759] to-[#28a745] text-white border-[#34c759]/30';
      case 'notes':
        return 'bg-gradient-to-br from-yellow-300 to-amber-500 text-white border-yellow-200/30';
      case 'games':
        return 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white border-cyan-300/30';
      case 'settings':
        return 'bg-gradient-to-br from-gray-500 to-gray-700 text-white border-gray-400/30';
      default:
        return 'bg-gradient-to-br from-white/80 to-white/40 dark:from-white/20 dark:to-white/5 text-primary border-white/40';
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => openApp(id, title, Icon)}
      className="flex flex-col items-center gap-1 p-2 w-[88px] rounded-xl hover:bg-black/10 dark:hover:bg-white/10 group focus-visible:outline-none focus-visible:bg-black/10 dark:focus-visible:bg-white/10 transition-colors duration-200"
    >
      <div className={`w-16 h-16 rounded-[16px] flex items-center justify-center shadow-md border ${getAppStyle(id)} group-active:brightness-75 transition-all duration-200`}>
        <Icon className="w-8 h-8 drop-shadow-sm" strokeWidth={1.5} />
      </div>
      <span 
        className="text-[13px] font-medium text-white text-center leading-tight tracking-wide w-full truncate px-1"
        style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8), 0px 1px 8px rgba(0,0,0,0.5)' }}
      >
        {title}
      </span>
    </motion.button>
  );
};
