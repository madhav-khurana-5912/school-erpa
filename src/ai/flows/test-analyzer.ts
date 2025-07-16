
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
  prompt: `You are an AI assistant specializing in accurately extracting structured data from test datesheets.

**Instructions:**

1.  **Group Subjects into a Single Test Event:** Many datesheets list multiple subjects for the same test event (e.g., "Unit Test 1", "Term End Exam"). You MUST identify these as a single test.
    *   **Correct Behavior:** If you see "Unit Test 1" with subjects "Physics", "Chemistry", and "Maths" on different dates, create ONE entry with \`testName: "Unit Test 1"\`.
    *   **Incorrect Behavior:** Do NOT create separate entries for "Unit Test 1 - Physics", "Unit Test 1 - Chemistry", etc.

2.  **Combine All Syllabus Topics:** For a single test event, you MUST combine all associated subjects/topics into a single \`syllabus\` string.
    *   **Example:** If "Unit Test 1" has:
        *   Physics: Chapters 1-3
        *   Chemistry: Organic Compounds
    *   The syllabus field for the "Unit Test 1" entry should be "Physics: Chapters 1-3, Chemistry: Organic Compounds".

3.  **Determine Date Range:**
    *   The \`startDate\` should be the earliest date among all subjects in the test event.
    *   The \`endDate\` should be the latest date among all subjects in the test event.
    *   Format all dates as **YYYY-MM-DD**. Infer the year from the current date: ${new Date().toDateString()}.

**Analyze the following datesheet images and extract the data based on these rules.**

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
