import { AIProviderError } from '../../src/types/ai.js';
import type { MentorMessage } from '../../src/types/ai.js';
import { SYSTEM_PROMPT } from '../../src/features/ai/prompts.js';

export type ServerProviderId = 'openai' | 'anthropic' | 'gemini';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface ChatResult {
  content: string;
  usage: TokenUsage | null;
}

async function chatOpenAI(apiKey: string, model: string, prompt: string): Promise<ChatResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
  const usage = data?.usage
    ? { inputTokens: data.usage.prompt_tokens ?? 0, outputTokens: data.usage.completion_tokens ?? 0 }
    : null;
  return { content, usage };
}

async function chatAnthropic(apiKey: string, model: string, prompt: string): Promise<ChatResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
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
  const usage = data?.usage
    ? { inputTokens: data.usage.input_tokens ?? 0, outputTokens: data.usage.output_tokens ?? 0 }
    : null;
  return { content, usage };
}

async function chatGemini(apiKey: string, model: string, prompt: string): Promise<ChatResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4096 },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new AIProviderError(`Gemini request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof content !== 'string') {
    throw new AIProviderError('Gemini response missing content');
  }
  const usage = data?.usageMetadata
    ? {
        inputTokens: data.usageMetadata.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata.candidatesTokenCount ?? 0,
      }
    : null;
  return { content, usage };
}

/** Calls the given provider's chat completion API server-side and returns the response text and token usage. */
export function chat(provider: ServerProviderId, apiKey: string, model: string, prompt: string): Promise<ChatResult> {
  switch (provider) {
    case 'openai':
      return chatOpenAI(apiKey, model, prompt);
    case 'anthropic':
      return chatAnthropic(apiKey, model, prompt);
    case 'gemini':
      return chatGemini(apiKey, model, prompt);
  }
}

async function chatMentorOpenAI(apiKey: string, model: string, systemPrompt: string, messages: MentorMessage[]): Promise<ChatResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
  const usage = data?.usage
    ? { inputTokens: data.usage.prompt_tokens ?? 0, outputTokens: data.usage.completion_tokens ?? 0 }
    : null;
  return { content, usage };
}

async function chatMentorAnthropic(apiKey: string, model: string, systemPrompt: string, messages: MentorMessage[]): Promise<ChatResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
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
  const usage = data?.usage
    ? { inputTokens: data.usage.input_tokens ?? 0, outputTokens: data.usage.output_tokens ?? 0 }
    : null;
  return { content, usage };
}

async function chatMentorGemini(apiKey: string, model: string, systemPrompt: string, messages: MentorMessage[]): Promise<ChatResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new AIProviderError(`Gemini request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof content !== 'string') {
    throw new AIProviderError('Gemini response missing content');
  }
  const usage = data?.usageMetadata
    ? {
        inputTokens: data.usageMetadata.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata.candidatesTokenCount ?? 0,
      }
    : null;
  return { content, usage };
}

/** Calls the given provider's chat API with a multi-turn conversation (used by the AI Mentor). */
export function chatMentor(
  provider: ServerProviderId,
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: MentorMessage[],
): Promise<ChatResult> {
  switch (provider) {
    case 'openai':
      return chatMentorOpenAI(apiKey, model, systemPrompt, messages);
    case 'anthropic':
      return chatMentorAnthropic(apiKey, model, systemPrompt, messages);
    case 'gemini':
      return chatMentorGemini(apiKey, model, systemPrompt, messages);
  }
}
