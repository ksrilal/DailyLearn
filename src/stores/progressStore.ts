import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CompletionRecord, CurriculumProgress, HeatmapDay, ProgressCounts, StreakData } from '@/types/progress';
import type { Curriculum } from '@/types/curriculum';
import { flattenUnits } from '@/data/curriculumLoader';
import { STORAGE_KEYS } from '@/lib/storage';
import { dateKey, daysBetween, isToday, isYesterday, startOfMonth, startOfWeek } from '@/lib/date';

interface ProgressStore {
  completions: CompletionRecord[];
  streak: StreakData;

  isCompleted: (unitPath: string) => boolean;
  markComplete: (unitPath: string) => void;
  markIncomplete: (unitPath: string) => void;

  getCounts: () => ProgressCounts;
  getCurriculumProgress: (curricula: Curriculum[]) => CurriculumProgress[];
  getHeatmap: (days?: number) => HeatmapDay[];

  importProgress: (state: { completions: CompletionRecord[]; streak: StreakData }) => void;
  reset: () => void;
}

const DEFAULT_STREAK: StreakData = { current: 0, longest: 0, lastCompletedDate: null };

function recomputeStreak(completions: CompletionRecord[]): StreakData {
  if (completions.length === 0) return DEFAULT_STREAK;

  const completedDates = Array.from(
    new Set(completions.map((c) => dateKey(new Date(c.completedAt)))),
  ).sort();

  let longest = 1;
  let run = 1;
  for (let i = 1; i < completedDates.length; i++) {
    if (daysBetween(completedDates[i - 1], completedDates[i]) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  const lastDate = completedDates[completedDates.length - 1];
  let current = 0;
  if (isToday(lastDate) || isYesterday(lastDate)) {
    current = 1;
    for (let i = completedDates.length - 1; i > 0; i--) {
      if (daysBetween(completedDates[i - 1], completedDates[i]) === 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, longest, lastCompletedDate: lastDate };
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      completions: [],
      streak: DEFAULT_STREAK,

      isCompleted: (unitPath) => get().completions.some((c) => c.unitPath === unitPath),

      markComplete: (unitPath) =>
        set((state) => {
          if (state.completions.some((c) => c.unitPath === unitPath)) return state;
          const completions = [...state.completions, { unitPath, completedAt: new Date().toISOString() }];
          return { completions, streak: recomputeStreak(completions) };
        }),

      markIncomplete: (unitPath) =>
        set((state) => {
          const completions = state.completions.filter((c) => c.unitPath !== unitPath);
          return { completions, streak: recomputeStreak(completions) };
        }),

      getCounts: () => {
        const completions = get().completions;
        const now = new Date();
        const weekStart = startOfWeek(now);
        const monthStart = startOfMonth(now);

        let today = 0;
        let week = 0;
        let month = 0;

        for (const c of completions) {
          const completedAt = new Date(c.completedAt);
          if (isToday(dateKey(completedAt))) today += 1;
          if (completedAt >= weekStart) week += 1;
          if (completedAt >= monthStart) month += 1;
        }

        return { today, week, month, allTime: completions.length };
      },

      getCurriculumProgress: (curricula) => {
        const completedSet = new Set(get().completions.map((c) => c.unitPath));
        return curricula.map((curriculum) => {
          const units = flattenUnits(curriculum);
          const completed = units.filter((u) => completedSet.has(u.path)).length;
          return {
            curriculumId: curriculum.id,
            title: curriculum.title,
            total: units.length,
            completed,
            percent: units.length === 0 ? 0 : Math.round((completed / units.length) * 100),
          };
        });
      },

      getHeatmap: (days = 84) => {
        const completions = get().completions;
        const counts = new Map<string, number>();
        for (const c of completions) {
          const key = dateKey(new Date(c.completedAt));
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }

        const result: HeatmapDay[] = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = dateKey(d);
          result.push({ date: key, count: counts.get(key) ?? 0 });
        }
        return result;
      },

      importProgress: (state) => set({ completions: state.completions, streak: state.streak }),

      reset: () => set({ completions: [], streak: DEFAULT_STREAK }),
    }),
    {
      name: STORAGE_KEYS.progress,
    },
  ),
);
