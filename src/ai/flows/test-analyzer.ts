
'use server';
/**
 * @fileOverview A test datesheet analyzer AI agent.
 *
 * - analyzeDatesheet - A function that handles the datesheet analysis process.
 * - TestAnalyzerInput - The input type for the analyzeSyllabus function.
 * - TestAnalyzerOutput - The return type for the analyzeSyllabus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestAnalyzerInputSchema = z.object({
  datesheetPhotoDataUri: z
    .string()
    .describe(
      "A photo of the datesheet, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TestAnalyzerInput = z.infer<typeof TestAnalyzerInputSchema>;

const TestAnalyzerOutputSchema = z.object({
  tests: z.array(
    z.object({
      testName: z.string().describe('The name of the test.'),
      startDate: z.string().describe('The start date of the test in YYYY-MM-DD format.'),
      endDate: z.string().describe('The end date of the test in YYYY-MM-DD format.'),
    })
  ).describe('A list of tests derived from the datesheet.'),
});
export type TestAnalyzerOutput = z.infer<typeof TestAnalyzerOutputSchema>;

export async function analyzeDatesheet(input: TestAnalyzerInput): Promise<TestAnalyzerOutput> {
  return analyzeDatesheetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'datesheetAnalyzerPrompt',
  input: {schema: TestAnalyzerInputSchema},
  output: {schema: TestAnalyzerOutputSchema},
  prompt: `You are an AI assistant that extracts structured test data from an image of a test datesheet. Analyze the following datesheet and extract all tests. Today's date is ${new Date().toDateString()}.

  Datesheet Image: {{media url=datesheetPhotoDataUri}}
  `,
});

const analyzeDatesheetFlow = ai.defineFlow(
  {
    name: 'analyzeDatesheetFlow',
    inputSchema: TestAnalyzerInputSchema,
    outputSchema: TestAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
