
"use server";

import {
  analyzeDatesheet,
  TestAnalyzerOutput,
} from "@/ai/flows/test-analyzer";

export async function getTestsFromDatesheet(
  datesheetText: string
): Promise<{ data: TestAnalyzerOutput | null; error: string | null }> {
  if (!datesheetText.trim()) {
    return { data: { tests: [] }, error: null };
  }
  try {
    const result = await analyzeDatesheet({ datesheetText });
    return { data: result, error: null };
  } catch (error) {
    console.error("Error analyzing datesheet:", error);
    return { data: null, error: "Failed to analyze datesheet. Please try again." };
  }
}
