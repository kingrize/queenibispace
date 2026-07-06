"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { useSettings } from "@/lib/settings-context";

export const SKY_IMAGES = [
  "/sky/SKY_20260625_225630.jpg",
  "/sky/SKY_20260625_225639.jpg",
  "/sky/SKY_20260625_231114.jpg",
  "/sky/SKY_20260629_235021.jpg",
  "/sky/SKY_20260629_235103.jpg",
  "/sky/SKY_20260629_235152.jpg",
  "/sky/SKY_20260629_235155.jpg",
  "/sky/SKY_20260629_235201.jpg",
  "/sky/SKY_20260630_001106.jpg",
  "/sky/SKY_20260630_002447.jpg",
  "/sky/SKY_20260705_151914.jpg",
  "/sky/SKY_20260705_151917.jpg",
  "/sky/SKY_20260705_151922.jpg",
];

export const Wallpaper = () => {
  const { wallpaperMode, wallpaperIndex, wallpaperBlur, slideshowSpeed } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      if (wallpaperMode === "static") {
        setCurrentIndex(wallpaperIndex);
      } else {
        // Randomize initial image if we just mounted in slideshow mode
        setCurrentIndex(Math.floor(Math.random() * SKY_IMAGES.length));
      }
    }, 0);

    if (wallpaperMode === "static") return;

    // Rotate wallpaper based on slideshowSpeed
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SKY_IMAGES.length);
    }, slideshowSpeed * 1000);

    return () => clearInterval(interval);
  }, [wallpaperMode, wallpaperIndex, slideshowSpeed]);

  return (
    <div className="absolute inset-0 z-0 bg-background overflow-hidden">
      {/* Background Slideshow / Image */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={SKY_IMAGES[currentIndex] || SKY_IMAGES[0]}
            alt="Desktop Wallpaper"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays for UI Clarity and Aesthetic */}
      
      {/* Soft gradient to blend the sky with the pastel aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background/60 to-secondary/30 mix-blend-overlay dark:from-primary/40 dark:via-background/80 dark:to-secondary/20" />
      
      {/* General dimming to ensure text and windows pop out */}
      <div 
        className="absolute inset-0 bg-black/10 dark:bg-black/40 transition-all duration-1000" 
        style={{ backdropFilter: `blur(${wallpaperBlur}px)`, WebkitBackdropFilter: `blur(${wallpaperBlur}px)` }}
      />
      
      {/* Dreamy Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

      {/* Floating Stars/Decorations */}
      <div className="absolute top-20 left-20 text-accent/80 animate-pulse drop-shadow-md">
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z"/>
        </svg>
      </div>
      <div className="absolute bottom-40 right-20 text-primary/80 animate-bounce drop-shadow-md" style={{ animationDuration: '4s' }}>
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            {/* Ladybug silhouette rough shape */}
            <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 6.48 17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L12 18.2V20zm2-1.9V18.1L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.41-3.59 8-8 8zM12 4c1.17 0 2.27.27 3.25.75L12 7.8V4zm-1 0v3.8L7.75 4.75C8.73 4.27 9.83 4 11 4z"/>
        </svg>
      </div>
      <div className="absolute top-1/4 right-1/4 text-secondary/80 rotate-12 drop-shadow-md">
          <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
          {/* Leaf/Matcha inspired shape */}
          <path d="M17 8C8 10 5.9 16.19 3.82 21.34l1.89.66l.95-2.3c3.84-2.73 8.3-4.85 13.34-5.7z"/>
        </svg>
      </div>
    </div>
  );
};
