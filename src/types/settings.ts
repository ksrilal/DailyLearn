export type AIProviderId = 'openai' | 'anthropic' | 'gemini';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  provider: AIProviderId;
  apiKeys: Record<AIProviderId, string>;
  models: Record<AIProviderId, string>;
  useSystemKey: Record<AIProviderId, boolean>;
  theme: ThemeMode;
}

export const DEFAULT_MODELS: Record<AIProviderId, string> = {
  openai: 'gpt-5-mini',
  anthropic: 'claude-sonnet-4-6',
  gemini: 'gemini-2.5-flash',
};

export const PROVIDER_LABELS: Record<AIProviderId, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
};

export const MODEL_OPTIONS: Record<AIProviderId, { id: string; label: string }[]> = {
  openai: [
    { id: 'gpt-5', label: 'GPT-5' },
    { id: 'gpt-5-mini', label: 'GPT-5 Mini' },
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  ],
  anthropic: [
    { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
    { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  ],
  gemini: [
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ],
};

export const DEFAULT_SETTINGS: AppSettings = {
  provider: 'anthropic',
  apiKeys: {
    openai: '',
    anthropic: '',
    gemini: '',
  },
  models: { ...DEFAULT_MODELS },
  useSystemKey: {
    openai: true,
    anthropic: true,
    gemini: true,
  },
  theme: 'system',
};
