// src/lib/actions.ts
"use server";

import {
  analyzeSyllabus,
  SyllabusAnalyzerInput,
  SyllabusAnalyzerOutput,
} from "@/ai/flows/syllabus-analyzer";

import {
  suggestTopics,
  TopicSuggesterInput,
  TopicSuggesterOutput,
} from "@/ai/flows/topic-suggester";


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

export async function getTopicSuggestions(
  input: TopicSuggesterInput
): Promise<{ data: TopicSuggesterOutput | null; error: string | null }> {
  if (!input.subject || input.syllabusTopics.length === 0) {
    return { data: { suggestedTopics: [] }, error: "Subject or syllabus topics missing." };
  }
  try {
    const result = await suggestTopics(input);
    return { data: result, error: null };
  } catch (error) {
    console.error("Error suggesting topics:", error);
    return { data: null, error: "Failed to suggest topics." };
  }
}
