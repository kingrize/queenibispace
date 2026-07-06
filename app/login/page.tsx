"use client";

import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading, user } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Heart className="w-12 h-12 text-primary animate-pulse" fill="currentColor" />
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
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLoginMode) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      const errorCode = err.code;
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (errorCode === 'auth/email-already-in-use') {
        setError("An account with this email already exists.");
      } else if (errorCode === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in with Google.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted to-background relative overflow-hidden p-4">
      {/* Background Decorative Motifs */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-20 left-20 text-accent/30 pointer-events-none"
      >
        <Sparkles className="w-24 h-24" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 right-20 text-primary/20 pointer-events-none"
      >
        <Heart className="w-32 h-32" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", type: "spring" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="p-8 sm:p-12 text-center border-white/60 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center mb-6 relative">
            <div className="relative">
              <Heart className="w-16 h-16 text-primary drop-shadow-md" fill="currentColor" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute -top-2 -right-2 text-accent"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3 font-sans tracking-tight">
            Welcome to Our Space
          </h1>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            A private little world, just for us. Sign in to open the door to our memories.
          </p>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-left font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              disabled={isSubmitting}
              icon={<Mail className="w-5 h-5" />}
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isSubmitting}
              icon={<Lock className="w-5 h-5" />}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2"
              size="lg"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLoginMode ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60"></div>
            </div>
            <div className="relative flex justify-center text-xs font-medium">
              <span className="bg-white/80 dark:bg-black/80 px-4 py-1 rounded-full text-muted-foreground border border-border/40 backdrop-blur-md">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full gap-3 bg-white/50 dark:bg-black/30 backdrop-blur-md"
          >
            <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </Button>

          <div className="mt-8 text-sm text-muted-foreground flex items-center justify-center gap-1">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            <Button 
              variant="link"
              type="button" 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null);
              }} 
              disabled={isSubmitting}
              className="px-1 h-auto py-0 font-semibold"
            >
              {isLoginMode ? "Sign Up" : "Sign In"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
