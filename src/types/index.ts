export interface Task {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  date: string; // ISO string for date and time
  duration: number; // in minutes
  notes?: string;
  completed: boolean;
}

export interface SuggestedTask {
  topic: string;
  durationMinutes: number;
}
