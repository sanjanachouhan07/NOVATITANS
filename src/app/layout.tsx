'use client';

import { useEffect } from 'react';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { audioEngine } from '@/lib/audio-utils';

/**
 * Root Layout
 * - Provides the base tactical interface (Fog, Scanlines).
 * - Implements the Global Audio Unlocker to handle browser autoplay policies.
 * - Attaches global interaction sound listeners for all buttons using capture phase.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    // We use capture phase (true) to ensure listeners fire even if stopPropagation is called
    const handleGlobalInteraction = (e: MouseEvent) => {
      // 1. Authorize AudioContext
      audioEngine.unlock();

      // 2. Play Interaction Sound if target is a button
      const target = (e.target as HTMLElement).closest('button, [role="button"]');
      if (target) {
        // Special "Glitch" sound for primary start-style buttons
        if (target.textContent?.toLowerCase().includes('rift') || target.textContent?.toLowerCase().includes('mission')) {
          audioEngine.playGlitch();
        } else {
          audioEngine.playUI();
        }
      }
    };

    const handleGlobalHover = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('button, [role="button"]');
      if (target) {
        audioEngine.playHover();
      }
    };

    // Attach global listeners with capture phase for absolute reliability
    window.addEventListener('mousedown', handleGlobalInteraction, true);
    window.addEventListener('mouseover', handleGlobalHover, true);
    
    // Universal unlock on any key or touch
    window.addEventListener('keydown', () => audioEngine.unlock(), true);
    window.addEventListener('touchstart', () => audioEngine.unlock(), true);

    return () => {
      window.removeEventListener('mousedown', handleGlobalInteraction, true);
      window.removeEventListener('mouseover', handleGlobalHover, true);
      window.removeEventListener('keydown', () => audioEngine.unlock(), true);
      window.removeEventListener('touchstart', () => audioEngine.unlock(), true);
    };
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <title>Crypto Things - Decode the Mystery</title>
      </head>
      <body className="font-body antialiased selection:bg-secondary selection:text-white bg-background">
        <FirebaseClientProvider>
          <div className="fog-overlay" />
          <div className="scanline" />
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
