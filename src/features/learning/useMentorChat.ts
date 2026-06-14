import { useEffect, useState } from 'react';
import type { LessonInput, MentorMessage } from '@/types/ai';
import { AIProviderError } from '@/types/ai';
import type { Lesson } from '@/types/lesson';
import { getProvider, getSystemProvider } from '@/providers/factory';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { getMentorChat, setMentorChat } from '@/features/learning/interactionStorage';

export function useMentorChat(input: LessonInput, lesson: Lesson) {
  const [messages, setMessages] = useState<MentorMessage[]>(() => getMentorChat(input.unitPath));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages(getMentorChat(input.unitPath));
  }, [input.unitPath]);

  async function send(content: string) {
    const trimmed = content.trim();
    if (!trimmed || pending) return;

    const next = [...messages, { role: 'user', content: trimmed } as MentorMessage];
    setMessages(next);
    setMentorChat(input.unitPath, next);
    setPending(true);
    setError(null);

    try {
      const settings = useSettingsStore.getState();
      let reply: string;
      if (!settings.useSystemKey[settings.provider]) {
        const apiKey = settings.apiKeys[settings.provider];
        if (!apiKey) {
          throw new AIProviderError(
            `No API key configured for ${settings.provider}. Add one in Settings to use the AI Mentor.`,
          );
        }
        const model = settings.models[settings.provider];
        reply = await getProvider(settings.provider).chatMentor(input, lesson, next, apiKey, model);
      } else {
        reply = await getSystemProvider().chatMentor(input, lesson, next, '', '');
        void useAuthStore.getState().refreshProfile();
      }

      const withReply = [...next, { role: 'assistant', content: reply } as MentorMessage];
      setMessages(withReply);
      setMentorChat(input.unitPath, withReply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return { messages, send, pending, error };
}
