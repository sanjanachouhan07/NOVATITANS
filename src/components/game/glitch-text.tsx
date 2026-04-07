'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function GlitchText({ 
  text, 
  className, 
  glow = false 
}: { 
  text: string; 
  className?: string; 
  glow?: boolean;
}) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={cn(
      "relative inline-block transition-all",
      glow && "glow-red text-secondary",
      isGlitching && "glitch",
      className
    )}>
      {text}
    </span>
  );
}
