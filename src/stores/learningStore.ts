import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningUnit } from '@/types/curriculum';
import { STORAGE_KEYS } from '@/lib/storage';
import { dateKey } from '@/lib/date';
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

/** Returns the first unit (in curriculum order) that hasn't been completed
 * yet, so learners progress sequentially through fundamentals before later
 * topics. Falls back to the first unit overall once everything is complete. */
function pickNextInOrder(units: LearningUnit[]): LearningUnit | null {
  if (units.length === 0) return null;
  const completed = new Set(useProgressStore.getState().completions.map((c) => c.unitPath));
  return units.find((u) => !completed.has(u.path)) ?? units[0];
}

function pickFromPool(units: LearningUnit[], seed: number): LearningUnit | null {
  if (units.length === 0) return null;
  const completed = new Set(useProgressStore.getState().completions.map((c) => c.unitPath));
  const incomplete = units.filter((u) => !completed.has(u.path));
  const pool = incomplete.length > 0 ? incomplete : units;
  const index = seed % pool.length;
  return pool[index];
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

        const unit = pickNextInOrder(units);
        if (unit) {
          set((state) => ({ dailyUnitByDate: { ...state.dailyUnitByDate, [today]: unit.path } }));
        }
        return unit;
      },

      pickRandomUnit: (units) => {
        if (units.length === 0) return null;
        const seed = Math.floor(Math.random() * units.length * 7919);
        return pickFromPool(units, seed);
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
