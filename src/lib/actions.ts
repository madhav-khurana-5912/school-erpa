"use server";

import {
  analyzeSyllabus,
  SyllabusAnalyzerOutput,
} from "@/ai/flows/syllabus-analyzer";

export async function getStudyTasksFromSyllabus(
  syllabusText: string
): Promise<{ data: SyllabusAnalyzerOutput | null; error: string | null }> {
  if (!syllabusText.trim()) {
    return { data: { studyTasks: [] }, error: null };
  }
  try {
    const result = await analyzeSyllabus({ syllabusText });
    return { data: result, error: null };
  } catch (error) {
    console.error("Error analyzing syllabus:", error);
    return { data: null, error: "Failed to analyze syllabus. Please try again." };
  }
}
