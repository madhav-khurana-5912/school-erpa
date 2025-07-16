
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
  prompt: `You are an expert AI assistant tasked with *accurately* extracting structured data from images of a test datesheet. Your primary goal is precision. Do not invent or hallucinate information. If the image is not a datesheet, return an empty list.

**CRITICAL INSTRUCTIONS:**

1.  **Accurate Date Extraction:**
    *   Today's date is **${new Date().toDateString()}**. Use this to correctly determine the year for the test dates. Datesheets often omit the year, so you must infer it logically.
    *   Extract the start and end dates for each test and format them as **YYYY-MM-DD**.
    *   If a test is on a single day, the \`startDate\` and \`endDate\` will be the same.

2.  **Group Subjects by CONSECUTIVE Days ONLY:**
    *   **This is the most important rule.** You can only group subjects under the same \`testName\` (e.g., "Unit Test 1") if their exam dates are consecutive (e.g., Monday and Tuesday).
    *   A single test event's \`endDate\` can be at most **2 days** after its \`startDate\`.
    *   **Correct Behavior:** If "Unit Test 1" has Physics on Monday and Chemistry on Tuesday, create ONE entry for "Unit Test 1" with \`startDate\` as Monday and \`endDate\` as Tuesday.
    *   **Incorrect Behavior:** If "Unit Test 1" has Physics on Monday and Maths on Wednesday, you MUST create TWO SEPARATE entries: one for "Unit Test 1 - Physics" on Monday, and one for "Unit Test 1 - Maths" on Wednesday. Do not create a single test spanning from Monday to Wednesday. Append the subject to the test name to make them unique.

3.  **Extract and Combine All Syllabus Topics:**
    *   For a single test event (grouped by consecutive days), you MUST combine all associated subjects and their specific syllabus topics (if provided) into a single \`syllabus\` string.
    *   **Look for a "Syllabus" column or section.** Many datesheets list specific chapters or topics.
    *   **Example:** If a test on Monday and Tuesday has:
        *   Physics: Chapters 1-3
        *   Chemistry: Organic Compounds
        The syllabus field for that single test entry should be "Physics: Chapters 1-3, Chemistry: Organic Compounds".
    *   If no specific topics are listed, use the subject name as the syllabus. For example, if it just says "English", the syllabus contribution is just "English".

**Analyze the following datesheet images and extract the data *only* based on the information visible in the image, following these rules strictly:**

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
