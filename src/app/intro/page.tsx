'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HUD } from "@/components/game/hud";
import { GlitchText } from "@/components/game/glitch-text";
import { ALGORITHM_GUIDES, INTRO_STORY } from "@/lib/game-data";
import { BookOpen, Radio, CheckCircle2, ArrowRight, ShieldAlert, Binary, Search, HelpCircle, Fingerprint, Loader2, FastForward, AlertTriangle } from "lucide-react";
import { useUserProgress } from "@/lib/user-store";
import { audioEngine } from "@/lib/audio-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PRACTICE_QUESTIONS = [
  {
    id: 1,
    question: "01001000 01000101 01001100 01001100 01001111",
    options: ["Binary", "Caesar", "Base64", "Morse"],
    answer: "Binary",
    explanation: "This consists of 8-bit sequences of 0s and 1s. This is the raw language of the machines and the rift."
  },
  {
    id: 2,
    question: ".... . .-.. .-.. ---",
    options: ["ROT13", "Morse Code", "Binary", "Substitution"],
    answer: "Morse Code",
    explanation: "Dots and dashes are the universal sign of Morse code. Ancient but effective for inter-dimensional SOS signals."
  },
  {
    id: 3,
    question: "SGVsbG8gV29ybGQ=",
    options: ["Base64", "Caesar", "ROT13", "Morse"],
    answer: "Base64",
    explanation: "The ending '=' padding and the mix of alphanumeric characters is typical for Base64. It hides complexity in plain sight."
  }
];

const IDENTIFICATION_GUIDES = [
  {
    title: "The Binary Signature",
    description: "Look for only two characters: 0 and 1. Usually organized in blocks of 8 bits.",
    icon: <Binary className="w-6 h-6" />
  },
  {
    title: "The Base64 Pattern",
    description: "Look for a mix of uppercase, lowercase, and numbers. Often ends with one or two '=' characters.",
    icon: <Search className="w-6 h-6" />
  },
  {
    title: "The Morse Pulse",
    description: "Characterized by short pulses (dots) and long pulses (dashes). Separated by spaces or slashes.",
    icon: <Radio className="w-6 h-6" />
  },
  {
    title: "The Shifted Alphabet",
    description: "Caesar or ROT. It looks like words but the letters don't make sense. 'ABC' might become 'BCD'.",
    icon: <HelpCircle className="w-6 h-6" />
  }
];

