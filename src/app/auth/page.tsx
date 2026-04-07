'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HUD } from "@/components/game/hud";
import { GlitchText } from "@/components/game/glitch-text";
import { useUserProgress } from "@/lib/user-store";
import { Shield, Ghost, Loader2 } from "lucide-react";
import { audioEngine } from "@/lib/audio-utils";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { isTrained, loading: isProgressLoading } = useUserProgress();
  const router = useRouter();

  useEffect(() => {
    audioEngine.announce("Security clearance required for Rift entry.");
  }, []);

  useEffect(() => {
    if (user && !isProgressLoading && !isUserLoading) {
      if (isTrained) {
        router.push("/map");
      } else {
        router.push("/intro");
      }
    }
  }, [user, isProgressLoading, isUserLoading, isTrained, router]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    audioEngine.playUI();
    audioEngine.announce(isSignUp ? "Initiating personnel enrollment." : "Establishing secure laboratory link.");
    setError(null);
    const authPromise = isSignUp 
      ? initiateEmailSignUp(auth, email, password)
      : initiateEmailSignIn(auth, email, password);

    authPromise.catch((err: any) => {
      audioEngine.playError();
      audioEngine.announce("Authentication error. Access denied.");
      setError("AUTHENTICATION ERROR: ACCESS DENIED");
    });
  };

  const handleAnonymous = () => {
    audioEngine.playUI();
    audioEngine.announce("Entering as anonymous entity.");
    setError(null);
    initiateAnonymousSignIn(auth).catch(() => {
      audioEngine.playError();
      audioEngine.announce("Anonymous link failed.");
      setError("ANONYMOUS LINK FAILED");
    });
  };

  const toggleMode = () => {
    audioEngine.playUI();
    audioEngine.announce("Switching authentication protocol.");
    setIsSignUp(!isSignUp);
  };

  if (isUserLoading || (user && isProgressLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        <GlitchText text="ESTABLISHING LINK..." className="text-secondary font-black" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent p-4 pt-24 flex flex-col items-center">
      <HUD />
      <Card className="w-full max-w-md bg-black/80 border-red-500/20 backdrop-blur-xl rounded-none skew-x-[-2deg]">
        <CardHeader className="text-center">
          <Shield className="w-8 h-8 text-secondary mx-auto mb-4" />
          <CardTitle className="text-3xl font-black uppercase italic tracking-tighter text-white">
            <GlitchText text={isSignUp ? "Join the Agency" : "Authorized Access"} />
          </CardTitle>
          <CardDescription className="text-muted-foreground uppercase text-[10px] font-bold">
            Hawkins National Laboratory - Priority A1
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Analyst Email" className="bg-white/5 border-white/10 rounded-none h-12" required />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Security Key" className="bg-white/5 border-white/10 rounded-none h-12" required />
            {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-[10px] text-red-500 font-black text-center">{error}</div>}
            <Button type="submit" className="w-full h-12 bg-secondary hover:bg-secondary/80 text-white font-black uppercase rounded-none">
              {isSignUp ? "Initiate Enrollment" : "Establish Link"}
            </Button>
          </form>
          <div className="relative flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/10" /><span className="text-[9px] text-muted-foreground uppercase font-bold">OR</span><div className="h-px flex-1 bg-white/10" />
          </div>
          <Button variant="outline" onClick={handleAnonymous} className="w-full h-12 border-white/10 hover:bg-white/5 text-white/70 font-black rounded-none">
            <Ghost className="w-4 h-4 mr-2" /> Enter as Anonymous Entity
          </Button>
          <p className="text-center text-[10px] text-muted-foreground uppercase font-bold">
            {isSignUp ? "Already a member?" : "New analyst?"}{" "}
            <button type="button" onClick={toggleMode} className="text-secondary hover:underline">{isSignUp ? "Login here" : "Register here"}</button>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
