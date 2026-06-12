import type { AIProvider } from '@/types/ai';
import type { AIProviderId } from '@/types/settings';
import { openAIProvider } from '@/providers/openai';
import { anthropicProvider } from '@/providers/anthropic';
import { geminiProvider } from '@/providers/gemini';
import { systemProvider } from '@/providers/system';

const PROVIDERS: Record<AIProviderId, AIProvider> = {
  openai: openAIProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
};

/** Returns the AI provider implementation for the given provider id. The rest
 * of the app interacts only with the `AIProvider` interface and never knows
 * which concrete provider is active. */
export function getProvider(providerId: AIProviderId): AIProvider {
  return PROVIDERS[providerId];
}

/** Provider that proxies requests through the server (`/api/ai`) using a
 * system-configured key. No API key is needed or sent from the client. */
export function getSystemProvider(): AIProvider {
  return systemProvider;
}
