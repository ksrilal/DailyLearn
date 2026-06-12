import type { AIProvider, ConnectionTestResult } from '@/types/ai';
import { AIProviderError } from '@/types/ai';
import type { FlashcardSet, Lesson, Quiz, Summary } from '@/types/lesson';

const API_URL = '/api/ai';

async function callApi<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new AIProviderError(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

/** Routes generation through the app's server-side AI proxy (`/api/ai`), so no
 * API key is ever sent to or stored in the browser. Used when "use my own API
 * key" is off. */
export const systemProvider: AIProvider = {
  id: 'system',

  generateLesson(input, _apiKey, _model) {
    return callApi<Lesson>({ kind: 'lesson', input });
  },

  generateQuiz(input, lesson, _apiKey, _model) {
    return callApi<Quiz>({ kind: 'quiz', input, lesson });
  },

  generateFlashcards(input, lesson, _apiKey, _model) {
    return callApi<FlashcardSet>({ kind: 'flashcards', input, lesson });
  },

  generateSummary(input, lesson, _apiKey, _model) {
    return callApi<Summary>({ kind: 'summary', input, lesson });
  },

  async chatMentor(input, lesson, messages, _apiKey, _model) {
    const { reply } = await callApi<{ reply: string }>({ kind: 'mentor', input, lesson, messages });
    return reply;
  },

  async testConnection(_apiKey, _model): Promise<ConnectionTestResult> {
    try {
      return await callApi<ConnectionTestResult>({ kind: 'test' });
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};

/** Checks whether the server has at least one system AI provider configured. */
export async function checkSystemAvailability(): Promise<{
  available: boolean;
  providers: string[];
  defaultProvider?: string;
  defaultModel?: string;
}> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return { available: false, providers: [] };
    return await res.json();
  } catch {
    return { available: false, providers: [] };
  }
}
