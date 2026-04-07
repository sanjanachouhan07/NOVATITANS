'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Terminal, RefreshCcw, Hash, KeyRound, Info } from "lucide-react";
import { AlgorithmType } from "@/lib/game-data";
import { audioEngine } from "@/lib/audio-utils";

export function DecoderPanel() {
  const [inputText, setInputText] = useState("");
  const [algorithm, setAlgorithm] = useState<AlgorithmType | "">("");
  const [shiftValue, setShiftValue] = useState<string>("0");
  const [result, setResult] = useState("");

  const handleTest = () => {
    audioEngine.announce("Cipher analysis in progress");
    if (!inputText || !algorithm) return;

    let output = "PROCESSING SIGNAL...";
    const shift = parseInt(shiftValue) || 0;
    
    try {
      if (algorithm === 'binary') {
        output = inputText.split(' ').map(bin => {
          if (!bin.trim()) return "";
          return String.fromCharCode(parseInt(bin, 2));
        }).join('');
      } else if (algorithm === 'base64') {
        output = atob(inputText);
      } else if (algorithm === 'caesar' || algorithm === 'rot') {
        const effectiveShift = algorithm === 'rot' ? 13 : shift;
        output = inputText.toUpperCase().split('').map(char => {
          const code = char.charCodeAt(0);
          if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 - (effectiveShift % 26) + 26) % 26) + 65);
          }
          return char;
        }).join('');
      } else if (algorithm === 'morse') {
         const morseToChar: Record<string, string> = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
            '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
            '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z',
            '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5',
            '-....': '6', '--...': '7', '---..': '8', '----.': '9',
            '/': ' ',
          };
          output = inputText.toUpperCase().split(' ').map(symbol => morseToChar[symbol] || symbol).join('');
      } else if (algorithm === 'decimal') {
        output = inputText.split(' ').map(val => {
          if (!val.trim()) return "";
          return String.fromCharCode(parseInt(val, 10));
        }).join('');
      }
    } catch (e) {
      output = "ERROR: CORRUPT DATA";
    }

    setResult(output);
  };

  return (
    <Card className="bg-black/60 border-white/5 backdrop-blur-sm overflow-hidden border-glow-red">
      <CardHeader className="bg-white/5 border-b border-white/5 py-3">
        <CardTitle className="text-sm uppercase tracking-tighter flex items-center gap-2">
          <Terminal className="w-4 h-4 text-secondary" />
          Decoder Tool Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase text-muted-foreground font-bold">Input Encrypted Data</label>
          <Input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Input raw signal..." 
            className="bg-white/5 border-white/10 text-xs font-mono h-10 rounded-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-muted-foreground font-bold">Protocol</label>
            <Select onValueChange={(v) => { setAlgorithm(v as AlgorithmType); }}>
              <SelectTrigger className="bg-white/5 border-white/10 text-xs h-8 rounded-none">
                <SelectValue placeholder="Algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binary">Binary</SelectItem>
                <SelectItem value="caesar">Caesar Cipher</SelectItem>
                <SelectItem value="base64">Base64</SelectItem>
                <SelectItem value="morse">Morse Code</SelectItem>
                <SelectItem value="decimal">Decimal</SelectItem>
                <SelectItem value="rot">ROT Cipher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {algorithm === 'caesar' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
              <label className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                <Hash className="w-2 h-2" /> Shift
              </label>
              <Input 
                type="number"
                value={shiftValue}
                onChange={(e) => setShiftValue(e.target.value)}
                className="bg-white/5 border-white/10 text-xs h-8 rounded-none"
              />
            </div>
          )}

          <div className={(algorithm === 'caesar') ? 'col-span-2' : 'flex items-end'}>
            <Button onClick={handleTest} className="w-full h-8 bg-secondary hover:bg-secondary/80 text-xs uppercase font-bold rounded-none">
              Test Decode
            </Button>
          </div>
        </div>

        {result && (
          <div className="mt-4 p-3 bg-secondary/10 border border-secondary/20 rounded-none font-mono text-xs text-secondary animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase font-bold opacity-70">Output:</span>
              <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => { setResult(""); }}>
                <RefreshCcw className="h-3 w-3" />
              </Button>
            </div>
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
