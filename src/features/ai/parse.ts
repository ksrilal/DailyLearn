import { AIProviderError } from '../../types/ai';

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
