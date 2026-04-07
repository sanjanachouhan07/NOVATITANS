'use client';

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HUD } from "@/components/game/hud";
import { DecoderPanel } from "@/components/game/decoder-panel";
import { GlitchText } from "@/components/game/glitch-text";
import { LEVELS, LevelDef, AlgorithmType } from "@/lib/game-data";
import { useUserProgress } from "@/lib/user-store";
import { useUser } from "@/firebase";
import { getNewProblem, getHint } from "@/app/actions/game-actions";
import { DynamicProblemGenerationOutput } from "@/ai/flows/dynamic-problem-generation-flow";
import { ContextualHintSystemOutput } from "@/ai/flows/contextual-hint-system-flow";
import { HelpCircle, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ChevronRight, Award, Timer, Trophy, Radio, Lock, Search, Ghost, Compass, Zap, Flame, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { audioEngine } from "@/lib/audio-utils";
import Image from "next/image";

const IconMap = {
  Radio,
  Lock,
  Search,
  Ghost,
  Compass,
  Zap,
  Flame
};

export default function GameLevelPage({ params }: { params: Promise<{ levelId: string }> }) {
  const { levelId } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const { progress, completeLevel, loading: progressLoading } = useUserProgress();
  
  const levelIndex = parseInt(levelId);
  const currentLevelDef = LEVELS.find(l => l.id === levelIndex);
  const BadgeIcon = currentLevelDef ? IconMap[currentLevelDef.iconName as keyof typeof IconMap] : Award;

  const [problem, setProblem] = useState<DynamicProblemGenerationOutput | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [hint, setHint] = useState<ContextualHintSystemOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [showGrandMastery, setShowGrandMastery] = useState(false);
  
  const problemHistory = useRef<string[]>([]);

  const fetchNewProblem = async () => {
    setLoading(true);
    setError(null);
    setHint(null);
    setUserInput("");
    setSuccess(false);

    try {
      if (!currentLevelDef) throw new Error("Invalid Level Protocol Detected.");

      let result: DynamicProblemGenerationOutput | null = null;
      let attempts = 0;
      
      while (attempts < 5) {
        const newRes = await getNewProblem({
          algorithmType: currentLevelDef.algorithm as any,
          difficulty: solvedCount < 2 ? 'easy' : solvedCount < 4 ? 'medium' : 'hard',
          seed: Math.random(),
          questionNumber: solvedCount + 1
        });

        if (newRes && !problemHistory.current.includes(newRes.originalMessage)) {
          result = newRes;
          break;
        }
        attempts++;
      }

      if (!result) throw new Error("Could not find a unique signal. Rift interference is high.");

      problemHistory.current.push(result.originalMessage);
      setProblem(result);
    } catch (err: any) {
      setError(err.message || "Failed to establish Rift link.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (levelComplete) return;
    if (levelIndex > 0) {
      fetchNewProblem();
    } else if (levelIndex === 0) {
      router.push('/intro');
    }
  }, [levelId, solvedCount, levelComplete]);

  const handleSubmit = async () => {
    if (!userInput || !problem || success) return;
    setChecking(true);
    audioEngine.announce("System breach initiated");
    
    const isCorrect = userInput.trim().toUpperCase() === problem.originalMessage.toUpperCase();
    
    if (isCorrect) {
      setSuccess(true);
      audioEngine.playVerify();
      
      setTimeout(() => {
        const nextSolved = solvedCount + 1;
        const required = currentLevelDef?.requiredProblems || 5;
        
        if (nextSolved >= required) {
          if (levelIndex === 7) {
            setShowGrandMastery(true);
            audioEngine.playGlitch(); 
          }
          setLevelComplete(true);
          completeLevel(
            levelIndex, 
            currentLevelDef?.reward || 50, 
            currentLevelDef?.badgeName,
            currentLevelDef?.expReward || 100,
            currentLevelDef?.scoreReward || 500
          );
        } else {
          setSolvedCount(nextSolved);
        }
      }, 1000);
    } else {
      audioEngine.playError();
      setError("Decryption failed. Signal checksum mismatch.");
      setTimeout(() => setError(null), 2000);
    }
    setChecking(false);
  };

  const fetchHint = async () => {
    if (!problem) return;
    audioEngine.announce("Requesting tactical insight.");
    setLoading(true);
    try {
      const result = await getHint({
        algorithm: (problem.algorithmUsed.charAt(0).toUpperCase() + problem.algorithmUsed.slice(1)) as any,
        encryptedMessage: problem.encryptedMessage,
        difficulty: solvedCount < 2 ? 'easy' : solvedCount < 4 ? 'medium' : 'hard'
      });
      setHint(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (progressLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        <p className="text-[10px] text-secondary uppercase font-black tracking-[0.4em] animate-pulse">Synchronizing with Laboratory Mainframe...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-foreground p-4 pt-20 md:p-8 md:pt-24 flex flex-col items-center overflow-x-hidden">
      <HUD />
      
      {showGrandMastery && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000 p-4">
          <div className="vhs-overlay opacity-20" />
          <div className="relative w-full max-w-sm md:max-w-xl aspect-[2/3] animate-in zoom-in-50 duration-1000 slide-in-from-bottom-20 flex flex-col items-center">
             <div className="absolute inset-0 bg-yellow-500/10 blur-[60px] md:blur-[120px] rounded-full animate-pulse-red" />
             <div className="relative w-full h-full border-[8px] md:border-[12px] border-yellow-500 shadow-[0_0_80px_rgba(234,179,8,0.4)] overflow-hidden group">
                <Image 
                  src="https://picsum.photos/seed/crypto-things-win/600/900" 
                  alt="Winning Card" 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  data-ai-hint="winning card monster"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
             </div>
             
             <div className="absolute -top-12 md:-top-16 text-center space-y-2 w-full">
                <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase animate-in slide-in-from-top-12 duration-1000 delay-500 fill-mode-both">
                  <GlitchText text="LEVEL COMPLETE" />
                </h2>
                <h3 className="text-4xl md:text-6xl font-black text-secondary tracking-tighter italic text-flicker delay-1000">
                  CRYPTO THINGS
                </h3>
             </div>

             <div className="mt-8 md:mt-12 relative z-10 animate-in fade-in duration-1000 delay-[1500ms] fill-mode-both">
                <Button 
                  onClick={() => router.push('/profile')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 md:px-12 h-12 md:h-16 text-lg md:text-xl font-black uppercase tracking-widest rounded-none skew-x-[-10deg] shadow-[0_0_30px_rgba(234,179,8,0.5)]"
                >
                  CLAIM MASTERY
                </Button>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative z-10 pb-12">
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  audioEngine.announce("Returning to sector hub.");
                  setTimeout(() => router.push('/map'), 400);
                }}
                className="text-white/40 hover:text-secondary h-10 w-10 md:h-12 md:w-12 border border-white/5 bg-white/5 rounded-none group pointer-events-auto"
              >
                <ChevronLeft className="w-5 md:w-6 h-5 md:h-6 transition-transform group-hover:-translate-x-1" />
              </Button>
              <div>
                <span className="text-[8px] md:text-[10px] text-secondary uppercase font-black tracking-[0.2em] md:tracking-[0.4em] glow-red">Signal Intercepted</span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white">
                  <GlitchText text={currentLevelDef?.name || "Initializing..."} />
                </h1>
              </div>
            </div>
            {currentLevelDef && (
              <div className="text-left sm:text-right w-full sm:w-auto">
                <span className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Question {solvedCount + 1} of {currentLevelDef.requiredProblems}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={(solvedCount / (currentLevelDef?.requiredProblems || 5)) * 100} className="w-full sm:w-40 h-1.5 md:h-2 bg-white/5 border border-white/10" />
                  <span className="text-[10px] md:text-xs font-mono text-secondary font-bold">{Math.round((solvedCount / currentLevelDef.requiredProblems) * 100)}%</span>
                </div>
              </div>
            )}
          </div>
          <Card className={cn(
            "bg-black/60 border-red-500/20 backdrop-blur-md relative overflow-hidden min-h-[400px] md:min-h-[500px] flex flex-col justify-center border-glow-red transition-all duration-1000",
            levelComplete && "border-secondary/60 shadow-[0_0_100px_rgba(230,51,51,0.2)]"
          )}>
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 md:p-20 space-y-4">
                <Timer className="w-10 h-10 md:w-12 md:h-12 text-secondary animate-spin" />
                <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-secondary font-bold animate-pulse">Intercepting Ethereal Stream...</p>
              </div>
            ) : levelComplete ? (
              <div className="flex flex-col items-center justify-center p-8 md:p-12 space-y-6 md:space-y-10 rift-open overflow-hidden relative min-h-[500px] md:min-h-[600px] camera-shake">
                <div className="vhs-overlay" />
                <div className="text-center space-y-6 md:space-y-12 relative z-10">
                  <div className="relative inline-flex items-center justify-center w-48 h-48 md:w-64 md:h-64">
                    <div className="energy-wave" style={{ color: currentLevelDef?.color, animationDelay: '0s' }} />
                    <div className="energy-wave" style={{ color: currentLevelDef?.color, animationDelay: '1s' }} />
                    <div className="energy-wave" style={{ color: currentLevelDef?.color, animationDelay: '2s' }} />
                    <div className="badge-reveal inline-flex items-center justify-center w-32 h-32 md:w-48 md:h-48 bg-black/80 border-4 rounded-full shadow-2xl relative z-10"
                      style={{ borderColor: currentLevelDef?.color || 'currentColor', boxShadow: `0 0 80px ${currentLevelDef?.color || '#e63333'}88` }}>
                      <BadgeIcon className="w-16 h-16 md:w-24 md:h-24" style={{ color: currentLevelDef?.color }} />
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-4">
                    <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter italic text-flicker glow-red leading-tight">
                      PROTOCOL <br className="sm:hidden" /> <span style={{ color: currentLevelDef?.color }}>CLEARED</span>
                    </h2>
                    <p className="text-sm md:text-xl text-white/90 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] italic">RANK EARNED: {currentLevelDef?.badgeName}</p>
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                      <span className="text-yellow-500 flex items-center gap-1.5 md:gap-2"><Trophy className="w-3 md:w-4 h-3 md:h-4" /> +{currentLevelDef?.reward} UNITS</span>
                      <span className="text-secondary flex items-center gap-1.5 md:gap-2"><Sparkles className="w-3 md:w-4 h-3 md:h-4" /> +{currentLevelDef?.expReward} EXP</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    audioEngine.announce("Deeper into the rift. Establishing new coordinates.");
                    setTimeout(() => router.push('/map'), 400);
                  }} 
                  className="bg-secondary hover:bg-secondary/80 w-full sm:w-auto px-10 md:px-16 h-16 md:h-20 text-lg md:text-2xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-none skew-x-[-8deg] md:skew-x-[-12deg] z-10 shadow-[0_0_30px_rgba(230,51,51,0.4)] transition-all hover:scale-105 active:scale-95 pointer-events-auto"
                >
                  DEEPER INTO THE RIFT <ChevronRight className="ml-2 md:ml-3 w-6 md:w-8 h-6 md:h-8" />
                </Button>
              </div>
            ) : problem ? (
              <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
                <p className="text-sm md:text-base text-white/80 italic leading-relaxed text-center font-medium px-2 md:px-4">"{problem.problemDescription}"</p>
                <div className="p-8 md:p-12 bg-black/80 border border-red-500/20 rounded-none relative group shadow-2xl skew-x-[-1deg] md:skew-x-[-2deg]">
                  <div className="font-mono text-xl md:text-3xl text-white break-words whitespace-pre-wrap leading-relaxed text-center tracking-[0.1em] md:tracking-[0.2em] glow-red">
                    {success ? <span className="text-green-500 animate-pulse">{problem.originalMessage}</span> : problem.encryptedMessage}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-2xl mx-auto w-full">
                  <Input 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Input Decryption Key..."
                    className="bg-white/5 border-white/10 h-14 md:h-16 px-4 md:px-8 text-lg md:text-xl font-mono focus:border-secondary rounded-none skew-x-[-3deg] md:skew-x-[-5deg]"
                    disabled={success || checking}
                  />
                  <Button onClick={handleSubmit} disabled={success || checking || !userInput} className="h-14 md:h-16 px-6 md:px-10 bg-secondary hover:bg-secondary/80 font-black uppercase tracking-widest rounded-none skew-x-[-3deg] md:skew-x-[-5deg] w-full sm:w-auto">
                    {checking ? <Loader2 className="animate-spin" /> : <><Send className="mr-2 w-4 md:w-5 h-4 md:h-5" /> Transmit</>}
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 md:pt-6 border-t border-white/5">
                  <Button variant="ghost" onClick={fetchHint} disabled={loading || !!hint} className="text-muted-foreground hover:text-secondary text-[8px] md:text-[10px] uppercase font-black w-full sm:w-auto">
                    <HelpCircle className="w-3 md:w-4 h-3 md:h-4 mr-1.5 md:mr-2" /> Request Insight
                  </Button>
                  <div className="text-[8px] md:text-[10px] text-secondary uppercase font-black tracking-widest bg-secondary/5 px-2 md:px-3 py-1 border border-secondary/20">
                    ENCODING: {problem.algorithmUsed}
                  </div>
                </div>
                {hint && (
                  <div className="p-4 md:p-6 bg-secondary/5 border border-secondary/20 rounded-none border-l-4 border-l-secondary animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-3 md:space-y-4">
                      <div><p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black">Algorithm Breakdown</p><p className="text-xs md:text-sm text-white/90">{hint.explanation}</p></div>
                      <div><p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black">Strategic Approach</p><p className="text-xs md:text-sm text-white/90 italic">"{hint.stepByStepSolution}"</p></div>
                    </div>
                  </div>
                )}
              </CardContent>
            ) : null}
          </Card>
        </div>
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <DecoderPanel />
          <div className="p-4 md:p-6 bg-black/60 border border-red-500/20 rounded-none space-y-3 md:space-y-4 shadow-xl">
            <h3 className="text-[9px] md:text-[11px] uppercase text-secondary font-black tracking-[0.2em] md:tracking-[0.3em]">Rift Intel</h3>
            <p className="text-[10px] md:text-xs text-white/70 leading-relaxed font-medium">{currentLevelDef?.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
