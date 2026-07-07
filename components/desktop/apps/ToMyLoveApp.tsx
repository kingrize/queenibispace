"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDesktop } from "@/lib/desktop-context";

const textToType = `To my dearest, <3

Reading your letter completely filled my heart to the brim and left me with the biggest, warmest smile. I don't even know if my words can ever match how deeply you've touched my soul, but I need you to know how incredibly grateful I am for you and every single word you wrote to me.

Looking back, I still can't believe how lucky I am that our paths crossed in Sky. What started as just two characters holding hands, guiding each other through the realms, and lighting candles together, turned into the most beautiful reality. I am so incredibly grateful that we didn't just pass each other by that day, and that we took the time to become friends. Meeting you in that world was a blessing, but having you as my partner now is a dream come true. You've brought the magic of that beautiful space straight into my real life.

The way you treat me, the way you love me, and how you support me through everything including my everyday needs is something I've never experienced before. You make me feel so safe, so seen, and so deeply cherished. Even through a screen, your warmth reaches me across the miles. You are my safe haven, my beautiful escape from the chaos of the world, and my absolute favorite part of every single day.

Please never doubt how much you mean to me. I love every single version of you, too. I love your kind heart, your laugh, and the comfort you give me without even trying. You don't ever have to worry about losing me, because my heart is entirely yours. I am not going anywhere; I am here for you today, tomorrow, and for the rest of our lives.

I promise to always be here for you, to hold your hand through the dark days just like we do in Sky, and to celebrate you on your best days. Thank you for showing me what true love feels like. I can't wait for the day when we don't have to say goodbye through a screen anymore, and I can finally hold you in my arms.

I love you more than words can say, and I can't wait to make a lifetime of real-world memories with you.

Forever yours,

- Frogini <3`;

