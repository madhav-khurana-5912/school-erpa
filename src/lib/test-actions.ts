
"use server";

import {
  analyzeDatesheet,
  TestAnalyzerOutput,
} from "@/ai/flows/test-analyzer";

export async function getTestsFromDatesheet(
  datesheetPhotoDataUris: string[]
): Promise<{ data: TestAnalyzerOutput | null; error: string | null }> {
  if (!datesheetPhotoDataUris || datesheetPhotoDataUris.length === 0) {
    return { data: { tests: [] }, error: "No image provided." };
  }
  try {
    const result = await analyzeDatesheet({ datesheetPhotoDataUris });
    return { data: result, error: null };
  } catch (error) {
    console.error("Error analyzing datesheet:", error);
    return { data: null, error: "Failed to analyze datesheet image(s). Please try again." };
  }
}
