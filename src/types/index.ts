
export interface Task {
  id: string;
  psid: string;
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

export interface Test {
  id: string;
  psid: string;
  testName: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
}
