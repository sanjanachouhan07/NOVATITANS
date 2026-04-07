'use server';

/**
 * @fileOverview A Genkit flow for dynamically generating unique cryptographic problems.
 * 
 * This flow combines LLM creativity with robust TypeScript logic for cryptographic encryption.
 * It uses question numbers and seeds to ensure variety and prevent repetition.
 *
 * - generateCryptographicProblem - A function that generates a unique cryptographic problem.
 * - DynamicProblemGenerationInput - The input type for the generateCryptographicProblem function.
 * - DynamicProblemGenerationOutput - The return type for the generateCryptographicProblem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Cryptographic Helper Functions (TypeScript Logic) ---

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Binary Encryption: Converts each character to 8-bit binary.
 */
function encryptBinary(text: string): string {
  return text.split('').map(char => {
    const bin = char.charCodeAt(0).toString(2);
    return '0'.repeat(8 - bin.length) + bin;
  }).join(' ');
}

/**
 * Caesar Cipher: Shifts letters by a fixed value.
 */
function encryptCaesar(text: string, shift: number): string {
  return text.split('').map(char => {
    const upper = char.toUpperCase();
    if (upper >= 'A' && upper <= 'Z') {
      return String.fromCharCode(((upper.charCodeAt(0) - 65 + shift) % 26) + 65);
    }
    return char;
  }).join('');
}

/**
 * Base64: Standard encoding.
 */
function encryptBase64(text: string): string {
  return Buffer.from(text).toString('base64');
}

/**
 * Morse Code: Universal signal system.
 */
function encryptMorse(text: string): string {
  const morseCodeMap: { [key: string]: string } = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    ' ': '/',
  };
  return text.toUpperCase().split('').map(char => morseCodeMap[char] || '').join(' ').trim();
}

/**
 * Decimal Encryption: Converts each character to its ASCII value.
 */
function encryptDecimal(text: string): string {
  return text.split('').map(char => char.charCodeAt(0).toString()).join(' ');
}

/**
 * ROT (Rotate) Cipher: Special case of Caesar (e.g., ROT13).
 */
function encryptRot(text: string, rotValue: number): string {
  return encryptCaesar(text, rotValue);
}

// --- Schemas ---

