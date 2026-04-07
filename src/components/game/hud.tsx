'use client';

import { useUserProgress } from "@/lib/user-store";
import { useAuth, useUser } from "@/firebase";
import { Coins, Trophy, Radio, Zap, User, LogOut, ShieldAlert, Loader2, Lock, Search, Ghost, Compass, Zap as ZapIcon, Flame, ChevronLeft } from "lucide-react";
import { GlitchText } from "./glitch-text";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { LEVELS } from "@/lib/game-data";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { audioEngine } from "@/lib/audio-utils";

const IconMap = {
  Radio,
  Lock,
  Search,
  Ghost,
  Compass,
  Zap: ZapIcon,
  Flame
};

export function HUD() {
  const { progress, loading } = useUserProgress();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const badgesEarned = progress.badges || [];
  const totalMissions = LEVELS.length;

  const handleLogout = async () => {
    audioEngine.playUI();
    audioEngine.announce("Terminating inter-dimensional link.");
    setTimeout(async () => {
      await auth.signOut();
      router.push("/auth");
    }, 1200);
  };

  const handleBack = () => {
    audioEngine.playUI();
    audioEngine.announce("Returning to previous sector.");
    setTimeout(() => {
      router.back();
    }, 1000);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    audioEngine.playUI();
    audioEngine.announce("Opening personnel dossier.");
  };

  const showBackButton = pathname !== '/' && pathname !== '/auth';

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 p-3 md:p-4 z-40 flex justify-between items-center pointer-events-none">
        <div className="flex items-center space-x-2 md:space-x-4 bg-black/60 backdrop-blur-md border border-red-500/20 p-2 px-4 md:px-6 rounded-xl pointer-events-auto shadow-2xl">
          <Loader2 className="w-3 md:w-4 h-3 md:h-4 text-secondary animate-spin" />
          <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-secondary animate-pulse">Synchronizing Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 p-2 md:p-4 z-40 flex flex-col md:flex-row gap-2 md:justify-between md:items-center pointer-events-none">
      <div className="flex items-center space-x-2">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleBack}
            className="h-8 w-8 md:h-10 md:w-10 text-white/40 hover:text-secondary border border-white/5 bg-black/60 backdrop-blur-md rounded-xl pointer-events-auto shadow-[0_0_20px_rgba(230,51,51,0.1)] transition-all hover:scale-110 shrink-0"
          >
            <ChevronLeft className="w-5 md:w-6 h-5 md:h-6" />
          </Button>
        )}
        
        <div className="flex items-center space-x-2 md:space-x-4 bg-black/60 backdrop-blur-md border border-red-500/20 p-1.5 md:p-2 pl-3 rounded-xl pointer-events-auto shadow-[0_0_20px_rgba(230,51,51,0.1)] overflow-hidden">
          {user ? (
            <>
              <Link href="/profile" onMouseDown={(e) => e.stopPropagation()} onClick={handleProfileClick} className="flex items-center space-x-2 group">
                <div className="p-1 md:p-1.5 bg-secondary/20 rounded-lg group-hover:bg-secondary transition-colors">
                  <User className="w-4 md:w-5 h-4 md:h-5 text-secondary group-hover:text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="hidden sm:block text-[8px] uppercase font-black tracking-widest text-muted-foreground">Personnel Status</span>
                  <span className="text-[8px] md:text-[10px] font-mono text-white group-hover:text-secondary transition-colors uppercase font-bold italic">FILE OPEN</span>
                </div>
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center space-x-1.5 md:space-x-2">
                <Zap className="w-4 md:w-5 h-4 md:h-5 text-secondary animate-pulse" />
                <span className="hidden sm:block text-[10px] font-mono text-green-500 font-bold uppercase">Linked</span>
              </div>
            </>
          ) : (
            <Link href="/auth" onMouseDown={(e) => e.stopPropagation()} onClick={() => { audioEngine.playUI(); audioEngine.announce("Security clearance required for Rift entry."); }} className="flex items-center space-x-2 group">
              <div className="p-1 md:p-1.5 bg-white/5 rounded-lg group-hover:bg-secondary transition-colors">
                <ShieldAlert className="w-4 md:w-5 h-4 md:h-5 text-white/40 group-hover:text-white" />
              </div>
              <div className="flex flex-col">
                <span className="hidden sm:block text-[8px] uppercase font-black tracking-widest text-muted-foreground">Guest Mode</span>
                <span className="text-[8px] md:text-[10px] font-mono text-secondary group-hover:text-white transition-colors uppercase font-bold">LOGIN</span>
              </div>
            </Link>
          )}
          
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center space-x-1.5 md:space-x-2">
            <Radio className="w-4 md:w-5 h-4 md:h-5 text-secondary" />
            <span className="text-xs md:text-sm font-mono text-white">
              CH {progress.currentLevel || 0}
            </span>
          </div>
          
          {user && (
            <>
              <div className="h-4 w-px bg-white/10" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={handleLogout}
                      className="h-7 w-7 md:h-8 md:w-8 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors pointer-events-auto"
                    >
                      <LogOut className="w-3.5 md:w-4 h-3.5 md:h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black border-red-500/50">
                    <p className="text-[10px] uppercase font-black text-red-500">Terminate Link</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {user && (
        <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-4 bg-black/60 backdrop-blur-md border border-red-500/20 p-2 md:p-3 rounded-xl pointer-events-auto shadow-[0_0_20px_rgba(230,51,51,0.1)] self-start md:self-auto">
          <div className="flex items-center space-x-2 md:space-x-3 mr-1 md:mr-2">
            <TooltipProvider>
              <div className="flex -space-x-1.5">
                {badgesEarned.length > 0 ? (
                  LEVELS.filter(l => badgesEarned.includes(l.badgeName)).slice(-4).map((level, i) => {
                    const Icon = IconMap[level.iconName as keyof typeof IconMap];
                    return (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div 
                            className="w-5 h-5 md:w-6 md:h-6 rounded-full border flex items-center justify-center animate-in zoom-in"
                            style={{ backgroundColor: `${level.color}33`, borderColor: level.color }}
                          >
                            <Icon className="w-3 md:w-3.5 h-3 md:h-3.5" style={{ color: level.color }} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-secondary/50">
                          <p className="text-[8px] md:text-[10px] uppercase font-bold" style={{ color: level.color }}>{level.badgeName}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })
                ) : (
                  <div className="text-[7px] md:text-[8px] text-muted-foreground uppercase font-black px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">
                    No Badges
                  </div>
                )}
              </div>
            </TooltipProvider>
          </div>

          <div className="flex items-center space-x-1.5 md:space-x-2">
            <Coins className="w-4 md:w-5 h-4 md:h-5 text-yellow-500" />
            <GlitchText text={progress.coins.toString()} className="text-[10px] md:text-sm font-mono font-bold text-white" />
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center space-x-1.5 md:space-x-2">
            <Trophy className="w-4 md:w-5 h-4 md:h-5 text-secondary" />
            <span className="text-[10px] md:text-sm font-mono text-white">
              {progress.completedLevels.filter(id => id > 0).length}/{totalMissions}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
