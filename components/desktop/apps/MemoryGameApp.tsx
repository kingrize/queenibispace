"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

const CARDS = ["🍓", "🐞", "🍵", "✨", "🌸", "🦋"];

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  const initializeGame = () => {
    const shuffled = [...CARDS, ...CARDS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return; // Prevent flipping more than 2
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;

      if (cards[firstId].emoji === cards[secondId].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstId].isMatched = true;
          matchedCards[secondId].isMatched = true;
          setCards(matchedCards);
          setMatches((m) => m + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstId].isFlipped = false;
          resetCards[secondId].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 max-w-3xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between w-full">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold text-foreground">Memory Match</h1>
          <p className="text-muted-foreground font-medium">
            Moves: {moves} <span className="mx-2 text-border">•</span> Matches: {matches} / {CARDS.length}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={initializeGame}
          className="gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" /> Restart
        </Button>
      </div>

      {matches === CARDS.length && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary/20 text-primary-foreground p-6 rounded-2xl text-center"
        >
          <h2 className="text-2xl font-bold mb-2">You did it! 🎉</h2>
          <p>Completed in {moves} moves. Perfect harmony!</p>
        </motion.div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
            whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
            className="aspect-square perspective-1000"
            onClick={() => handleCardClick(card.id)}
          >
            <motion.div
              className="w-full h-full relative preserve-3d cursor-pointer"
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Front of card (hidden) */}
              <div className="absolute inset-0 backface-hidden bg-card border-2 border-primary/20 rounded-2xl shadow-sm flex items-center justify-center">
                <span className="text-primary/30 text-3xl font-bold">?</span>
              </div>
              
              {/* Back of card (emoji) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl shadow-md border border-primary/10 flex items-center justify-center text-4xl">
                {card.emoji}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