export default function IntroPage() {
  const [step, setStep] = useState<'story' | 'guides' | 'identification' | 'practice' | 'complete'>('story');
  const [currentPractice, setCurrentPractice] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const { progress, completeLevel, loading, isLoggedIn, isTrained } = useUserProgress();
  const router = useRouter();

  useEffect(() => {
    audioEngine.announce("Orientation briefing initiated.");
  }, []);

  useEffect(() => {
    if (!loading && isTrained) {
      router.push('/map');
    }
  }, [loading, isTrained, progress.currentLevel, router]);

  const handleNextStep = () => {
    audioEngine.playUI();
    if (step === 'story') setStep('guides');
    else if (step === 'guides') setStep('identification');
    else if (step === 'identification') setStep('practice');
    else if (step === 'practice') {
      if (currentPractice < PRACTICE_QUESTIONS.length - 1) {
        setCurrentPractice(prev => prev + 1);
        setSelectedOption(null);
        setShowExplanation(false);
      } else {
        setStep('complete');
      }
    } else {
      audioEngine.playGlitch();
      completeLevel(0, 0, "Initiate", 50, 100);
      if (isLoggedIn) {
        router.push('/map');
      } else {
        router.push('/auth');
      }
    }
  };

  const handleSkipTraining = () => {
    audioEngine.playUI();
    completeLevel(0, 0, "Initiate", 0, 0);
    router.push(isLoggedIn ? '/map' : '/auth');
  };

  const handlePracticeAnswer = (option: string) => {
    if (showExplanation) return;
    setSelectedOption(option);
    setShowExplanation(true);
    if (option === PRACTICE_QUESTIONS[currentPractice].answer) {
      audioEngine.playVerify();
    } else {
      audioEngine.playError();
    }
  };

  const playUIClick = () => audioEngine.playUI();

  if (loading || isTrained) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        <p className="text-[10px] text-secondary uppercase font-black tracking-widest animate-pulse">Scanning Analyst Record...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-foreground p-4 pt-24 md:p-8 md:pt-28 flex flex-col items-center overflow-x-hidden">
      <HUD />
      <div className="max-w-4xl w-full space-y-8 md:space-y-12 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 text-secondary font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">
            <ShieldAlert className="w-4 md:w-5 h-4 md:h-5 animate-pulse" />
            <GlitchText text="ORIENTATION PROTOCOL: LEVEL 0" />
          </div>
          <div className="flex items-center gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button onClick={playUIClick} variant="ghost" className="text-[9px] md:text-[10px] text-white/40 hover:text-secondary uppercase font-black tracking-widest h-8 px-3 rounded-none border border-white/5 hover:border-secondary/40 bg-white/5">
                  <FastForward className="w-3 h-3 mr-2" /> Skip Orientation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black border-red-500/50 rounded-none skew-x-[-2deg] mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white font-black uppercase italic tracking-tighter flex items-center gap-2">
                    <AlertTriangle className="text-secondary w-5 h-5" />
                    Bypass Tactical Briefing?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest leading-relaxed">
                    You are attempting to enter the Rift without laboratory calibration. No orientation units or EXP will be awarded for this protocol. Proceed to active mission?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel onClick={playUIClick} className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest rounded-none">Maintain Training</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSkipTraining} className="bg-secondary hover:bg-secondary/80 text-white font-black uppercase tracking-widest rounded-none">Confirm Skip</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {step === 'story' && (
          <div className="space-y-8 md:space-y-10 animate-in fade-in duration-1000 max-w-2xl mx-auto text-center">
            <div className="text-3xl md:text-5xl font-black leading-tight italic uppercase tracking-tighter">
              "<GlitchText text={INTRO_STORY} />"
            </div>
            <div className="p-6 md:p-8 bg-black/60 border border-red-500/20 rounded-none skew-x-[-2deg] relative">
              <div className="absolute top-0 left-0 w-full h-full border-l-4 border-secondary opacity-50" />
              <p className="text-white/80 text-sm md:text-lg leading-relaxed font-medium">
                Hawkins, 1984. A rift has opened. The signals coming through are not just noise—they are secrets. As a new analyst for the Hawkins Special Projects, your mind is our best weapon.
              </p>
            </div>
            <div className="space-y-4">
              <Button onClick={handleNextStep} size="lg" className="bg-secondary hover:bg-secondary/80 w-full md:w-auto px-10 md:px-16 h-14 md:h-16 text-lg md:text-xl uppercase tracking-[0.2em] font-black border-glow-red rounded-none skew-x-[-10deg] md:skew-x-[-12deg]">
                <span className="skew-x-[10deg] md:skew-x-[12deg]">Initiate Training</span>
              </Button>
            </div>
          </div>
        )}

        {step === 'guides' && (
          <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <BookOpen className="text-secondary w-10 md:w-12 h-10 md:h-12" />
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">The Encryption Handbook</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(ALGORITHM_GUIDES).map(([key, value]) => (
                <Card key={key} className="bg-black/40 border-white/10 hover:border-secondary/50 transition-all rounded-none group">
                  <CardHeader className="py-3 md:py-4 border-b border-white/5">
                    <CardTitle className="text-[10px] md:text-xs uppercase text-secondary font-black tracking-[0.2em] md:tracking-[0.3em] group-hover:glow-red">{key}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 md:pt-4 text-[10px] md:text-xs text-white/70 leading-relaxed font-medium">
                    {value}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Button onClick={handleNextStep} size="lg" className="bg-secondary hover:bg-secondary/80 px-10 md:px-12 h-12 md:h-14 uppercase tracking-widest font-black rounded-none skew-x-[-8deg] md:skew-x-[-10deg] w-full sm:w-auto">
                <span className="skew-x-[8deg] md:skew-x-[10deg]">Learn Identification</span>
              </Button>
            </div>
          </div>
        )}

        {step === 'identification' && (
          <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-8">
            <div className="text-center space-y-4">
              <Fingerprint className="text-secondary w-10 md:w-12 h-10 md:h-12 mx-auto" />
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">Signal Identification</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {IDENTIFICATION_GUIDES.map((guide, i) => (
                <div key={i} className="p-4 md:p-6 bg-white/5 border border-white/10 flex gap-4 items-start rounded-none hover:bg-white/10 transition-colors">
                  <div className="p-2 md:p-3 bg-secondary/20 text-secondary border border-secondary/40 shrink-0">
                    {guide.icon}
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-white mb-1 md:mb-2">{guide.title}</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed font-medium">{guide.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <Button onClick={handleNextStep} size="lg" className="bg-secondary hover:bg-secondary/80 px-12 md:px-16 h-14 md:h-16 text-lg md:text-xl uppercase tracking-widest font-black rounded-none skew-x-[-10deg] md:skew-x-[-12deg] w-full sm:w-auto">
                <span className="skew-x-[10deg] md:skew-x-[12deg]">Begin Assessment</span>
              </Button>
            </div>
          </div>
        )}

        {step === 'practice' && (
          <div className="space-y-6 md:space-y-8 animate-in zoom-in-95">
            <div className="text-center space-y-4 md:space-y-6">
              <span className="text-[8px] md:text-[10px] text-secondary uppercase tracking-[0.3em] md:tracking-[0.4em] font-black">Inter-Dimensional Link Active</span>
              <div className="p-6 md:p-12 bg-black/80 border border-white/10 rounded-none font-mono text-xl md:text-3xl text-white break-all shadow-2xl relative skew-x-[-1deg] md:skew-x-[-2deg]">
                <GlitchText text={PRACTICE_QUESTIONS[currentPractice].question} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
              {PRACTICE_QUESTIONS[currentPractice].options.map((option) => (
                <Button 
                  key={option} 
                  variant={selectedOption === option ? (option === PRACTICE_QUESTIONS[currentPractice].answer ? "default" : "destructive") : "outline"}
                  className={`h-12 md:h-16 text-[10px] md:text-sm uppercase font-black tracking-widest border-white/10 rounded-none skew-x-[-3deg] md:skew-x-[-5deg] transition-all ${
                    showExplanation && option === PRACTICE_QUESTIONS[currentPractice].answer ? 'bg-green-600/20 text-green-500 border-green-500' : ''
                  }`}
                  onClick={() => handlePracticeAnswer(option)}
                  disabled={showExplanation}
                >
                  <span className="skew-x-[3deg] md:skew-x-[5deg]">{option}</span>
                </Button>
              ))}
            </div>
            {showExplanation && (
              <div className="p-6 md:p-8 bg-secondary/5 border-l-4 border-secondary rounded-none animate-in fade-in slide-in-from-top-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <CheckCircle2 className={`w-5 md:w-6 h-5 md:h-6 ${selectedOption === PRACTICE_QUESTIONS[currentPractice].answer ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[10px] md:text-sm italic">
                    {selectedOption === PRACTICE_QUESTIONS[currentPractice].answer ? 'Signal Authenticated' : 'Interference Detected'}
                  </span>
                </div>
                <p className="text-[10px] md:text-sm text-white/80 leading-relaxed font-medium italic">
                  "{PRACTICE_QUESTIONS[currentPractice].explanation}"
                </p>
                <Button onClick={handleNextStep} className="mt-6 md:mt-8 w-full h-10 md:h-12 bg-secondary hover:bg-secondary/80 font-black uppercase tracking-widest rounded-none">
                  Analyze Next Frequency
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-8 md:space-y-12 animate-in zoom-in-110 py-8 md:py-12">
            <div className="space-y-4 md:space-y-6">
              <div className="inline-block p-3 md:p-4 bg-secondary/10 border border-secondary/40 animate-bounce">
                <ShieldAlert className="w-12 md:w-16 h-12 md:h-16 text-secondary" />
              </div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white italic uppercase leading-none">
                PROTOCOL <span className="text-secondary">READY</span>
              </h2>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleNextStep} size="lg" className="bg-secondary hover:bg-secondary/90 w-full sm:w-auto px-12 md:px-20 h-16 md:h-20 text-xl md:text-2xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-none skew-x-[-12deg] md:skew-x-[-15deg] animate-pulse border-glow-red">
                <span className="skew-x-[12deg] md:skew-x-[15deg] flex items-center justify-center gap-3 md:gap-4">
                  Join The Agency <ArrowRight className="w-6 md:w-8 h-6 md:h-8" />
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
