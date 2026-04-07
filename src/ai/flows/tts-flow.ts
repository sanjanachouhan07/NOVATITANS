
'use server';

/**
 * @fileOverview A Text-to-Speech flow for the Hawkins Tactical Mainframe.
 *
 * - generateVoice - A function that converts text to a voice data URI.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import wav from 'wav';

const TTSInputSchema = z.string().describe('The text to convert to speech.');
const TTSOutputSchema = z.object({
  media: z.string().describe('The audio data as a base64 encoded data URI.'),
});

export type TTSInput = z.infer<typeof TTSInputSchema>;
export type TTSOutput = z.infer<typeof TTSOutputSchema>;

export async function generateVoice(input: TTSInput): Promise<TTSOutput> {
  return generateVoiceFlow(input);
}

const generateVoiceFlow = ai.defineFlow(
  {
    name: 'generateVoiceFlow',
    inputSchema: TTSInputSchema,
    outputSchema: TTSOutputSchema,
  },
  async (text) => {
    try {
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: text,
      });

      if (!media) {
        throw new Error('No media returned from TTS model');
      }

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      const wavBase64 = await toWav(audioBuffer);
      
      return {
        media: 'data:audio/wav;base64,' + wavBase64,
      };
    } catch (error: any) {
      // Log and fail gracefully to prevent server instability
      console.warn("TTS Quota Exceeded or Error:", error.message);
      throw error;
    }
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
