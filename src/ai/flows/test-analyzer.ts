
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
import { addDays, format, parseISO } from 'date-fns';

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
  prompt: `You are an expert AI assistant designed to meticulously extract structured information from academic datesheets. Your primary goal is accuracy. If you are not certain about a piece of information, do not include it.

**Current Date:** ${new Date().toDateString()} (Use this to correctly infer the year for the test dates).

**CRITICAL INSTRUCTIONS:**

1.  **Group Subjects into a Single Test Event:**
    *   Many datesheets list multiple subjects for the same test event (e.g., "Unit Test 1", "Mid-Term Exam"). You MUST identify all subjects belonging to a single test and group them.
    *   The \`startDate\` for the test event is the earliest date of any subject within that group.
    *   The \`endDate\` for the test event is the latest date of any subject within that group.
    *   Do NOT create separate test entries for "Unit Test 1 - Physics", "Unit Test 1 - Chemistry", etc. Create ONE entry named "Unit Test 1".

2.  **Combine Syllabus Information:**
    *   For each test event, you MUST find the syllabus for every subject listed.
    *   Combine all these details into a single, comprehensive \`syllabus\` string.
    *   If a syllabus is not mentioned for a subject, just list the subject's name.

3.  **Accuracy and Formatting:**
    *   Format ALL dates as **YYYY-MM-DD**. Use the current year provided above as the default.
    *   Do NOT invent information. If a detail (like a syllabus) is not present, omit it from the output string.
    *   If the provided image is not a datesheet or is unreadable, return an empty list of tests.

**EXAMPLE:**

**If the datesheet image shows:**
| Date        | Subject     | Syllabus                   |
|-------------|-------------|----------------------------|
| 15 Jul      | Physics     | Chapters 1-3, Kinematics   |
| 16 Jul      | Chemistry   | Ch. 2, Organic Compounds   |
| 18 Jul      | Maths       | Algebra (Ch. 4 & 5)        |

And the header says **"Unit Test 1 Schedule"**.

**Your JSON output MUST be:**
\`\`\`json
{
  "tests": [
    {
      "testName": "Unit Test 1",
      "startDate": "2024-07-15",
      "endDate": "2024-07-18",
      "syllabus": "Physics: Chapters 1-3, Kinematics. Chemistry: Ch. 2, Organic Compounds. Maths: Algebra (Ch. 4 & 5)."
    }
  ]
}
\`\`\`

**Now, analyze the following datesheet images based on these exact rules.**

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
    if (!output || !output.tests) {
        return { tests: [] };
    }
    
    // Add 2 days to both start and end dates
    const adjustedTests = output.tests.map(test => {
        try {
            const originalStartDate = parseISO(test.startDate);
            const originalEndDate = parseISO(test.endDate);

            const adjustedStartDate = addDays(originalStartDate, 2);
            const adjustedEndDate = addDays(originalEndDate, 2);

            return {
                ...test,
                startDate: format(adjustedStartDate, 'yyyy-MM-dd'),
                endDate: format(adjustedEndDate, 'yyyy-MM-dd'),
            };
        } catch (e) {
            console.error(`Could not parse and adjust date for test: ${test.testName}. Returning original.`);
            return test;
        }
    });

    return { tests: adjustedTests };
  }
);
