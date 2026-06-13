import type { ServerProviderId } from './chat.js';

const PROVIDER_IDS: ServerProviderId[] = ['openai', 'anthropic', 'gemini'];

const DEFAULT_MODELS: Record<ServerProviderId, string> = {
  openai: 'gpt-5-mini',
  anthropic: 'claude-sonnet-4-6',
  gemini: 'gemini-2.5-flash',
};

const API_KEY_ENV: Record<ServerProviderId, string | undefined> = {
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
};

const MODEL_ENV: Record<ServerProviderId, string | undefined> = {
  openai: process.env.OPENAI_MODEL,
  anthropic: process.env.ANTHROPIC_MODEL,
  gemini: process.env.GEMINI_MODEL,
};

export interface SystemProviderConfig {
  provider: ServerProviderId;
  apiKey: string;
  model: string;
}

/** Resolves the configured system AI provider/key/model from server-only env vars, if any. */
export function getSystemProviderConfig(requested?: string): SystemProviderConfig | null {
  const defaultProvider = (process.env.DEFAULT_AI_PROVIDER as ServerProviderId | undefined) ?? 'anthropic';
  const provider = PROVIDER_IDS.includes(requested as ServerProviderId)
    ? (requested as ServerProviderId)
    : defaultProvider;

  const apiKey = API_KEY_ENV[provider];
  if (!apiKey) return null;

  return {
    provider,
    apiKey,
    model: MODEL_ENV[provider] || DEFAULT_MODELS[provider],
  };
}

/** Returns which providers have a system API key configured, without exposing the keys. */
export function getAvailableProviders(): ServerProviderId[] {
  return PROVIDER_IDS.filter((p) => !!API_KEY_ENV[p]);
}
