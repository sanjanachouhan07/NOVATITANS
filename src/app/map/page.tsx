'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserProgress } from "@/lib/user-store";
import { useUser } from "@/firebase";
import { HUD } from "@/components/game/hud";
import { GlitchText } from "@/components/game/glitch-text";
import { LEVELS } from "@/lib/game-data";
import { MapNode } from "@/components/game/map-node";
import { MapRoot } from "@/components/game/map-root";
import { Loader2, ShieldAlert, Move, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { audioEngine } from "@/lib/audio-utils";

const MAP_COORDS = [
  { x: 10, y: 50 },
  { x: 25, y: 30 },
  { x: 40, y: 70 },
  { x: 55, y: 25 },
  { x: 70, y: 75 },
  { x: 85, y: 35 },
  { x: 95, y: 85 }
];

export default function MissionMapPage() {
  const { user, isUserLoading } = useUser();
  const { progress, loading: progressLoading, isTrained } = useUserProgress();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isUserLoading && !progressLoading) {
      if (!user) {
        router.push("/auth");
      } else if (!isTrained) {
        router.push("/intro");
      }
    }
  }, [user, isUserLoading, isTrained, progressLoading, router, mounted]);

  useEffect(() => {
    if (user && !progressLoading && isTrained && !hasGreeted) {
      setHasGreeted(true);
      toast({
        title: "LINK ESTABLISHED",
        description: `Welcome back, Analyst ${user.email?.split('@')[0].toUpperCase()}. Drag to explore the Rift.`,
      });
    }
  }, [user, progressLoading, isTrained, hasGreeted]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setHasMoved(false);
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Bounds check to keep map from dragging too far away
    const maxX = window.innerWidth * 0.5;
    const maxY = window.innerHeight * 0.5;
    
    const boundedX = Math.max(-maxX, Math.min(maxX, newX));
    const boundedY = Math.max(-maxY, Math.min(maxY, newY));

    if (Math.abs(boundedX - position.x) > 5 || Math.abs(boundedY - position.y) > 5) {
      setHasMoved(true);
    }
    setPosition({ x: boundedX, y: boundedY });
  }, [isDragging, dragStart, position]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleExitToSurface = () => {
    audioEngine.announce("Exiting jungle zone. Returning to surface.");
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  const handleNodeInteraction = (levelId: number) => {
    if (hasMoved) return;
    audioEngine.announce("Establishing inter-dimensional link.");
    setTimeout(() => {
      router.push(`/game/${levelId}`);
    }, 400);
  };

  if (isUserLoading || progressLoading || !mounted || !isTrained) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        <p className="text-[10px] text-secondary uppercase font-black tracking-[0.4em] animate-pulse">Navigating the Void...</p>
      </div>
    );
  }

  return (
    <main 
      className="relative min-h-screen bg-transparent overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleMouseDown}
    >
      <HUD />
      
      <div className="spores-bg" style={{ transform: `translate(${position.x * 0.2}px, ${position.y * 0.2}px)` }} />
      <div className="vhs-overlay opacity-30 pointer-events-none" />
      
      <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 text-center space-y-2 md:space-y-4 z-10 pointer-events-none w-full px-4">
        <div className="flex flex-col items-center">
          <span className="text-[8px] md:text-[10px] text-secondary uppercase font-black tracking-[0.3em] md:tracking-[0.5em] glow-red animate-pulse">Subterranean Sector</span>
          <h1 className="text-3xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl">
            <GlitchText text="Mission Hub" />
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pointer-events-auto mt-2">
          <Button 
            variant="outline" 
            onClick={handleExitToSurface}
            className="text-[8px] md:text-[10px] text-white/40 hover:text-white/90 uppercase font-black tracking-widest h-8 md:h-10 px-4 md:px-6 rounded-none border border-white/5 hover:border-white/20 bg-black/80 backdrop-blur-md skew-x-[-8deg] md:skew-x-[-12deg] group transition-all"
          >
            <span className="skew-x-[8deg] md:skew-x-[12deg] flex items-center gap-2">
              <ChevronLeft className="w-3 md:w-4 h-3 md:h-4 transition-transform group-hover:-translate-x-1" />
              Exit to Surface
            </span>
          </Button>
          <div className="flex items-center justify-center gap-2 text-[8px] md:text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] md:tracking-[0.3em]">
            <Move className="w-3 h-3" /> Drag to navigate
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-[16/9] bg-black/40 border border-white/5 shadow-2xl overflow-hidden rounded-none select-none mx-4">
        <div className="absolute inset-0 transition-transform duration-75 ease-out" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
          
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {LEVELS.slice(0, -1).map((level, i) => {
              const start = MAP_COORDS[i];
              const end = MAP_COORDS[i + 1];
              const isActive = progress.unlockedLevels.includes(level.id + 1);
              const isCompleted = progress.completedLevels.includes(level.id);
              return <MapRoot key={`root-${level.id}`} startX={start.x} startY={start.y} endX={end.x} endY={end.y} isActive={isActive} isCompleted={isCompleted} />;
            })}
          </svg>

          <div className="absolute inset-0 z-10">
            {LEVELS.map((level, i) => {
              const isUnlocked = progress.unlockedLevels.includes(level.id);
              const isCompleted = progress.completedLevels.includes(level.id);
              const isCurrent = progress.currentLevel === level.id;
              
              return <MapNode 
                key={level.id} 
                level={level} 
                coords={MAP_COORDS[i]} 
                isUnlocked={isUnlocked} 
                isCompleted={isCompleted} 
                isCurrent={isCurrent}
                onInteraction={() => handleNodeInteraction(level.id)}
              />;
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-wrap items-center gap-4 md:gap-6 text-white/30 z-20 w-full justify-center pointer-events-none px-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(230,51,51,1)] animate-pulse" />
          <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest">Active Site</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/20 border border-white/10" />
          <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest">Dark Sector</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary/40" />
          <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest">Threat: Severe</span>
        </div>
      </div>
    </main>
  );
}
