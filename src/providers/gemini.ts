import type { AIProvider, ConnectionTestResult, MentorMessage } from '@/types/ai';
import { AIProviderError } from '@/types/ai';
import type { FlashcardSet, Lesson, Quiz, Summary } from '@/types/lesson';
import { SYSTEM_PROMPT, flashcardsPrompt, lessonPrompt, mentorSystemPrompt, quizPrompt, summaryPrompt } from '@/features/ai/prompts';
import { normalizeLesson, parseJsonResponse } from '@/features/ai/parse';

function endpointFor(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

async function chat(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch(endpointFor(model, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AIProviderError(`Gemini request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof content !== 'string') {
    throw new AIProviderError('Gemini response missing content');
  }
  return content;
}

async function chatMentorGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: MentorMessage[],
): Promise<string> {
  const res = await fetch(endpointFor(model, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AIProviderError(`Gemini request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof content !== 'string') {
    throw new AIProviderError('Gemini response missing content');
  }
  return content;
}

export const geminiProvider: AIProvider = {
  id: 'gemini',

  async generateLesson(input, apiKey, model) {
    const content = await chat(apiKey, model, lessonPrompt(input));
    const parsed = parseJsonResponse<Omit<Lesson, 'unitPath' | 'title' | 'generatedAt' | 'model' | 'provider'>>(content);
    return normalizeLesson({
      unitPath: input.unitPath,
      title: input.learningUnit,
      generatedAt: new Date().toISOString(),
      model,
      provider: 'gemini',
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
      provider: 'gemini',
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
      provider: 'gemini',
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
      provider: 'gemini',
      ...parsed,
    };
  },

  chatMentor(input, lesson, messages, apiKey, model) {
    return chatMentorGemini(apiKey, model, mentorSystemPrompt(input, lesson), messages);
  },

  async testConnection(apiKey, model): Promise<ConnectionTestResult> {
    try {
      const res = await fetch(endpointFor(model, apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Reply with the single word: ok' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { ok: false, message: `Gemini error (${res.status}): ${body.slice(0, 200)}` };
      }
      return { ok: true, message: 'Connected successfully.' };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
