"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMedia } from "@/lib/media-context";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

export function DynamicIsland() {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    togglePlay,
    skipForward,
    skipBackward,
    handleSeek
  } = useMedia();

  const [isExpanded, setIsExpanded] = useState(false);

  // If no track has started and not playing, don't show the island at all (or show it very minimally)
  if (!isPlaying && progress === 0) return null;

  // Format time (e.g. 1:30)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] flex justify-center">
      <motion.div
        layout
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -50, opacity: 0, scale: 0.9 }}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
        className="bg-black text-white overflow-hidden shadow-2xl"
        style={{
          borderRadius: isExpanded ? 32 : 24,
        }}
      >
        <motion.div 
          layout
          className="flex flex-col"
          style={{
            width: isExpanded ? 320 : 160,
            height: isExpanded ? 160 : 40,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* Collapsed State Content */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute inset-0 flex items-center justify-between px-3"
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={currentTrack.cover} 
                    alt="cover" 
                    className="w-5 h-5 rounded-full object-cover"
                  />
                </div>
                
                {/* Tiny Waveform Animation when playing */}
                <div className="flex items-end gap-0.5 h-3">
                  <motion.div animate={isPlaying ? { height: ["20%", "100%", "20%"] } : { height: "20%" }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-rose-500 rounded-full" />
                  <motion.div animate={isPlaying ? { height: ["40%", "80%", "40%"] } : { height: "20%" }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.1 }} className="w-0.5 bg-rose-500 rounded-full" />
                  <motion.div animate={isPlaying ? { height: ["100%", "30%", "100%"] } : { height: "20%" }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }} className="w-0.5 bg-rose-500 rounded-full" />
                  <motion.div animate={isPlaying ? { height: ["60%", "90%", "60%"] } : { height: "20%" }} transition={{ repeat: Infinity, duration: 1.0, delay: 0.3 }} className="w-0.5 bg-rose-500 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded State Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="absolute inset-0 p-4 flex flex-col justify-between"
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={currentTrack.cover} 
                    alt="cover" 
                    className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-[15px] truncate">{currentTrack.title}</span>
                    <span className="text-[13px] text-white/60 truncate">{currentTrack.artist}</span>
                  </div>
                  
                  {/* Mini waveform in expanded view too */}
                  <div className="flex items-end gap-0.5 h-4 opacity-70">
                    <motion.div animate={isPlaying ? { height: ["20%", "100%", "20%"] } : { height: "20%" }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-white rounded-full" />
                    <motion.div animate={isPlaying ? { height: ["40%", "80%", "40%"] } : { height: "20%" }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.1 }} className="w-0.5 bg-white rounded-full" />
                    <motion.div animate={isPlaying ? { height: ["100%", "30%", "100%"] } : { height: "20%" }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }} className="w-0.5 bg-white rounded-full" />
                  </div>
                </div>

                {/* Scrubber */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-[10px] text-white/50 w-8 tabular-nums">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full relative overflow-hidden group">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-white rounded-full pointer-events-none" 
                      style={{ width: `${progress}%` }} 
                    />
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={progress}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] text-white/50 w-8 tabular-nums text-right">-{duration ? formatTime(duration - currentTime) : "0:00"}</span>
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center gap-8 mt-2">
                  <button onClick={skipBackward} className="text-white/80 hover:text-white transition-colors">
                    <SkipBack className="w-6 h-6 fill-current" />
                  </button>
                  <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </button>
                  <button onClick={skipForward} className="text-white/80 hover:text-white transition-colors">
                    <SkipForward className="w-6 h-6 fill-current" />
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </motion.div>
    </div>
  );
}