const ParticleBackground = ({ isInteractive }: { isInteractive: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactiveRef = useRef(isInteractive);

  useEffect(() => {
    interactiveRef.current = isInteractive;
  }, [isInteractive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setCanvasSize();

    const isMobile = width < 768;
    const particleCount = isMobile ? 50 : 80;

    const particles: { x: number; y: number; vx: number; vy: number; radius: number; opacity: number; baseOpacity: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseOpacity = Math.random() * 0.5 + 0.1;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * (isMobile ? 1.8 : 1.5) + 0.5,
        opacity: baseOpacity,
        baseOpacity
      });
    }

    let animationFrameId: number;
    let pointer = { x: width / 2, y: height / 2, active: false };
    let repulse = { x: -1000, y: -1000, active: false };

    const handleResize = () => {
      setCanvasSize();
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
        pointer.active = true;
      }
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const handleTouchEnd = () => {
      pointer.active = false;
    };
    window.addEventListener("touchend", handleTouchEnd);

    const doRepulse = (x: number, y: number) => {
      if (!interactiveRef.current) return;
      repulse.x = x;
      repulse.y = y;
      repulse.active = true;
      setTimeout(() => {
        repulse.active = false;
      }, 120);
    };

    const handleClick = (e: MouseEvent) => {
      doRepulse(e.clientX, e.clientY);
    };
    window.addEventListener("click", handleClick);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
        pointer.active = true;
        doRepulse(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      particles.forEach((p, idx) => {
        // Repulse on click/tap
        if (repulse.active) {
          const dx = p.x - repulse.x;
          const dy = p.y - repulse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repulseRadius = isMobile ? 160 : 200;
          if (dist < repulseRadius && dist > 0) {
            const force = (repulseRadius - dist) / repulseRadius;
            p.vx += (dx / dist) * force * (isMobile ? 12 : 15);
            p.vy += (dy / dist) * force * (isMobile ? 12 : 15);
          }
        }

        // Damping
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.5) {
          p.vx *= 0.92;
          p.vy *= 0.92;
        }

        // Attract towards pointer when interactive and not repulsing
        if (!repulse.active && interactiveRef.current && pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 30) {
            p.vx += (dx / dist) * 0.02;
            p.vy += (dy / dist) * 0.02;
          }
        }

        // Gentle random drift
        p.vx += (Math.random() - 0.5) * 0.08;
        p.vy += (Math.random() - 0.5) * 0.08;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle twinkling
        p.opacity = p.baseOpacity + Math.sin(time * 2 + idx) * 0.15;

        // Draw with soft glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.opacity)})`;
        ctx.fill();

        // Draw glow halo for larger particles
        if (p.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(199, 210, 254, ${Math.max(0, p.opacity * 0.08)})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

export default function ToMyLoveApp() {
  const { closeApp } = useDesktop();
  const [stage, setStage] = useState<"welcome" | "reading">("welcome");
  const [displayedText, setDisplayedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const typingAudioRef = useRef<HTMLAudioElement>(null);

  // Smooth auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [displayedText]);

  useEffect(() => {
    if (stage === "reading") {
      let isCancelled = false;

      const runSequence = async () => {
        const type = async (text: string, speed = 80) => {
          if (typingAudioRef.current) {
            typingAudioRef.current.volume = 0.25;
            typingAudioRef.current.play().catch(console.error);
          }
          for (let i = 1; i <= text.length; i++) {
            if (isCancelled) return;
            setDisplayedText(text.substring(0, i));
            await new Promise(r => setTimeout(r, speed));
          }
          if (typingAudioRef.current) typingAudioRef.current.pause();
        };

        const erase = async (text: string, speed = 40) => {
          if (typingAudioRef.current) {
            typingAudioRef.current.volume = 0.25;
            typingAudioRef.current.play().catch(console.error);
          }
          for (let i = text.length - 1; i >= 0; i--) {
            if (isCancelled) return;
            setDisplayedText(text.substring(0, i));
            await new Promise(r => setTimeout(r, speed));
          }
          if (typingAudioRef.current) typingAudioRef.current.pause();
        };

        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

        await wait(3500);

        if (isCancelled) return;
        await type("Hi");
        await wait(1000);
        await erase("Hi");
        await wait(500);

        if (isCancelled) return;
        await type("This is Jiya");
        await wait(1200);
        await erase("This is Jiya");
        await wait(500);

        if (isCancelled) return;
        await type("Your love");
        await wait(1500);
        await erase("Your love");
        await wait(1000);

        if (isCancelled) return;
        if (audioRef.current) {
          audioRef.current.volume = 0.5;
          audioRef.current.play().catch(console.error);
        }
        await type(textToType, 35);

        if (!isCancelled) {
          setTypingDone(true);
        }
      };

      runSequence();

      return () => {
        isCancelled = true;
      };
    }
  }, [stage]);

  const handleEnter = useCallback(() => {
    setStage("reading");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col bg-[#050510] overflow-hidden font-serif"
    >
      <audio ref={audioRef} src="/music/Those Eyes.mp3" loop />
      <audio ref={typingAudioRef} src="/music/typing_effect.mp3" loop />

      {/* Mystical Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft glowing ambient lights */}
        <div className="absolute top-[10%] left-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-indigo-500/10 blur-[100px] md:blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-pink-500/10 blur-[100px] md:blur-[120px] rounded-full mix-blend-screen" />

        {/* Interactive Wandering Stars */}
        <ParticleBackground isInteractive={typingDone} />
      </div>

      <AnimatePresence mode="wait">
        {stage === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-6"
          >
            <motion.div
              animate={{ y: [-12, 12, -12] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-10 h-10 sm:w-14 sm:h-14 text-indigo-300/60 mb-8 sm:mb-10" strokeWidth={1} />
            </motion.div>

            <h1
              className="text-2xl sm:text-3xl md:text-5xl text-indigo-50/90 font-light tracking-[0.15em] sm:tracking-[0.25em] mb-10 sm:mb-14"
              style={{ textShadow: '0 0 30px rgba(165, 180, 252, 0.4)' }}
            >
              A REALM FOR YOU
            </h1>

            <button
              onClick={handleEnter}
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full border border-indigo-300/20 text-indigo-200/70 hover:bg-indigo-500/10 hover:text-white hover:border-indigo-300/40 active:bg-indigo-500/20 active:scale-95 transition-all duration-700 tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm uppercase backdrop-blur-md"
            >
              Enter softly
            </button>
          </motion.div>
        )}

        {stage === "reading" && (
          <motion.div
            key="reading"
            ref={scrollRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5, delay: 0.5 }}
            className="relative z-10 flex-1 flex flex-col w-full h-full overflow-y-auto custom-scrollbar"
          >
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4, duration: 2 }}
              onClick={() => closeApp("to_my_love")}
              className="fixed top-4 left-4 sm:top-6 sm:left-6 md:top-10 md:left-10 z-50 p-2.5 sm:p-3 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/40 hover:text-white backdrop-blur-lg transition-all duration-500 border border-white/5"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <div className="w-full max-w-3xl mx-auto py-16 sm:py-20 md:py-24 px-5 sm:px-6 md:px-12 flex flex-col items-center min-h-full">
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-12 sm:mb-16 md:mb-20"
              >
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-pink-300/80 fill-pink-300/10 drop-shadow-[0_0_20px_rgba(244,114,182,0.4)]" strokeWidth={1} />
              </motion.div>

              <div className="w-full text-indigo-50/80 leading-[1.9] sm:leading-[2] md:leading-[2.2] text-base sm:text-lg md:text-xl tracking-normal sm:tracking-wide whitespace-pre-wrap font-light">
                {displayedText}
                {displayedText.length < textToType.length && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-[2px] h-[1.2em] ml-1 sm:ml-2 bg-pink-300/70 align-middle rounded-full"
                  />
                )}
              </div>

              {/* Completion indicator */}
              {typingDone && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 3, delay: 2 }}
                  className="mt-16 sm:mt-20 md:mt-24 pb-12 sm:pb-16 md:pb-20 flex flex-col items-center gap-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-300/40 fill-pink-300/20" strokeWidth={1} />
                  </motion.div>
                  <span className="text-[10px] sm:text-xs text-indigo-200/30 tracking-[0.2em] uppercase">
                    with all my heart
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
