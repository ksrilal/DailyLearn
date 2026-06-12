import { create } from 'zustand';
import type { ConnectionTestResult } from '@/types/ai';

interface AIStore {
  generating: boolean;
  generatingMessage: string | null;
  error: string | null;
  testResult: ConnectionTestResult | null;
  testing: boolean;

  setGenerating: (generating: boolean, message?: string | null) => void;
  setError: (error: string | null) => void;
  setTesting: (testing: boolean) => void;
  setTestResult: (result: ConnectionTestResult | null) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  generating: false,
  generatingMessage: null,
  error: null,
  testResult: null,
  testing: false,

  setGenerating: (generating, message = null) => set({ generating, generatingMessage: message }),
  setError: (error) => set({ error }),
  setTesting: (testing) => set({ testing }),
  setTestResult: (testResult) => set({ testResult }),
}));
