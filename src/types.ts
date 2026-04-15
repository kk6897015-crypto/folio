export type TaskTag = 'Study' | 'Work' | 'Personal' | 'Health';

export interface Task {
  id: string;
  title: string;
  tag: TaskTag;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export type Mood = 'Ecstatic' | 'Happy' | 'Neutral' | 'Sad' | 'Anxious' | 'Tired';

export interface JournalEntry {
  id: string;
  content: string;
  mood: Mood;
  tags: string[];
  createdAt: string;
  wordCount: number;
}

export interface AppState {
  tasks: Task[];
  journalEntries: JournalEntry[];
}
