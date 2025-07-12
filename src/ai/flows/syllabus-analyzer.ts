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
  syllabusText: z.string().describe('The text content of the syllabus.'),
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
  prompt: `You are an AI study assistant that helps students create a study plan, and should be used to generate a list of study tasks with recommended durations based on a syllabus.

  Syllabus: {{{syllabusText}}}
  `,
});

const analyzeSyllabusFlow = ai.defineFlow(
  {
    name: 'analyzeSyllabusFlow',
    inputSchema: SyllabusAnalyzerInputSchema,
    outputSchema: SyllabusAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
