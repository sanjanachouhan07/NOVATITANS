'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { useUserProgress } from "@/lib/user-store";
import { HUD } from "@/components/game/hud";
import { GlitchText } from "@/components/game/glitch-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Award, 
  Coins, 
  Zap, 
  Trophy, 
  BarChart3, 
  ChevronLeft, 
  ShieldAlert, 
  Star, 
  Rocket, 
  LogOut, 
  Radio, 
  Lock, 
  Search, 
  Ghost, 
  Compass, 
  Flame,
  CheckCircle2,
  History,
  LayoutDashboard
} from "lucide-react";
import { LEVELS } from "@/lib/game-data";
import { audioEngine } from "@/lib/audio-utils";

const IconMap = {
  Radio,
  Lock,
  Search,
  Ghost,
  Compass,
  Zap,
  Flame
};

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { progress, loading: progressLoading } = useUserProgress();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    audioEngine.announce("Connection terminated. Logging out.");
    setTimeout(async () => {
      await auth.signOut();
      router.push("/auth");
    }, 1200);
  };

  const handleBack = () => {
    audioEngine.announce("Returning to previous sector.");
    setTimeout(() => {
      router.back();
    }, 400);
  };

  const handleReturnToMission = () => {
    audioEngine.announce("Returning to mission, hwakin's jungle map is opening.");
    setTimeout(() => {
      router.push('/map');
    }, 400);
  };

  if (isUserLoading || progressLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Rocket className="w-12 h-12 text-secondary animate-bounce" />
        <p className="text-[10px] text-secondary uppercase font-black tracking-[0.4em] animate-pulse">Syncing Personnel Dossier...</p>
      </div>
    );
  }

  if (!user) return null;

  const totalPossibleLevels = LEVELS.length;
  const completedMissionCount = progress.completedLevels.filter(id => id > 0).length;
  
  let currentRank = "New Recruit";
  if (progress.badges.length > 0) {
    currentRank = progress.badges[progress.badges.length - 1];
  } else if (progress.completedLevels.includes(0)) {
    currentRank = "Trained Analyst";
  }

  const earnedBadges = LEVELS.filter(level => progress.badges.includes(level.badgeName));

  return (
    <main className="min-h-screen bg-transparent p-4 pt-28 md:p-8 md:pt-32 flex flex-col items-center overflow-x-hidden">
      <HUD />
      
      <div className="max-w-6xl w-full space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-2 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack} className="text-white/40 hover:text-secondary h-8 w-8">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-[8px] md:text-[10px] text-secondary uppercase font-black tracking-[0.3em] md:tracking-[0.4em] glow-red">Tactical Operations Hub</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white italic flex items-center gap-3 md:gap-4">
              <LayoutDashboard className="w-8 h-8 md:w-12 md:h-12 text-secondary" />
              <GlitchText text="PERSONNEL DASHBOARD" />
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Button onClick={handleReturnToMission} className="bg-secondary hover:bg-secondary/80 px-8 h-12 font-black uppercase tracking-widest rounded-none skew-x-[-12deg] border-glow-red w-full sm:w-auto">
              <span className="skew-x-[12deg]">Return to Mission Map</span>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="border-red-500/20 hover:bg-red-500/10 text-red-500 px-6 h-12 font-black uppercase tracking-widest rounded-none skew-x-[-12deg] w-full sm:w-auto">
              <span className="skew-x-[12deg] flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Terminate Link
              </span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-12 bg-black/60 border-red-500/20 backdrop-blur-xl rounded-none border-glow-red overflow-hidden p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
             <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-none skew-x-[-12deg]">
                <User className="w-10 h-10 md:w-12 md:h-12 text-secondary" />
             </div>
             <div className="flex-1">
                <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em] md:tracking-[0.4em]">Authorized Analyst</p>
                <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter truncate max-w-[280px] sm:max-w-none">
                   {user.email?.split('@')[0].toUpperCase()}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                   <span className="text-[8px] md:text-[9px] text-secondary font-black uppercase bg-secondary/10 px-2 py-0.5 border border-secondary/20">Clearance: L{progress.currentLevel}</span>
                   <span className="text-[8px] md:text-[9px] text-green-500 font-black uppercase bg-green-500/10 px-2 py-0.5 border border-green-500/20">Status: Active</span>
                </div>
             </div>
          </Card>

          <Card className="lg:col-span-8 bg-black/60 border-white/5 backdrop-blur-xl rounded-none border-glow-red overflow-hidden h-full">
            <CardHeader className="border-b border-white/5 bg-white/5 py-3">
              <CardTitle className="text-[10px] md:text-xs uppercase font-black tracking-widest text-secondary flex items-center gap-2">
                < BarChart3 className="w-4 h-4" /> Field Performance Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
              <div className="space-y-1">
                <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">EXP Accumulated</p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl md:text-3xl font-mono font-black text-white">{progress.exp}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Rift Score</p>
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                  <span className="text-xl md:text-3xl font-mono font-black text-white">{progress.score}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Lab Units</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                  <span className="text-xl md:text-3xl font-mono font-black text-white">{progress.coins}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Missions Secured</p>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                  <span className="text-xl md:text-3xl font-mono font-black text-white">{completedMissionCount}/{totalPossibleLevels}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 bg-black/60 border-white/5 backdrop-blur-xl rounded-none border-glow-red flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-4 h-full">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-secondary/10 border-2 border-secondary/40 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(230,51,51,0.2)]">
                {progress.badges.length > 0 ? <Award className="w-10 h-10 md:w-12 md:h-12 text-secondary" /> : <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-secondary/40" />}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] md:tracking-[0.3em]">Designated Rank</p>
              <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">
                {currentRank}
              </h3>
            </div>
          </Card>

          <Card className="lg:col-span-12 bg-black/60 border-white/5 backdrop-blur-xl rounded-none border-glow-red overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 py-3">
              <CardTitle className="text-[10px] md:text-xs uppercase font-black tracking-widest text-secondary flex items-center gap-2">
                <Award className="w-4 h-4" /> Earned Protocol Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
                  {earnedBadges.map((level) => {
                    const Icon = IconMap[level.iconName as keyof typeof IconMap];
                    return (
                      <div key={level.id} className="flex flex-col items-center space-y-2 md:space-y-3 group">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg" style={{ backgroundColor: `${level.color}11`, borderColor: level.color, boxShadow: `0 0 15px ${level.color}33` }}>
                          <Icon className="w-8 h-8 md:w-10 md:h-10" style={{ color: level.color }} />
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white group-hover:text-secondary transition-colors truncate max-w-[80px] md:max-w-none">{level.badgeName}</p>
                          <p className="text-[7px] md:text-[8px] text-muted-foreground uppercase font-bold">Level {level.id} Cleared</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 md:py-12 space-y-3 md:space-y-4 opacity-40">
                  <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-secondary" />
                  <p className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.3em] md:tracking-[0.4em] text-white">No Merits Authorized Yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
