import { create } from 'zustand';
import type { Curriculum, LearningUnit } from '@/types/curriculum';
import { getEnabledModules } from '@/data/modules';
import { loadModuleCurricula, flattenUnits } from '@/data/curriculumLoader';

interface CurriculumStore {
  curricula: Curriculum[];
  unitsByPath: Map<string, LearningUnit>;
  allUnits: LearningUnit[];
  loading: boolean;
  loaded: boolean;
  expandedIds: Set<string>;
  load: () => Promise<void>;
  toggleExpanded: (id: string) => void;
  getUnit: (path: string) => LearningUnit | undefined;
}

export const useCurriculumStore = create<CurriculumStore>((set, get) => ({
  curricula: [],
  unitsByPath: new Map(),
  allUnits: [],
  loading: false,
  loaded: false,
  expandedIds: new Set(),

  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });

    const enabledModules = getEnabledModules();
    const results = await Promise.all(enabledModules.map((m) => loadModuleCurricula(m.id)));
    const curricula = results.flat();

    const allUnits = curricula.flatMap(flattenUnits);
    const unitsByPath = new Map(allUnits.map((u) => [u.path, u]));

    set({ curricula, allUnits, unitsByPath, loading: false, loaded: true });
  },

  toggleExpanded: (id) =>
    set((state) => {
      const next = new Set(state.expandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedIds: next };
    }),

  getUnit: (path) => get().unitsByPath.get(path),
}));
