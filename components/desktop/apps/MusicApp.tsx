"use client";

import React, { useState } from "react";
import { 
  Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, Search, Mic2, Radio, LayoutGrid, 
  Clock, Music2, Heart, MoreHorizontal
} from "lucide-react";
import { useMedia, TRACKS } from "@/lib/media-context";

export default function MusicApp() {
  const {
    currentTrackIndex,
    currentTrack,
    isPlaying,
    progress,
    volume,
    isMuted,
    currentTime,
    duration,
    togglePlay,
    skipForward,
    skipBackward,
    handleSeek,
    handleVolume,
    playTrack
  } = useMedia();

  const [activeTab, setActiveTab] = useState("Listen Now");

  // Format time (e.g. 1:30)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#f2f2f7] dark:bg-[#1e1e1e] font-sans overflow-hidden selection:bg-rose-500/30 text-foreground">
      
      {/* Top Playback Bar (macOS style) */}
      <div className="h-[60px] shrink-0 bg-white/70 dark:bg-[#2c2c2e]/70 backdrop-blur-xl border-b border-black/10 dark:border-white/10 flex items-center justify-between px-4 z-20">
        
        {/* Left: Window controls spacer & Playback controls */}
        <div className="flex items-center w-1/3 min-w-[200px] gap-6">
          <div className="w-[60px]" /> {/* Spacer for window traffic lights */}
          <div className="flex items-center gap-4 text-foreground/80">
            <button onClick={skipBackward} className="hover:text-foreground transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button onClick={togglePlay} className="hover:text-foreground transition-colors flex items-center justify-center">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>
            <button onClick={skipForward} className="hover:text-foreground transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>

        {/* Center: LCD Display */}
        <div className="flex-1 max-w-[400px] flex items-center justify-center">
          <div className="w-full h-[44px] bg-white dark:bg-[#1c1c1e] rounded-md border border-black/5 dark:border-white/10 shadow-sm flex items-center px-3 gap-3 overflow-hidden group">
            <img 
              src={currentTrack.cover} 
              alt={currentTrack.album} 
              className="w-8 h-8 rounded-[4px] object-cover shadow-sm"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between text-[11px] leading-tight">
                <span className="font-semibold truncate">{currentTrack.title}</span>
                <span className="text-muted-foreground tabular-nums ml-2">
                  {formatTime(currentTime)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground leading-tight">
                <span className="truncate">{currentTrack.artist}</span>
                <span className="tabular-nums ml-2">-{duration ? formatTime(duration - currentTime) : "0:00"}</span>
              </div>
              
              {/* Custom Range Slider for Progress */}
              <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden relative group-hover:h-1.5 transition-all">
                <div 
                  className="absolute top-0 left-0 bottom-0 bg-black/40 dark:bg-white/50 rounded-full pointer-events-none" 
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
            </div>
          </div>
        </div>

        {/* Right: Volume & Search */}
        <div className="flex items-center justify-end w-1/3 min-w-[200px] gap-4">
          <div className="flex items-center gap-2 w-28 text-muted-foreground">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <input 
              type="range" 
              min="0" max="1" step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolume(parseFloat(e.target.value))}
              className="ios-slider flex-1"
            />
          </div>
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search" 
              className="h-7 w-40 pl-8 pr-3 text-[12px] bg-black/5 dark:bg-white/10 border border-transparent focus:border-black/20 dark:focus:border-white/20 rounded-md outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-[240px] shrink-0 bg-black/[0.02] dark:bg-white/[0.02] border-r border-black/5 dark:border-white/5 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-6">
          
          <div className="space-y-1">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Apple Music</h3>
            {[
              { id: "Listen Now", icon: Play },
              { id: "Browse", icon: LayoutGrid },
              { id: "Radio", icon: Radio },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors ${
                  activeTab === item.id 
                    ? "bg-rose-500/10 text-rose-500 font-medium" 
                    : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={activeTab === item.id ? 2.5 : 2} />
                {item.id}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Library</h3>
            {[
              { id: "Recently Added", icon: Clock },
              { id: "Artists", icon: Mic2 },
              { id: "Albums", icon: LayoutGrid },
              { id: "Songs", icon: Music2 },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors ${
                  activeTab === item.id 
                    ? "bg-rose-500/10 text-rose-500 font-medium" 
                    : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={activeTab === item.id ? 2.5 : 2} />
                {item.id}
              </button>
            ))}
          </div>

        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#1e1e1e]">
          
          {/* Header Banner */}
          <div className="h-48 bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex flex-col justify-end p-8 border-b border-black/5 dark:border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 dark:bg-white/5 mix-blend-overlay"></div>
            <h1 className="text-4xl font-bold text-foreground relative z-10">{activeTab}</h1>
          </div>

          {/* Track List */}
          <div className="p-6">
            <div className="flex items-center text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
              <div className="w-10 text-center">#</div>
              <div className="flex-1">Title</div>
              <div className="flex-1 hidden sm:block">Album</div>
              <div className="w-20 text-right"><Clock className="w-3.5 h-3.5 inline-block" /></div>
            </div>
            
            <div className="space-y-1">
              {TRACKS.map((track, idx) => {
                const isPlayingThis = currentTrackIndex === idx;
                return (
                  <div 
                    key={track.id}
                    onDoubleClick={() => playTrack(idx)}
                    className={`flex items-center p-2 rounded-md transition-colors cursor-default group ${
                      isPlayingThis 
                        ? "bg-rose-500/10" 
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="w-10 flex justify-center items-center">
                      {isPlayingThis && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-3">
                          <span className="w-[3px] bg-rose-500 h-[60%] animate-pulse rounded-full"></span>
                          <span className="w-[3px] bg-rose-500 h-[100%] animate-pulse rounded-full delay-75"></span>
                          <span className="w-[3px] bg-rose-500 h-[40%] animate-pulse rounded-full delay-150"></span>
                        </div>
                      ) : (
                        <span className={`text-[12px] ${isPlayingThis ? 'text-rose-500' : 'text-muted-foreground group-hover:hidden'}`}>{idx + 1}</span>
                      )}
                      {!isPlayingThis && (
                        <button 
                          onClick={() => playTrack(idx)}
                          className="hidden group-hover:block text-foreground"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1 flex items-center gap-3">
                      <img src={track.cover} alt="" className="w-8 h-8 rounded-[4px] object-cover shadow-sm" />
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-medium ${isPlayingThis ? 'text-rose-500' : 'text-foreground'}`}>
                          {track.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{track.artist}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 hidden sm:block text-[13px] text-muted-foreground">
                      {track.album}
                    </div>
                    
                    <div className="w-20 text-right text-[13px] text-muted-foreground tabular-nums flex justify-end gap-2 pr-2">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      {track.duration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
