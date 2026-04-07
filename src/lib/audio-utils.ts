'use client';

/**
 * Hawkins Tactical Audio Engine (Professional Grade)
 * Synthesizes visceral organic monster sound effects and AI briefings.
 * Boosted gain levels for high-impact feedback.
 * Uses Web Speech API for zero-latency UI voice lines.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private hasUnlocked = false;
  private announcementQueue: string[] = [];

  private getCtx = () => {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    return this.ctx;
  };

  /**
   * Unlock Audio context on analyst interaction.
   */
  unlock = async () => {
    const ctx = this.getCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    if (!this.hasUnlocked && ctx.state === 'running') {
      this.hasUnlocked = true;
      // Flush tactical announcement queue if any
      while (this.announcementQueue.length > 0) {
        const text = this.announcementQueue.shift();
        if (text) this.announce(text);
      }
    }
  };

  /**
   * AI Voice Announcement Protocol (Web Speech API)
   * High-reliability, zero-latency local synthesis.
   */
  announce = (text: string) => {
    if (typeof window === 'undefined') return;

    // Tactical Interrupt: Cancel any ongoing briefing
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Laboratory AI Tone Settings
    utterance.rate = 0.9;  // Authoritative pace
    utterance.pitch = 0.8; // Lower, tactical frequency
    utterance.volume = 1.0;

    // Some browsers require a user gesture to start speech
    window.speechSynthesis.speak(utterance);
  };

  /**
   * Tactical Interaction: Organic Monster Thud
   * Visceral, heavy feedback for 1984 laboratory hardware.
   */
  playUI = () => {
    this.unlock();
    const ctx = this.getCtx();
    if (!ctx || ctx.state !== 'running') return;

    // Deep Sub-Harmonic Boom
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.01); 
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.Q.setValueAtTime(5, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);

    // Wet Noise "Squelch"
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(400, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, ctx.currentTime); 
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
  };

  playHover = () => {
    const ctx = this.getCtx();
    if (!ctx || ctx.state !== 'running') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05); 
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  playGlitch = () => {
    this.unlock();
    const ctx = this.getCtx();
    if (!ctx || ctx.state !== 'running') return;

    for (let i = 0; i < 4; i++) {
      const time = ctx.currentTime + (i * 0.05);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(Math.random() * 150 + 50, time);
      
      gain.gain.setValueAtTime(0.6, time); 
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.05);
    }
  };

  playVerify = () => {
    this.unlock();
    const ctx = this.getCtx();
    if (!ctx || ctx.state !== 'running') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.8, ctx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  };

  playError = () => {
    this.unlock();
    const ctx = this.getCtx();
    if (!ctx || ctx.state !== 'running') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.7, ctx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  playAmbientHum = () => {
    this.unlock();
    const ctx = this.getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 5); 
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    
    return {
      stop: () => {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
        setTimeout(() => { try { osc.stop(); } catch(e) {} }, 2000);
      }
    };
  };
}

export const audioEngine = new AudioEngine();
