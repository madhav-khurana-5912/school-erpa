
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
  prompt: `You are an expert AI assistant tasked with accurately extracting structured data from images of a test datesheet. Your goal is to identify all tests, their dates, and their complete syllabus. Today's date is ${new Date().toDateString()}.

**CRITICAL INSTRUCTIONS:**

1.  **Group Subjects into a Single Test Event:** Many datesheets list multiple subjects for the same overall test (e.g., "Unit Test 1", "Term End Exam"). You MUST identify these as a single test.
    *   **Correct Behavior:** If you see "Unit Test 1" with subjects "Physics", "Chemistry", and "Maths" listed, create ONE entry with \`testName: "Unit Test 1"\`.
    *   **Incorrect Behavior:** Do NOT create separate entries like "Unit Test 1 - Physics".

2.  **Extract and Combine All Syllabus Topics:** For a single test event, you MUST combine all associated subjects and their specific syllabus topics into a single \`syllabus\` string.
    *   **Look for a "Syllabus" column or section.** Many datesheets list specific chapters or topics.
    *   **Example:** If the datesheet shows:
        *   Physics: Chapters 1-3
        *   Chemistry: Organic Compounds
        *   MAT: Number Series
        The syllabus field for that single test entry should be "Physics: Chapters 1-3, Chemistry: Organic Compounds, MAT: Number Series".
    *   **If no specific topics are listed, use the subject name as the syllabus.** For example, if it just says "English", the syllabus contribution is just "English".

3.  **Accurate Date Extraction:** Extract the start and end dates for each test event and format them as YYYY-MM-DD. If a test is on a single day, the start and end dates will be the same. The start date is the earliest date for any subject in the test group, and the end date is the latest.

**Analyze the following datesheet images and extract the data according to these rules:**

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
