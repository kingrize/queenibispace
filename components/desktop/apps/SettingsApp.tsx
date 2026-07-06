"use client";

import React, { useState } from "react";
import { useSettings, ThemeOption } from "@/lib/settings-context";
import { useAuth } from "@/lib/auth-context";
import { SKY_IMAGES } from "@/components/desktop/Wallpaper";
import { Monitor, Moon, Sun, Image as ImageIcon, PlayCircle, LogOut, RefreshCw, User as UserIcon, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for macOS style row groups
const SettingGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md rounded-[14px] border border-black/5 dark:border-white/10 shadow-sm overflow-hidden divide-y divide-black/5 dark:divide-white/10">
    {children}
  </div>
);

// Helper for macOS style row
const SettingRow = ({ 
  icon: Icon, 
  iconBg, 
  title, 
  children,
  subtitle
}: { 
  icon?: React.ReactNode; 
  iconBg?: string; 
  title: string; 
  children?: React.ReactNode;
  subtitle?: string;
}) => (
  <div className="flex items-center justify-between px-4 py-2.5 min-h-[44px]">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-white shadow-sm ${iconBg}`}>
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-[14px] font-medium text-foreground">{title}</span>
        {subtitle && <span className="text-[11px] text-muted-foreground leading-none mt-0.5">{subtitle}</span>}
      </div>
    </div>
    <div className="flex items-center gap-3 text-sm">
      {children}
    </div>
  </div>
);

export default function SettingsApp() {
  const { 
    theme, setTheme, 
    wallpaperMode, setWallpaperMode, 
    wallpaperIndex, setWallpaperIndex, 
    wallpaperBlur, setWallpaperBlur,
    slideshowSpeed, setSlideshowSpeed,
    resetSettings
  } = useSettings();
  
  const { user, logout, updateUserName } = useAuth();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || "");

  return (
    <div className="flex flex-col h-full bg-[#f2f2f7] dark:bg-[#000000] font-sans selection:bg-primary/20">
      
      {/* Hidden top bar space for traffic lights */}
      <div className="h-12 w-full shrink-0 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#1c1c1e]/40 backdrop-blur-md flex items-center justify-center">
        <span className="text-[13px] font-semibold text-foreground/80">System Settings</span>
      </div>

      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-6 max-w-2xl mx-auto w-full pb-10">
        
        {/* Profile Group */}
        {user && (
          <section className="space-y-2">
            <h2 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Profile</h2>
            <SettingGroup>
              <SettingRow icon={UserIcon} iconBg="bg-purple-500" title="Display Name">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-sm outline-none w-32 focus:ring-1 focus:ring-blue-500 text-foreground"
                      autoFocus
                    />
                    <button 
                      onClick={() => {
                        updateUserName(editedName);
                        setIsEditingName(false);
                      }}
                      className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditedName(user?.displayName || "");
                        setIsEditingName(false);
                      }}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground/80">{user?.displayName || "No Name Set"}</span>
                    <button 
                      onClick={() => {
                        setEditedName(user?.displayName || "");
                        setIsEditingName(true);
                      }}
                      className="text-[12px] text-blue-500 hover:underline px-2 py-1"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </SettingRow>
            </SettingGroup>
          </section>
        )}

        {/* Appearance Group */}
        <section className="space-y-2">
          <h2 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Appearance</h2>
          <SettingGroup>
            <SettingRow icon={Monitor} iconBg="bg-blue-500" title="Theme">
              <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-lg">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "Auto", icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as ThemeOption)}
                    className={`relative flex items-center justify-center px-3 py-1 text-[13px] font-medium rounded-md transition-all duration-200 ${
                      theme === t.id 
                        ? "text-foreground shadow-sm bg-white dark:bg-[#3a3a3c]" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </SettingRow>
          </SettingGroup>
        </section>

        {/* Wallpaper Group */}
        <section className="space-y-2">
          <h2 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Wallpaper</h2>
          
          <SettingGroup>
            <SettingRow icon={ImageIcon} iconBg="bg-green-500" title="Background Mode">
              <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-lg">
                <button
                  onClick={() => setWallpaperMode("static")}
                  className={`relative flex items-center justify-center px-3 py-1 text-[13px] font-medium rounded-md transition-all duration-200 ${
                    wallpaperMode === "static" ? "text-foreground shadow-sm bg-white dark:bg-[#3a3a3c]" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Static
                </button>
                <button
                  onClick={() => setWallpaperMode("slideshow")}
                  className={`relative flex items-center justify-center px-3 py-1 text-[13px] font-medium rounded-md transition-all duration-200 gap-1.5 ${
                    wallpaperMode === "slideshow" ? "text-foreground shadow-sm bg-white dark:bg-[#3a3a3c]" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Slideshow
                </button>
              </div>
            </SettingRow>
            
            {wallpaperMode === "slideshow" && (
              <SettingRow title="Transition Speed" subtitle="Time between image changes">
                <div className="flex items-center gap-3 w-48">
                  <span className="text-[11px] text-muted-foreground">Fast</span>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={isNaN(slideshowSpeed) ? 30 : slideshowSpeed}
                    onChange={(e) => setSlideshowSpeed(parseInt(e.target.value, 10))}
                    className="ios-slider flex-1"
                  />
                  <span className="text-[11px] text-muted-foreground">Slow</span>
                </div>
              </SettingRow>
            )}

            <SettingRow title="Blur Intensity" subtitle="Frosted glass effect behind windows">
              <div className="flex items-center gap-3 w-48">
                <span className="text-[11px] text-muted-foreground">Low</span>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={isNaN(wallpaperBlur) ? 4 : wallpaperBlur}
                  onChange={(e) => setWallpaperBlur(parseInt(e.target.value, 10))}
                  className="ios-slider flex-1"
                />
                <span className="text-[11px] text-muted-foreground">High</span>
              </div>
            </SettingRow>
          </SettingGroup>

          {/* Image Picker for Static Mode */}
          <AnimatePresence>
            {wallpaperMode === "static" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <SettingGroup>
                    <div className="p-4 bg-white/30 dark:bg-black/10">
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                        {SKY_IMAGES.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setWallpaperIndex(idx)}
                            className={`relative aspect-video rounded-md overflow-hidden transition-all duration-300 ${
                              wallpaperIndex === idx 
                                ? "ring-2 ring-blue-500 shadow-md scale-105 z-10" 
                                : "ring-1 ring-black/10 dark:ring-white/10 hover:ring-black/20 hover:scale-105"
                            }`}
                          >
                            <img 
                              src={SKY_IMAGES[idx]} 
                              alt={`Wallpaper ${idx + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            {wallpaperIndex === idx && (
                              <div className="absolute inset-0 ring-inset ring-2 ring-blue-500 rounded-md pointer-events-none" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </SettingGroup>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* System & Account Group */}
        <section className="space-y-2 pt-4">
          <SettingGroup>
            <button 
              onClick={resetSettings}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white shadow-sm bg-gray-500">
                  <RefreshCw className="w-4 h-4" strokeWidth={2} />
                </div>
                <span className="text-[14px] font-medium text-foreground">Reset Defaults</span>
              </div>
            </button>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] hover:bg-red-500/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white shadow-sm bg-red-500 group-hover:bg-red-600 transition-colors">
                  <LogOut className="w-4 h-4 ml-0.5" strokeWidth={2} />
                </div>
                <span className="text-[14px] font-medium text-red-500 group-hover:text-red-600 transition-colors">Sign Out</span>
              </div>
            </button>
          </SettingGroup>
        </section>

      </div>
    </div>
  );
}
