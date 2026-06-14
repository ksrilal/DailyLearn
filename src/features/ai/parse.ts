import { AIProviderError } from '../../types/ai.js';
import type { Lesson } from '../../types/lesson.js';

/** Extracts and parses a JSON object from an LLM response, tolerating markdown fences. */
export function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim();

  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new AIProviderError('Failed to parse AI response as JSON', err);
  }
}

/** Coerces a value that should be a plain string but may have been returned by the
 * model as a `{ english, sinhala }` object (mimicking the surrounding Localized
 * fields) back into a string. */
function coerceToString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const english = typeof obj.english === 'string' ? obj.english : '';
    const sinhala = typeof obj.sinhala === 'string' ? obj.sinhala : '';
    return english || sinhala;
  }
  return '';
}

/** Guards against the model returning `{ english, sinhala }` objects for the
 * lesson's plain-string fields (`codeExample`/`commonMistake`/`sandbox` code and
 * language fields), which would otherwise crash rendering with React error #31. */
export function normalizeLesson<T extends Partial<Lesson>>(lesson: T): T {
  if (lesson.codeExample) {
    lesson.codeExample = {
      ...lesson.codeExample,
      language: coerceToString(lesson.codeExample.language),
      code: coerceToString(lesson.codeExample.code),
    };
  }
  if (lesson.commonMistake) {
    lesson.commonMistake = {
      ...lesson.commonMistake,
      code: coerceToString(lesson.commonMistake.code),
    };
  }
  if (lesson.sandbox) {
    lesson.sandbox = {
      ...lesson.sandbox,
      language: coerceToString(lesson.sandbox.language),
      code: coerceToString(lesson.sandbox.code),
      expectedOutput: coerceToString(lesson.sandbox.expectedOutput),
    };
  }
  return lesson;
}
