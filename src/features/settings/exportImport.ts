import type { AppSettings } from '@/types/settings';
import type { CompletionRecord, StreakData } from '@/types/progress';
import { clearAllCaches, lessonCache, quizCache, flashcardCache, summaryCache } from '@/lib/db';
import { STORAGE_KEYS } from '@/lib/storage';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProgressStore } from '@/stores/progressStore';
import { useLearningStore } from '@/stores/learningStore';

export const EXPORT_VERSION = 1;

export interface DailyLearnExport {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  progress: {
    completions: CompletionRecord[];
    streak: StreakData;
  };
  learning: {
    dailyUnitByDate: Record<string, string>;
  };
  cachedMetadata: {
    lessons: string[];
    quizzes: string[];
    flashcards: string[];
    summaries: string[];
  };
}

export async function buildExport(): Promise<DailyLearnExport> {
  const settingsState = useSettingsStore.getState();
  const progressState = useProgressStore.getState();
  const learningState = useLearningStore.getState();

  const [lessonKeys, quizKeys, flashcardKeys, summaryKeys] = await Promise.all([
    lessonCache.allKeys(),
    quizCache.allKeys(),
    flashcardCache.allKeys(),
    summaryCache.allKeys(),
  ]);

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: {
      provider: settingsState.provider,
      apiKeys: settingsState.apiKeys,
      models: settingsState.models,
      useSystemKey: settingsState.useSystemKey,
      theme: settingsState.theme,
      learningLanguage: settingsState.learningLanguage,
    },
    progress: {
      completions: progressState.completions,
      streak: progressState.streak,
    },
    learning: {
      dailyUnitByDate: learningState.dailyUnitByDate,
    },
    cachedMetadata: {
      lessons: lessonKeys,
      quizzes: quizKeys,
      flashcards: flashcardKeys,
      summaries: summaryKeys,
    },
  };
}

export function downloadExport(data: DailyLearnExport): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dailylearn-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function isValidExport(data: unknown): data is DailyLearnExport {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.version === 'number' &&
    typeof d.settings === 'object' &&
    typeof d.progress === 'object' &&
    typeof d.learning === 'object'
  );
}

export function applyImport(data: DailyLearnExport): void {
  useSettingsStore.getState().importSettings(data.settings);
  useProgressStore.getState().importProgress(data.progress);
  useLearningStore.getState().importLearning(data.learning);
}

/** Clears all locally saved data: settings, progress, streaks, mentor chats, flashcard
 * ratings, and cached lessons/quizzes/flashcards/summaries in IndexedDB. */
export async function resetAllAppData(): Promise<void> {
  await clearAllCaches();
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }

  const userId = useAuthStore.getState().user?.id;
  if (supabaseEnabled && userId) {
    await supabase.from('user_progress').delete().eq('user_id', userId);
  }
}
