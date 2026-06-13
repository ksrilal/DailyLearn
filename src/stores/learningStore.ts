import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningUnit } from '@/types/curriculum';
import { STORAGE_KEYS } from '@/lib/storage';
import { dateKey, hashString } from '@/lib/date';
import { useProgressStore } from '@/stores/progressStore';

export type LearningMode = 'daily' | 'guided' | 'random' | 'review';

interface LearningStore {
  /** Cache the daily unit path per date so "Start Learning" is stable across the day. */
  dailyUnitByDate: Record<string, string>;
  activeUnitPath: string | null;
  activeMode: LearningMode | null;

  pickDailyUnit: (units: LearningUnit[]) => LearningUnit | null;
  pickRandomUnit: (units: LearningUnit[]) => LearningUnit | null;
  setActiveUnit: (unitPath: string, mode: LearningMode) => void;
  clearActiveUnit: () => void;

  importLearning: (state: { dailyUnitByDate: Record<string, string> }) => void;
}

/** Picks the next unit to learn.
 *
 * Categories are visited in a shuffled order starting from a random
 * offset (`seed` — per-day for the daily pick, random for "Surprise Me").
 * Starting at that offset, each category is checked in turn: if its
 * current topic (the first topic with an incomplete unit) has remaining
 * units, one of them is returned; otherwise move on to the next category.
 * This gives variety across categories/curricula on every pick while each
 * category still progresses through its topics in order, always landing
 * on the first incomplete unit of the current topic.
 *
 * Falls back to the first unit once everything is complete. */
function pickNextInOrder(units: LearningUnit[], seed: number): LearningUnit | null {
  if (units.length === 0) return null;
  const completed = new Set(useProgressStore.getState().completions.map((c) => c.unitPath));

  const categoryGroups = new Map<string, LearningUnit[]>();
  for (const unit of units) {
    const key = `${unit.moduleId}/${unit.curriculumId}/${unit.categoryId}`;
    const group = categoryGroups.get(key);
    if (group) group.push(unit);
    else categoryGroups.set(key, [unit]);
  }

  const groups = Array.from(categoryGroups.values());
  if (groups.length === 0) return units[0];

  const offset = seed % groups.length;
  for (let i = 0; i < groups.length; i++) {
    const group = groups[(offset + i) % groups.length];
    const remaining = group.filter((u) => !completed.has(u.path));
    if (remaining.length === 0) continue;

    return remaining[0];
  }

  return units[0];
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      dailyUnitByDate: {},
      activeUnitPath: null,
      activeMode: null,

      pickDailyUnit: (units) => {
        if (units.length === 0) return null;
        const today = dateKey();
        const existingPath = get().dailyUnitByDate[today];
        if (existingPath) {
          const existing = units.find((u) => u.path === existingPath);
          if (existing && !useProgressStore.getState().isCompleted(existing.path)) return existing;
        }

        const unit = pickNextInOrder(units, hashString(today));
        if (unit) {
          set((state) => ({ dailyUnitByDate: { ...state.dailyUnitByDate, [today]: unit.path } }));
        }
        return unit;
      },

      pickRandomUnit: (units) => {
        if (units.length === 0) return null;
        const seed = Math.floor(Math.random() * units.length * 7919);
        return pickNextInOrder(units, seed);
      },

      setActiveUnit: (unitPath, mode) => set({ activeUnitPath: unitPath, activeMode: mode }),

      clearActiveUnit: () => set({ activeUnitPath: null, activeMode: null }),

      importLearning: (state) => set({ dailyUnitByDate: state.dailyUnitByDate }),
    }),
    {
      name: STORAGE_KEYS.learning,
      partialize: (state) => ({ dailyUnitByDate: state.dailyUnitByDate }),
    },
  ),
);