const DynamicProblemGenerationInputSchema = z.object({
  algorithmType: z.enum([
    'binary',
    'caesar',
    'base64',
    'morse',
    'decimal',
    'rot',
    'mixed',
  ]).describe('The type of cryptographic algorithm to use.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('easy').describe('Affects the length and complexity of the phrase.'),
  seed: z.number().optional().describe('A random number used to ensure variety in responses.'),
  questionNumber: z.number().optional().describe('The current question number in the sequence (1-5).'),
});
export type DynamicProblemGenerationInput = z.infer<typeof DynamicProblemGenerationInputSchema>;

const DynamicProblemGenerationOutputSchema = z.object({
  encryptedMessage: z.string().describe('The final encrypted message.'),
  originalMessage: z.string().describe('The original plaintext message.'),
  algorithmUsed: z.string().describe('The specific algorithm applied.'),
  algorithmDetails: z.record(z.string(), z.any()).optional().describe('Meta data like shift values or keys.'),
  problemDescription: z.string().describe('The thematic, narrative context for the puzzle.')
});
export type DynamicProblemGenerationOutput = z.infer<typeof DynamicProblemGenerationOutputSchema>;

// --- Genkit Logic ---

const contentGenerationPrompt = ai.definePrompt({
  name: 'generatePuzzleContentPrompt',
  input: { schema: DynamicProblemGenerationInputSchema },
  output: {
    schema: z.object({
      phrase: z.string().describe('A single word or very short spooky phrase (2-4 words maximum). For hard difficulty, can be 1-2 cryptic sentences.'),
      description: z.string().describe('A short, atmospheric sentence describing why this signal is being intercepted.'),
    }),
  },
  prompt: `You are an ancient, otherworldly entity creating cryptic puzzles for the "Crypto Things" game (Stranger Things theme).

Your primary mission is to generate UNIQUE, VARYING, and ATMOSPHERIC phrases and descriptions. 

CRITICAL: Use the provided Seed value and Question Number to vary your vocabulary. Do NOT repeat previous outputs. 

### Context:
- **Theme**: Supernatural, 1980s, Hawkins, The Rift, Upside Down, MKUltra, Demogorgon, Mind Flayer, Telekinesis, Radio Interference.
- **Difficulty**: {{{difficulty}}}
- **Seed**: {{{seed}}}
- **Question Sequence**: This is question {{{questionNumber}}} of 5 in this level.

### Length Guidelines:
- **Easy**: A single thematic word (e.g., "SHADOW", "RUN", "VOID", "GATE", "BLOOD", "MIND").
- **Medium**: A short phrase (2-4 words, e.g., "THE LIGHTS FLICKER", "HE IS COMING", "STAY IN LIGHT", "THE DOOR OPENS").
- **Hard**: A multi-line or longer cryptic transmission (1-2 sentences, e.g., "THE DOOR IS OPEN IN THE LAB. WE CANNOT CLOSE IT. THE SHADOW IS GROWING.").

The output must be JSON matching the schema.`,
});

const dynamicProblemGenerationFlow = ai.defineFlow(
  {
    name: 'dynamicProblemGenerationFlow',
    inputSchema: DynamicProblemGenerationInputSchema,
    outputSchema: DynamicProblemGenerationOutputSchema,
  },
  async (input) => {
    let aiContent;
    
    // Expanded Fallback System for maximum variety
    const fallbackPhrases = [
      { phrase: "SHADOW", description: "A flicker in the darkness. A word forms from the static." },
      { phrase: "THE RIFT IS OPEN", description: "A cold wind blows through the laboratory halls." },
      { phrase: "STAY IN THE LIGHT", description: "The bulbs are humming with an impossible energy." },
      { phrase: "ELEVEN IS NEAR", description: "A nosebleed begins as the radio crackles." },
      { phrase: "WATCH THE CLOCK", description: "Time seems to bend in the presence of the entity." },
      { phrase: "THE UPSIDE DOWN", description: "Ash-like spores float through the air as the signal peaks." },
      { phrase: "THE GATE", description: "A pulsating opening in the metal wall of the facility." },
      { phrase: "HE IS WATCHING", description: "A presence felt but never seen, lurking behind the static." },
      { phrase: "BREATHE", description: "A whispered command coming through a dead telephone line." },
      { phrase: "RUN WHILE YOU CAN", description: "Scratched into the side of the terminal in frantic haste." },
      { phrase: "HAVE YOU SEEN HIM", description: "A missing person's notice appearing on the digital screen." },
      { phrase: "THE VOID IS HUNGRY", description: "Deep rumbling sounds accompanying the transmission." },
      { phrase: "FRIENDS DONT LIE", description: "A faint child's voice breaks through the radio waves." },
      { phrase: "WILL IS HERE", description: "The lights flash rhythmically on the wall." },
      { phrase: "CLOSE THE GATE", description: "A desperate command from the laboratory control room." },
      { phrase: "THE MIND FLAYER", description: "A massive shadow looms over the horizon in the red sky." },
      { phrase: "BART BARB BARB", description: "A name repeated endlessly in the void." },
      { phrase: "DART IS GROWING", description: "A rustling sound coming from a locked cabinet." },
      { phrase: "MORNIN IS FOR COFFEE", description: "Static resolves into a familiar gruff voice." },
      { phrase: "THE SPIDER IS HERE", description: "Web-like patterns forming on the monitor glass." },
    ];

    try {
      // 1. Attempt to generate thematic content via LLM
      const { output } = await contentGenerationPrompt(input);
      aiContent = output;
      if (!aiContent || !aiContent.phrase) throw new Error("Incomplete AI response");
    } catch (e) {
      // 1b. Pick a unique fallback based on the question number or seed
      const fallbackIndex = ((input.questionNumber || 1) + Math.floor((input.seed || 0.5) * 100)) % fallbackPhrases.length;
      aiContent = fallbackPhrases[fallbackIndex];
    }

    const originalMessage = aiContent.phrase.toUpperCase().trim();
    let encryptedMessage = '';
    let algorithmUsed = input.algorithmType;
    let algorithmDetails: Record<string, any> = {};

    // 2. Perform the encryption in TypeScript for 100% reliability
    if (algorithmUsed === 'mixed') {
      const options: ('binary' | 'caesar' | 'base64' | 'morse' | 'decimal' | 'rot')[] = 
        ['binary', 'caesar', 'base64', 'morse', 'decimal', 'rot'];
      algorithmUsed = options[Math.floor(Math.random() * options.length)];
    }

    switch (algorithmUsed) {
      case 'binary':
        encryptedMessage = encryptBinary(originalMessage);
        break;
      case 'caesar':
        const shift = Math.floor(Math.random() * 10) + 1;
        encryptedMessage = encryptCaesar(originalMessage, shift);
        algorithmDetails = { shift };
        break;
      case 'base64':
        encryptedMessage = encryptBase64(originalMessage);
        break;
      case 'morse':
        encryptedMessage = encryptMorse(originalMessage);
        break;
      case 'decimal':
        encryptedMessage = encryptDecimal(originalMessage);
        break;
      case 'rot':
        const rotVal = 13;
        encryptedMessage = encryptRot(originalMessage, rotVal);
        algorithmDetails = { rotValue: rotVal };
        break;
    }

    return {
      encryptedMessage,
      originalMessage,
      algorithmUsed,
      algorithmDetails,
      problemDescription: aiContent.description,
    };
  }
);

export async function generateCryptographicProblem(input: DynamicProblemGenerationInput): Promise<DynamicProblemGenerationOutput> {
  return dynamicProblemGenerationFlow(input);
}
