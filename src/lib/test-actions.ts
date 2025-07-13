
"use server";

import {
  analyzeDatesheet,
  TestAnalyzerOutput,
} from "@/ai/flows/test-analyzer";

export async function getTestsFromDatesheet(
  datesheetPhotoDataUri: string
): Promise<{ data: TestAnalyzerOutput | null; error: string | null }> {
  if (!datesheetPhotoDataUri) {
    return { data: { tests: [] }, error: "No image provided." };
  }
  try {
    const result = await analyzeDatesheet({ datesheetPhotoDataUri });
    return { data: result, error: null };
  } catch (error) {
    console.error("Error analyzing datesheet:", error);
    return { data: null, error: "Failed to analyze datesheet image. Please try again." };
  }
}
