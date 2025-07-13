// src/ai/flows/syllabus-analyzer.ts
'use server';
/**
 * @fileOverview A syllabus analyzer AI agent.
 *
 * - analyzeSyllabus - A function that handles the syllabus analysis process.
 * - SyllabusAnalyzerInput - The input type for the analyzeSyllabus function.
 * - SyllabusAnalyzerOutput - The return type for the analyzeSyllabus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SyllabusAnalyzerInputSchema = z.object({
  syllabusText: z.string().optional().describe('The text content of the syllabus.'),
  syllabusFileDataUri: z
    .string()
    .optional()
    .describe(
      "A photo or PDF of a syllabus, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SyllabusAnalyzerInput = z.infer<typeof SyllabusAnalyzerInputSchema>;

const SyllabusAnalyzerOutputSchema = z.object({
  studyTasks: z.array(
    z.object({
      topic: z.string().describe('The topic of the study task.'),
      durationMinutes: z.number().describe('The recommended duration in minutes for the study task.'),
    })
  ).describe('A list of study tasks derived from the syllabus.'),
});
export type SyllabusAnalyzerOutput = z.infer<typeof SyllabusAnalyzerOutputSchema>;

export async function analyzeSyllabus(input: SyllabusAnalyzerInput): Promise<SyllabusAnalyzerOutput> {
  return analyzeSyllabusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'syllabusAnalyzerPrompt',
  input: {schema: SyllabusAnalyzerInputSchema},
  output: {schema: SyllabusAnalyzerOutputSchema},
  prompt: `You are an AI study assistant that helps students create a study plan. Your goal is to generate a list of study tasks with recommended durations based on the provided syllabus.

  Analyze the following syllabus content.
  {{#if syllabusText}}
  Syllabus Text: {{{syllabusText}}}
  {{/if}}
  {{#if syllabusFileDataUri}}
  Syllabus Document: {{media url=syllabusFileDataUri}}
  {{/if}}
  `,
});

const analyzeSyllabusFlow = ai.defineFlow(
  {
    name: 'analyzeSyllabusFlow',
    inputSchema: SyllabusAnalyzerInputSchema,
    outputSchema: SyllabusAnalyzerOutputSchema,
  },
  async input => {
    if (!input.syllabusText && !input.syllabusFileDataUri) {
      throw new Error("Either syllabus text or a syllabus file must be provided.");
    }
    const {output} = await prompt(input);
    return output!;
  }
);
