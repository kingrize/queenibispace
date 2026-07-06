"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart } from "lucide-react";
import { DesktopProvider } from "@/lib/desktop-context";
import { UploadProvider } from "@/lib/upload-context";
import { AlertProvider } from "@/lib/alert-context";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Heart className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <AlertProvider>
      <UploadProvider>
        <DesktopProvider>
          <div className="fixed inset-0 bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary-foreground">
            {/* Subtle decorative background noise / pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
            {children}
          </div>
        </DesktopProvider>
      </UploadProvider>
    </AlertProvider>
  );
}
