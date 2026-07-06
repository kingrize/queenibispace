"use client";

import { motion } from "framer-motion";
import { Gamepad2, BrainCircuit, Sparkles } from "lucide-react";
import { useDesktop } from "@/lib/desktop-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function GamesHubApp() {
  const { openApp } = useDesktop();

  const games = [
    {
      id: "memory_game",
      title: "Memory Match",
      description: "Find the matching pairs. A classic game of memory with a cute twist.",
      icon: BrainCircuit,
      color: "bg-primary/20 text-primary",
      isReady: true,
    },
    {
      id: "love-meter",
      title: "Love Meter",
      description: "How much do we love each other today? (Hint: It's always 100%)",
      icon: Sparkles,
      color: "bg-accent/20 text-accent-foreground",
      isReady: false,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background/50">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" /> Minigames
          </h1>
          <p className="text-muted-foreground text-sm">Little playful distractions just for us.</p>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={game.isReady ? { y: -5 } : {}}
              onClick={() => game.isReady && openApp(game.id, game.title, game.icon)}
              className="h-full"
            >
              <Card 
                className={`h-full flex flex-col items-start gap-4 ${game.isReady ? "hover-lift cursor-pointer shadow-md hover:shadow-xl" : "opacity-70 grayscale-[0.2]"}`}
              >
                <div className={`p-4 rounded-2xl ${game.color} shadow-inner`}>
                  <game.icon className="w-8 h-8 drop-shadow-sm" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">{game.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                    {game.description}
                  </p>
                  
                  <div className="mt-auto">
                    {game.isReady ? (
                      <Button variant="secondary" className="w-full">
                        Play Now
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
