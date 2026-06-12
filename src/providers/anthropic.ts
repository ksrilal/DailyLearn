import type { AIProvider, ConnectionTestResult, MentorMessage } from '@/types/ai';
import { AIProviderError } from '@/types/ai';
import type { FlashcardSet, Lesson, Quiz, Summary } from '@/types/lesson';
import { SYSTEM_PROMPT, flashcardsPrompt, lessonPrompt, mentorSystemPrompt, quizPrompt, summaryPrompt } from '@/features/ai/prompts';
import { parseJsonResponse } from '@/features/ai/parse';

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

async function chat(apiKey: string, model: string, prompt: string, maxTokens = 4096): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AIProviderError(`Anthropic request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = data?.content?.[0]?.text;
  if (typeof content !== 'string') {
    throw new AIProviderError('Anthropic response missing content');
  }
  return content;
}

async function chatMentorAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: MentorMessage[],
): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AIProviderError(`Anthropic request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = data?.content?.[0]?.text;
  if (typeof content !== 'string') {
    throw new AIProviderError('Anthropic response missing content');
  }
  return content;
}

export const anthropicProvider: AIProvider = {
  id: 'anthropic',

  async generateLesson(input, apiKey, model) {
    const content = await chat(apiKey, model, lessonPrompt(input));
    const parsed = parseJsonResponse<Omit<Lesson, 'unitPath' | 'title' | 'generatedAt' | 'model' | 'provider'>>(content);
    return {
      unitPath: input.unitPath,
      title: input.learningUnit,
      generatedAt: new Date().toISOString(),
      model,
      provider: 'anthropic',
      ...parsed,
    };
  },

  async generateQuiz(input, lesson, apiKey, model) {
    const content = await chat(apiKey, model, quizPrompt(input, lesson));
    const parsed = parseJsonResponse<Pick<Quiz, 'questions'>>(content);
    return {
      unitPath: input.unitPath,
      generatedAt: new Date().toISOString(),
      model,
      provider: 'anthropic',
      ...parsed,
    };
  },

  async generateFlashcards(input, lesson, apiKey, model) {
    const content = await chat(apiKey, model, flashcardsPrompt(input, lesson));
    const parsed = parseJsonResponse<Pick<FlashcardSet, 'cards'>>(content);
    return {
      unitPath: input.unitPath,
      generatedAt: new Date().toISOString(),
      model,
      provider: 'anthropic',
      ...parsed,
    };
  },

  async generateSummary(input, lesson, apiKey, model) {
    const content = await chat(apiKey, model, summaryPrompt(input, lesson));
    const parsed = parseJsonResponse<Pick<Summary, 'summary'>>(content);
    return {
      unitPath: input.unitPath,
      generatedAt: new Date().toISOString(),
      model,
      provider: 'anthropic',
      ...parsed,
    };
  },

  chatMentor(input, lesson, messages, apiKey, model) {
    return chatMentorAnthropic(apiKey, model, mentorSystemPrompt(input, lesson), messages);
  },

  async testConnection(apiKey, model): Promise<ConnectionTestResult> {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Reply with the single word: ok' }],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { ok: false, message: `Anthropic error (${res.status}): ${body.slice(0, 200)}` };
      }
      return { ok: true, message: 'Connected successfully.' };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
