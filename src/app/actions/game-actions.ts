
'use server';

import { generateCryptographicProblem, DynamicProblemGenerationInput } from '@/ai/flows/dynamic-problem-generation-flow';
import { contextualHintSystem, ContextualHintSystemInput } from '@/ai/flows/contextual-hint-system-flow';
import { generateVoice } from '@/ai/flows/tts-flow';

export async function getNewProblem(input: DynamicProblemGenerationInput) {
  try {
    return await generateCryptographicProblem(input);
  } catch (error) {
    throw new Error('Failed to generate puzzle. The signal is weak.');
  }
}

export async function getHint(input: ContextualHintSystemInput) {
  try {
    return await contextualHintSystem(input);
  } catch (error) {
    throw new Error('Could not retrieve hint. The interference is too strong.');
  }
}

export async function getVoiceLine(text: string) {
  try {
    const result = await generateVoice(text);
    return result.media;
  } catch (error) {
    return null;
  }
}
