import type { AIProvider, ConnectionTestResult, MentorMessage } from '@/types/ai';
import { AIProviderError } from '@/types/ai';
import type { FlashcardSet, Lesson, Quiz, Summary } from '@/types/lesson';
import { SYSTEM_PROMPT, flashcardsPrompt, lessonPrompt, mentorSystemPrompt, quizPrompt, summaryPrompt } from '@/features/ai/prompts';
import { normalizeLesson, parseJsonResponse } from '@/features/ai/parse';

const API_URL = 'https://api.openai.com/v1/chat/completions';

async function chat(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AIProviderError(`OpenAI request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new AIProviderError('OpenAI response missing message content');
  }
  return content;
}

async function chatMentorOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: MentorMessage[],
): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AIProviderError(`OpenAI request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new AIProviderError('OpenAI response missing message content');
  }
  return content;
}

export const openAIProvider: AIProvider = {
  id: 'openai',

  async generateLesson(input, apiKey, model) {
    const content = await chat(apiKey, model, lessonPrompt(input));
    const parsed = parseJsonResponse<Omit<Lesson, 'unitPath' | 'title' | 'generatedAt' | 'model' | 'provider'>>(content);
    return normalizeLesson({
      unitPath: input.unitPath,
      title: input.learningUnit,
      generatedAt: new Date().toISOString(),
      model,
      provider: 'openai',
      ...parsed,
    });
  },

  async generateQuiz(input, lesson, apiKey, model) {
    const content = await chat(apiKey, model, quizPrompt(input, lesson));
    const parsed = parseJsonResponse<Pick<Quiz, 'questions'>>(content);
    return {
      unitPath: input.unitPath,
      generatedAt: new Date().toISOString(),
      model,
      provider: 'openai',
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
      provider: 'openai',
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
      provider: 'openai',
      ...parsed,
    };
  },

  chatMentor(input, lesson, messages, apiKey, model) {
    return chatMentorOpenAI(apiKey, model, mentorSystemPrompt(input, lesson), messages);
  },

  async testConnection(apiKey, model): Promise<ConnectionTestResult> {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Reply with the single word: ok' }],
          max_tokens: 5,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { ok: false, message: `OpenAI error (${res.status}): ${body.slice(0, 200)}` };
      }
      return { ok: true, message: 'Connected successfully.' };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
