import { chat, chatMentor } from './chat';
import { getAvailableProviders, getSystemProviderConfig } from './config';
import { parseJsonResponse } from '../../src/features/ai/parse';
import { flashcardsPrompt, lessonPrompt, mentorSystemPrompt, quizPrompt, summaryPrompt } from '../../src/features/ai/prompts';
import type { LessonInput, MentorMessage } from '../../src/types/ai';
import { AIProviderError } from '../../src/types/ai';
import type { FlashcardSet, Lesson, Quiz, Summary } from '../../src/types/lesson';

export interface GenerateBody {
  kind: 'lesson' | 'quiz' | 'flashcards' | 'summary' | 'test' | 'mentor';
  provider?: string;
  input?: LessonInput;
  lesson?: Lesson;
  messages?: MentorMessage[];
}

export interface AiResponse {
  status: number;
  body: unknown;
}

/** Framework-agnostic handler for the AI proxy endpoint, shared between the
 * Vercel serverless function and the local Vite dev-server middleware. */
export async function handleAiRequest(method: string, body: GenerateBody | undefined): Promise<AiResponse> {
  if (method === 'GET') {
    const providers = getAvailableProviders();
    const defaultConfig = getSystemProviderConfig();
    return {
      status: 200,
      body: {
        available: providers.length > 0,
        providers,
        defaultProvider: defaultConfig?.provider,
        defaultModel: defaultConfig?.model,
      },
    };
  }

  if (method !== 'POST') {
    return { status: 405, body: { error: 'Method not allowed' } };
  }

  const data = body ?? ({} as GenerateBody);
  const config = getSystemProviderConfig(data.provider);

  if (!config) {
    return { status: 503, body: { error: 'No system AI provider is configured on this server.' } };
  }

  try {
    switch (data.kind) {
      case 'test': {
        const content = await chat(config.provider, config.apiKey, config.model, 'Reply with the single word: ok');
        return { status: 200, body: { ok: true, message: 'Connected successfully.', content } };
      }
      case 'lesson': {
        if (!data.input) throw new AIProviderError('Missing input');
        const content = await chat(config.provider, config.apiKey, config.model, lessonPrompt(data.input));
        const parsed = parseJsonResponse<Omit<Lesson, 'unitPath' | 'title' | 'generatedAt' | 'model' | 'provider'>>(
          content,
        );
        const lesson: Lesson = {
          unitPath: data.input.unitPath,
          title: data.input.learningUnit,
          generatedAt: new Date().toISOString(),
          model: config.model,
          provider: config.provider,
          ...parsed,
        };
        return { status: 200, body: lesson };
      }
      case 'quiz': {
        if (!data.input || !data.lesson) throw new AIProviderError('Missing input or lesson');
        const content = await chat(config.provider, config.apiKey, config.model, quizPrompt(data.input, data.lesson));
        const parsed = parseJsonResponse<Pick<Quiz, 'questions'>>(content);
        const quiz: Quiz = {
          unitPath: data.input.unitPath,
          generatedAt: new Date().toISOString(),
          model: config.model,
          provider: config.provider,
          ...parsed,
        };
        return { status: 200, body: quiz };
      }
      case 'flashcards': {
        if (!data.input || !data.lesson) throw new AIProviderError('Missing input or lesson');
        const content = await chat(
          config.provider,
          config.apiKey,
          config.model,
          flashcardsPrompt(data.input, data.lesson),
        );
        const parsed = parseJsonResponse<Pick<FlashcardSet, 'cards'>>(content);
        const set: FlashcardSet = {
          unitPath: data.input.unitPath,
          generatedAt: new Date().toISOString(),
          model: config.model,
          provider: config.provider,
          ...parsed,
        };
        return { status: 200, body: set };
      }
      case 'summary': {
        if (!data.input || !data.lesson) throw new AIProviderError('Missing input or lesson');
        const content = await chat(
          config.provider,
          config.apiKey,
          config.model,
          summaryPrompt(data.input, data.lesson),
        );
        const parsed = parseJsonResponse<Pick<Summary, 'summary'>>(content);
        const summary: Summary = {
          unitPath: data.input.unitPath,
          generatedAt: new Date().toISOString(),
          model: config.model,
          provider: config.provider,
          ...parsed,
        };
        return { status: 200, body: summary };
      }
      case 'mentor': {
        if (!data.input || !data.lesson || !data.messages) {
          throw new AIProviderError('Missing input, lesson, or messages');
        }
        const reply = await chatMentor(
          config.provider,
          config.apiKey,
          config.model,
          mentorSystemPrompt(data.input, data.lesson),
          data.messages,
        );
        return { status: 200, body: { reply } };
      }
      default:
        return { status: 400, body: { error: 'Invalid kind' } };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { status: 502, body: { error: message } };
  }
}
