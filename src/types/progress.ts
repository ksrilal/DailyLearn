export interface CompletionRecord {
  unitPath: string;
  completedAt: string;
}

export interface StreakData {
  current: number;
  longest: number;
  lastCompletedDate: string | null;
}

export interface ProgressState {
  completions: CompletionRecord[];
  streak: StreakData;
}

export interface ProgressCounts {
  today: number;
  week: number;
  month: number;
  allTime: number;
}

export interface CurriculumProgress {
  curriculumId: string;
  title: string;
  total: number;
  completed: number;
  percent: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
}
