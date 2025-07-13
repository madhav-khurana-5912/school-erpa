
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
  datesheetPhotoDataUris: z
    .array(z.string())
    .describe(
      "An array of photos of the datesheet, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TestAnalyzerInput = z.infer<typeof TestAnalyzerInputSchema>;

const TestAnalyzerOutputSchema = z.object({
  tests: z.array(
    z.object({
      testName: z.string().describe('The name of the test.'),
      startDate: z.string().describe('The start date of the test in YYYY-MM-DD format.'),
      endDate: z.string().describe('The end date of the test in YYYY-MM-DD format.'),
      syllabus: z.string().optional().describe('The syllabus for the test, if mentioned. Include all topics and subjects.'),
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
  prompt: `You are an AI assistant that extracts structured test data from one or more images of a test datesheet. Analyze the following datesheet images and extract all tests, their start and end dates, and their syllabus if provided. Today's date is ${new Date().toDateString()}.

IMPORTANT: Some tests, like a "Unit Test" (UT), may have multiple subjects listed on the same date. If you see multiple subjects for the same test on the same date, you MUST group them into a single test event. The 'testName' should be the name of the test event (e.g., "Unit Test 1"), and the 'syllabus' should be a combined list of all subjects for that test (e.g., "Social Science, English, MAT"). Do NOT create separate test entries for each subject of the same test event.

  Datesheet Images:
  {{#each datesheetPhotoDataUris}}
  {{media url=this}}
  {{/each}}
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
