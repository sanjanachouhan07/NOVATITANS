'use client';

import { cn } from "@/lib/utils";

interface MapRootProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isActive: boolean;
  isCompleted: boolean;
}

export function MapRoot({ startX, startY, endX, endY, isActive, isCompleted }: MapRootProps) {
  // Use deterministic seed for stable hydration
  const seed = (Math.abs(Math.floor(startX * 3 + startY * 7))) % 8;
  const offsetX = (seed - 4) * 0.5;
  const offsetY = (seed - 4) * 0.5;

  const midX = (startX + endX) / 2 + offsetX;
  const midY = (startY + endY) / 2 + offsetY;
  
  // Clean, precise energy filaments instead of thick veins
  const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

  return (
    <g className="transition-opacity duration-1000">
      {/* BASE FILAMENT (Dull, fixed line) */}
      <path
        d={path}
        fill="none"
        className={cn(
          "filament-base",
          isActive && "filament-active",
          isCompleted && "filament-completed"
        )}
        strokeLinecap="round"
      />
      
      {/* SIGNAL PULSE (A spark of data traveling through the line) */}
      {(isActive || isCompleted) && (
        <path
          d={path}
          fill="none"
          stroke="rgba(230,20,20,0.8)"
          strokeWidth={isCompleted ? 2.5 : 1.5}
          strokeLinecap="round"
          className="signal-pulse"
          style={{
            filter: 'blur(1px)',
            animationDelay: `${seed * 0.5}s`
          }}
        />
      )}

      {/* ADDITIONAL GLOW LAYER FOR COMPLETED PATHS */}
      {isCompleted && (
        <path
          d={path}
          fill="none"
          stroke="rgba(230,20,20,0.2)"
          strokeWidth="6"
          strokeLinecap="round"
          className="opacity-20 blur-md"
        />
      )}
    </g>
  );
}
