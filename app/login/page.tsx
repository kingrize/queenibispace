"use client";

import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Loader2, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {
  const { signInWithEmail, loading, user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Focus password field if email is provided (for local testing/macOS feel)
  useEffect(() => {
    if (email) {
      passwordRef.current?.focus();
    }
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Heart className="w-12 h-12 text-white animate-pulse" fill="white" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      console.error(err);
      setError("Incorrect email or password.");
      // Shake animation effect could be added here by toggling a state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none bg-black">
      
      {/* macOS Blurred Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/sky/SKY_20260625_225630.jpg"
          alt="Login Wallpaper"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[40px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center px-6"
      >
        {/* User Avatar */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 shadow-2xl border-2 border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-md">
          {/* We can use a Heart or a placeholder image if a real avatar isn't available */}
          <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-white drop-shadow-md" fill="white" />
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-8 drop-shadow-md">
          Queenibi
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          
          <div className="w-full relative group mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              disabled={isSubmitting}
              className="w-full h-11 px-4 bg-white/20 hover:bg-white/30 focus:bg-white/30 border border-white/20 rounded-full text-white placeholder:text-white/60 outline-none transition-all text-center backdrop-blur-xl shadow-inner text-[15px]"
            />
          </div>

          <div className="w-full relative group">
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              disabled={isSubmitting}
              className="w-full h-11 px-4 pr-12 bg-white/20 hover:bg-white/30 focus:bg-white/30 border border-white/20 rounded-full text-white placeholder:text-white/60 outline-none transition-all text-center backdrop-blur-xl shadow-inner text-[15px] tracking-widest"
            />
            <button
              type="submit"
              disabled={isSubmitting || !password}
              className={`absolute right-1 top-1 bottom-1 w-9 rounded-full flex items-center justify-center transition-all ${
                password ? "bg-white/90 text-black hover:bg-white" : "text-white/30 pointer-events-none"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" strokeWidth={3} />
              )}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 text-white/90 text-[13px] font-medium bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

      </motion.div>

      {/* macOS Bottom Control Hints (Cancel / Sleep equivalent) */}
      <div className="absolute bottom-12 flex items-center gap-8 text-white/50 z-10 text-[13px] font-medium">
        <button className="flex flex-col items-center gap-2 hover:text-white transition-colors group">
          <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center backdrop-blur-md transition-colors">
            <User className="w-5 h-5" />
          </div>
          <span>Switch User</span>
        </button>
      </div>

    </div>
  );
}
