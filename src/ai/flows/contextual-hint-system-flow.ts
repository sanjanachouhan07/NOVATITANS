'use server';
/**
 * @fileOverview Provides context-aware hints for cryptographic problems.
 *
 * - contextualHintSystem - A function that generates hints for cryptographic problems.
 * - ContextualHintSystemInput - The input type for the contextualHintSystem function.
 * - ContextualHintSystemOutput - The return type for the contextualHintSystem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContextualHintSystemInputSchema = z.object({
  algorithm: z
    .enum([
      'Binary',
      'Caesar Cipher',
      'Base64',
      'Morse Code',
      'Decimal',
      'ROT Cipher',
    ])
    .describe('The type of cryptographic algorithm.'),
  encryptedMessage: z.string().describe('The encrypted message for which the hint is requested.'),
  problemContext: z
    .string()
    .optional()
    .describe('Optional: Any specific context or details about the problem.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .optional()
    .describe('Optional: The difficulty level of the problem.'),
});
export type ContextualHintSystemInput = z.infer<typeof ContextualHintSystemInputSchema>;

const ContextualHintSystemOutputSchema = z.object({
  explanation: z.string().describe('A brief explanation of the cryptographic algorithm.'),
  stepByStepSolution: z
    .string()
    .describe('Step-by-step guidance on how to approach and solve the problem.'),
  toolSuggestion: z
    .string()
    .describe('A suggestion for a decoding tool or method to use.'),
  hintLevel: z
    .enum(['general', 'moderate', 'detailed'])
    .describe('Indicates the level of detail provided in the hint.'),
});
export type ContextualHintSystemOutput = z.infer<typeof ContextualHintSystemOutputSchema>;

export async function contextualHintSystem(
  input: ContextualHintSystemInput
): Promise<ContextualHintSystemOutput> {
  return contextualHintSystemFlow(input);
}

const contextualHintPrompt = ai.definePrompt({
  name: 'contextualHintPrompt',
  input: { schema: ContextualHintSystemInputSchema },
  output: { schema: ContextualHintSystemOutputSchema },
  prompt: `You are an expert cryptography tutor. Your goal is to provide helpful, context-aware hints for cryptographic problems without directly giving away the answer. Respond with an explanation, step-by-step solution, and tool suggestion.

### Instructions:
1.  **Explanation**: Briefly explain the given cryptographic algorithm.
2.  **Step-by-Step Solution**: Provide guidance on how to approach the problem step-by-step.
3.  **Tool Suggestion**: Suggest a type of tool or method that would be useful for decoding this specific algorithm.
4.  **Hint Level**: For this initial request, provide a 'moderate' level hint.

### Problem Details:
-   **Algorithm**: {{{algorithm}}}
-   **Encrypted Message**: {{{encryptedMessage}}}
{{#if problemContext}}-   **Context**: {{{problemContext}}}{{/if}}
{{#if difficulty}}-   **Difficulty**: {{{difficulty}}}{{/if}}

Provide the response in a JSON format matching the output schema.`,
});

const contextualHintSystemFlow = ai.defineFlow(
  {
    name: 'contextualHintSystemFlow',
    inputSchema: ContextualHintSystemInputSchema,
    outputSchema: ContextualHintSystemOutputSchema,
  },
  async (input) => {
    const { output } = await contextualHintPrompt(input);
    if (!output) {
      throw new Error('Failed to generate contextual hint.');
    }
    return output;
  }
);
