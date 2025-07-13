// src/ai/flows/topic-suggester.ts
'use server';
/**
 * @fileOverview An AI agent that suggests relevant study topics.
 *
 * - suggestTopics - A function that suggests topics for a given subject from a syllabus.
 * - TopicSuggesterInput - The input type for the suggestTopics function.
 * - TopicSuggesterOutput - The return type for the suggestTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TopicSuggesterInputSchema = z.object({
  subject: z.string().describe('The subject for which to suggest topics.'),
  syllabusTopics: z.array(z.string()).describe('The full list of all topics from the user\'s syllabus.'),
});
export type TopicSuggesterInput = z.infer<typeof TopicSuggesterInputSchema>;

const TopicSuggesterOutputSchema = z.object({
  suggestedTopics: z.array(z.string()).describe('A list of topics relevant to the specified subject.'),
});
export type TopicSuggesterOutput = z.infer<typeof TopicSuggesterOutputSchema>;

export async function suggestTopics(input: TopicSuggesterInput): Promise<TopicSuggesterOutput> {
  return suggestTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'topicSuggesterPrompt',
  input: {schema: TopicSuggesterInputSchema},
  output: {schema: TopicSuggesterOutputSchema},
  prompt: `You are an expert curriculum assistant. Your task is to select relevant topics for a specific academic subject from a comprehensive list of all syllabus topics.

The user wants to study the subject: '{{subject}}'.

From the following list of all available syllabus topics, please identify and return ONLY the topics that are directly related to '{{subject}}'.

Syllabus Topics List:
{{#each syllabusTopics}}
- {{{this}}}
{{/each}}
`,
});

const suggestTopicsFlow = ai.defineFlow(
  {
    name: 'suggestTopicsFlow',
    inputSchema: TopicSuggesterInputSchema,
    outputSchema: TopicSuggesterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
