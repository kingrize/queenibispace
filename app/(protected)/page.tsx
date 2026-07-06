"use client";

import { useAuth } from "@/lib/auth-context";
import { useDesktop } from "@/lib/desktop-context";
import { Flower2, Gamepad2, FileText, Music, MessageCircle } from "lucide-react";
import { DesktopIcon } from "@/components/desktop/DesktopIcon";
import { Window } from "@/components/desktop/Window";
import { Taskbar } from "@/components/desktop/Taskbar";
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { MediaProvider } from "@/lib/media-context";
import { DynamicIsland } from "@/components/desktop/DynamicIsland";

// Import the Apps
import GalleryApp from "@/components/desktop/apps/GalleryApp";
import GamesHubApp from "@/components/desktop/apps/GamesHubApp";
import MemoryGameApp from "@/components/desktop/apps/MemoryGameApp";
import SettingsApp from "@/components/desktop/apps/SettingsApp";
import NotesApp from "@/components/desktop/apps/NotesApp";
import MusicApp from "@/components/desktop/apps/MusicApp";
import ChatApp from "@/components/desktop/apps/ChatApp";
import { useEffect, useState } from "react";

// App Registry
const APP_REGISTRY: Record<string, React.ReactNode> = {
  gallery: <GalleryApp />,
  games: <GamesHubApp />,
  memory_game: <MemoryGameApp />,
  settings: <SettingsApp />,
  notes: <NotesApp />,
  music: <MusicApp />,
  chat: <ChatApp />,
};

export default function DesktopEnvironment() {
  const { user } = useAuth();
  const { windows } = useDesktop();
  
  // A small trick to prevent hydration mismatch for random positions if we had them,
  // but we use static grid for icons to keep it clean.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <MediaProvider>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Dynamic Island (Media Player) */}
        <DynamicIsland />

        {/* Desktop Wallpaper */}
      <Wallpaper />

      <div className="relative z-10 p-4 flex flex-col gap-2 items-start content-start flex-wrap h-[calc(100vh-5rem)]">
        <DesktopIcon id="gallery" title="Gallery" icon={Flower2} delay={0.1} />
        <DesktopIcon id="notes" title="Notes" icon={FileText} delay={0.15} />
        <DesktopIcon id="games" title="Minigames" icon={Gamepad2} delay={0.2} />
        <DesktopIcon id="music" title="Music" icon={Music} delay={0.25} />
        <DesktopIcon id="chat" title="Messages" icon={MessageCircle} delay={0.3} />
      </div>

      {/* Render Open Windows */}
      {windows.map((win) => (
        <Window key={win.id} windowState={win}>
          {APP_REGISTRY[win.id] || (
            <div className="p-8 flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>App not found.</p>
            </div>
          )}
        </Window>
      ))}

      {/* Taskbar / Dock */}
      <Taskbar />
    </div>
    </MediaProvider>
  );
}
