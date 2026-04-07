'use client';

import { LevelDef } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Radio, Lock, Search, Ghost, Compass, Zap, Flame, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

interface MapNodeProps {
  level: LevelDef;
  coords: { x: number; y: number };
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  onInteraction: () => void;
}

export function MapNode({ level, coords, isUnlocked, isCompleted, isCurrent, onInteraction }: MapNodeProps) {
  const Icon = IconMap[level.iconName];

  return (
    <div 
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
    >
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onMouseDown={(e) => e.stopPropagation()} // Stop propagation to prevent map drag
              onClick={(e) => {
                e.stopPropagation();
                if (isUnlocked) {
                  onInteraction();
                } else {
                  audioEngine.playError();
                }
              }}
              disabled={!isUnlocked}
              className={cn(
                "group relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-500 pointer-events-auto",
                !isUnlocked && "bg-black/80 border-white/5 opacity-40 grayscale cursor-not-allowed",
                isUnlocked && !isCompleted && "bg-black/60 border-secondary/40 hover:scale-110 shadow-[0_0_20px_rgba(230,51,51,0.2)]",
                isCompleted && "bg-secondary/10 border-secondary node-pulse shadow-[0_0_30px_rgba(230,51,51,0.6)]",
                isCurrent && "border-white scale-105"
              )}
            >
              {/* INNER GLOW */}
              <div className={cn(
                "absolute inset-0 rounded-full blur-md transition-opacity duration-1000",
                isUnlocked ? "opacity-40" : "opacity-0",
                isCompleted ? "bg-secondary opacity-20" : "bg-white opacity-10"
              )} />

              {/* ICON */}
              <Icon 
                className={cn(
                  "w-8 h-8 transition-all duration-500",
                  !isUnlocked && "text-white/20",
                  isUnlocked && !isCompleted && "text-white group-hover:text-secondary",
                  isCompleted && "text-secondary"
                )} 
              />

              {/* STATUS INDICATORS */}
              {isCompleted && (
                <div className="absolute -top-1 -right-1 bg-secondary rounded-full p-1 border border-black shadow-lg">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}

              {isCurrent && !isCompleted && (
                <div className="absolute -inset-2 border border-white/20 rounded-full animate-ping pointer-events-none" />
              )}
              
              {/* LABEL */}
              <div className={cn(
                "absolute top-full mt-4 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.3em] transition-all duration-500",
                isUnlocked ? "text-white opacity-80" : "text-white/20 opacity-40",
                isCurrent && "text-secondary scale-110"
              )}>
                MISSION {level.id}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-black border-secondary/50 p-3 rounded-none skew-x-[-5deg]"
          >
            <div className="space-y-1">
              <p className="text-[10px] text-secondary uppercase font-black tracking-widest">{level.name}</p>
              <p className="text-[8px] text-muted-foreground uppercase font-bold">Protocol: {level.algorithm}</p>
              {!isUnlocked && <p className="text-[7px] text-red-500 font-black uppercase mt-1 animate-pulse">ACCESS DENIED</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
