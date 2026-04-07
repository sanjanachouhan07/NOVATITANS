'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/game/glitch-text";
import { useRouter } from "next/navigation";
import { useUserProgress } from "@/lib/user-store";
import { useUser } from "@/firebase";
import { Shield, Radio, Volume2, Ghost, Loader2, Zap, ArrowRight, Activity, LayoutDashboard } from "lucide-react";
import { HUD } from "@/components/game/hud";
import { audioEngine } from "@/lib/audio-utils";

export default function Home() {
  const { progress, loading, isTrained } = useUserProgress();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    audioEngine.playAmbientHum();
  }, []);

  const handleEnterRift = () => {
    audioEngine.announce("Mission resumed. Navigating to map.");
    setTimeout(() => {
      if (user) {
        router.push(isTrained ? '/map' : '/intro');
      } else {
        router.push('/intro');
      }
    }, 400); 
  };

  const handleAuth = () => {
    audioEngine.announce("Security clearance required for Rift entry.");
    setTimeout(() => router.push('/auth'), 400);
  };

  const handleDashboard = () => {
    audioEngine.announce("Opening user dashboard.");
    setTimeout(() => router.push('/profile'), 400);
  };

  if (!mounted || isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        <p className="text-[10px] text-secondary uppercase font-black tracking-[0.4em] animate-pulse">
          INITIALIZING RIFT CONNECTION...
        </p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      <div 
        className="absolute inset-0 bg-[url('https://picsum.photos/seed/creepy-house-rift/1920/1080')] bg-cover bg-center opacity-40 mix-blend-screen scale-110 animate-[pulse_12s_infinite] transition-opacity duration-1000" 
        data-ai-hint="creepy monster"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,20,20,0.15)_0%,transparent_80%)] z-[2]" />
      <div className="spores-bg opacity-30 pointer-events-none z-[3]" />
      
      <HUD />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-secondary/5 rounded-full blur-[180px] animate-pulse-red pointer-events-none z-[4]" />

      <div className="z-10 text-center space-y-8 md:space-y-12 max-w-5xl px-6 animate-in fade-in zoom-in-95 duration-1000 relative py-12">
        <div className="space-y-4 md:space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 md:px-6 py-2 bg-secondary/10 border border-secondary/30 rounded-none text-secondary text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-black mb-2 md:mb-4 animate-pulse skew-x-[-12deg] shadow-[0_0_30px_rgba(230,51,51,0.3)]">
            <Activity className="w-3 md:w-4 h-3 md:h-4" />
            <span>Frequency Locked: Hawkins, IN</span>
          </div>
          
          <div className="relative group cursor-default">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[11rem] font-black tracking-tighter leading-[0.9] md:leading-[0.8] uppercase italic select-none">
              <GlitchText text="CRYPTO" glow className="block text-secondary drop-shadow-[0_0_40px_rgba(230,51,51,0.6)]" />
              <GlitchText text="THINGS" className="block text-white" />
            </h1>
            <div className="absolute -inset-8 bg-secondary/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-6 py-2 md:py-4">
             <div className="h-px w-24 md:w-48 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
             <Ghost className="text-secondary w-6 md:w-10 h-6 md:h-10 animate-bounce" />
             <div className="h-px w-24 md:w-48 bg-gradient-to-l from-transparent via-secondary/50 to-transparent" />
          </div>

          <p className="text-muted-foreground text-sm sm:text-lg md:text-2xl uppercase tracking-[0.2em] md:tracking-[0.4em] mt-2 md:mt-4 max-w-3xl mx-auto leading-relaxed font-black italic">
            The gate is opening. 1984. <br/>
            <span className="text-white text-glow-red animate-pulse">The signals are screaming from the void.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 pt-4 md:pt-8 relative">
          <Button 
            onClick={handleEnterRift}
            size="lg" 
            className="group bg-secondary hover:bg-secondary/90 text-white w-full sm:w-auto px-10 md:px-20 h-16 md:h-24 text-lg md:text-2xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] border-glow-red rounded-none skew-x-[-10deg] md:skew-x-[-15deg] transition-all hover:scale-105 shadow-[0_0_50px_rgba(230,51,51,0.4)]"
          >
            <span className="skew-x-[10deg] md:skew-x-[15deg] flex items-center gap-3 md:gap-4">
              {user ? (isTrained ? 'Continue Mission' : 'Resume Training') : 'Enter The Rift'}
              <ArrowRight className="w-5 md:w-8 h-5 md:h-8 transition-transform group-hover:translate-x-3" />
            </span>
          </Button>

          {user ? (
            <Button 
              onClick={handleDashboard}
              variant="outline" 
              size="lg" 
              className="border-white/20 hover:border-secondary/50 hover:bg-white/5 text-white/70 w-full sm:w-auto px-8 md:px-14 h-16 md:h-24 text-xs md:text-sm font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-none skew-x-[-10deg] md:skew-x-[-15deg] transition-all backdrop-blur-md"
            >
               <span className="skew-x-[10deg] md:skew-x-[15deg] flex items-center gap-2 md:gap-3">
                 <LayoutDashboard className="w-5 md:w-6 h-5 md:h-6" />
                 Tactical Dashboard
               </span>
            </Button>
          ) : (
            <Button 
              onClick={handleAuth}
              variant="outline" 
              size="lg" 
              className="border-white/20 hover:border-secondary/50 hover:bg-white/5 text-white/70 w-full sm:w-auto px-8 md:px-14 h-16 md:h-24 text-xs md:text-sm font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-none skew-x-[-10deg] md:skew-x-[-15deg] transition-all backdrop-blur-md"
            >
               <span className="skew-x-[10deg] md:skew-x-[15deg] flex items-center gap-2 md:gap-3">
                 <Shield className="w-5 md:w-6 h-5 md:h-6" />
                 Join The Agency
               </span>
            </Button>
          )}
        </div>

        <div className="pt-16 md:pt-32 flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16 text-white/20">
          <div className="flex flex-col items-center gap-2">
            <Volume2 className="w-6 md:w-8 h-6 md:h-8 animate-pulse text-secondary/40" />
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-black">Audio Protocol: Ready</span>
          </div>
          <div className="hidden md:block h-16 w-px bg-white/10" />
          <p className="text-[9px] md:text-[11px] max-w-[300px] md:max-w-[350px] leading-tight font-black uppercase tracking-tighter opacity-40 text-center md:text-left italic">
            Property of Hawkins National Laboratory <br/>
            Authorization Level A1 Required <br/>
            © 1984 HNL Special Projects Division
          </p>
        </div>
      </div>

      <div className="vhs-overlay opacity-30 pointer-events-none z-[50]" />
      <div className="scanline z-[60]" />
      
      <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none z-[5]" />
    </main>
  );
}
