import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProviderId, AppSettings, LearningLanguage, ThemeMode } from '@/types/settings';
import { DEFAULT_MODELS, DEFAULT_SETTINGS } from '@/types/settings';
import { STORAGE_KEYS } from '@/lib/storage';

interface SettingsStore extends AppSettings {
  setProvider: (provider: AIProviderId) => void;
  setApiKey: (provider: AIProviderId, key: string) => void;
  setModel: (provider: AIProviderId, model: string) => void;
  setUseSystemKey: (provider: AIProviderId, useSystemKey: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setLearningLanguage: (learningLanguage: LearningLanguage) => void;
  reset: () => void;
  importSettings: (settings: AppSettings) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setProvider: (provider) => set({ provider }),

      setApiKey: (provider, key) =>
        set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),

      setModel: (provider, model) =>
        set((state) => ({ models: { ...state.models, [provider]: model } })),

      setUseSystemKey: (provider, useSystemKey) =>
        set((state) => ({ useSystemKey: { ...state.useSystemKey, [provider]: useSystemKey } })),

      setTheme: (theme) => set({ theme }),

      setLearningLanguage: (learningLanguage) => set({ learningLanguage }),

      reset: () =>
        set({
          ...DEFAULT_SETTINGS,
          models: { ...DEFAULT_MODELS },
          apiKeys: { openai: '', anthropic: '', gemini: '' },
          useSystemKey: { ...DEFAULT_SETTINGS.useSystemKey },
        }),

      importSettings: (settings) =>
        set({
          ...settings,
          useSystemKey: { ...DEFAULT_SETTINGS.useSystemKey, ...settings.useSystemKey },
          learningLanguage: settings.learningLanguage ?? DEFAULT_SETTINGS.learningLanguage,
        }),
    }),
    {
      name: STORAGE_KEYS.settings,
    },
  ),
);
