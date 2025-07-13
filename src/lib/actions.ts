"use server";

import {
  analyzeSyllabus,
  SyllabusAnalyzerInput,
  SyllabusAnalyzerOutput,
} from "@/ai/flows/syllabus-analyzer";

export async function getStudyTasksFromSyllabus(
  input: SyllabusAnalyzerInput
): Promise<{ data: SyllabusAnalyzerOutput | null; error: string | null }> {
  if (!input.syllabusText?.trim() && !input.syllabusFileDataUri) {
    return { data: { studyTasks: [] }, error: "No syllabus content provided." };
  }
  try {
    const result = await analyzeSyllabus(input);
    return { data: result, error: null };
  } catch (error) {
    console.error("Error analyzing syllabus:", error);
    return { data: null, error: "Failed to analyze syllabus. Please try again." };
  }
}
