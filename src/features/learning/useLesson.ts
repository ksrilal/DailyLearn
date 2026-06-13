import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { LearningUnit } from '@/types/curriculum';
import type { LessonInput } from '@/types/ai';
import type { Lesson } from '@/types/lesson';
import { lessonCache } from '@/lib/db';
import { getProvider, getSystemProvider } from '@/providers/factory';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCurriculumStore } from '@/stores/curriculumStore';
import { useAuthStore } from '@/stores/authStore';
import { AIProviderError } from '@/types/ai';

export function toLessonInput(unit: LearningUnit): LessonInput {
  const curriculumStore = useCurriculumStore.getState();
  const curriculum = curriculumStore.curricula.find((c) => c.id === unit.curriculumId && c.moduleId === unit.moduleId);
  const category = curriculum?.categories.find((c) => c.id === unit.categoryId);
  const topic = category?.topics.find((t) => t.id === unit.topicId);

  return {
    module: unit.moduleId,
    curriculum: curriculum?.title ?? unit.curriculumId,
    category: category?.title ?? unit.categoryId,
    topic: topic?.title ?? unit.topicId,
    learningUnit: unit.title,
    unitPath: unit.path,
  };
}

async function fetchOrGenerateLesson(unit: LearningUnit): Promise<Lesson> {
  const cached = await lessonCache.get(unit.path);
  if (cached) return cached;

  const settings = useSettingsStore.getState();
  const input = toLessonInput(unit);

  if (!settings.useSystemKey[settings.provider]) {
    const apiKey = settings.apiKeys[settings.provider];
    if (!apiKey) {
      throw new AIProviderError(
        `No API key configured for ${settings.provider}. Add one in Settings to generate this lesson.`,
      );
    }
    const provider = getProvider(settings.provider);
    const model = settings.models[settings.provider];
    const lesson = await provider.generateLesson(input, apiKey, model);
    await lessonCache.put(lesson);
    return lesson;
  }

  const lesson = await getSystemProvider().generateLesson(input, '', '');
  await lessonCache.put(lesson);
  void useAuthStore.getState().refreshProfile();
  return lesson;
}

export function useLesson(unit: LearningUnit | null | undefined) {
  return useQuery({
    queryKey: ['lesson', unit?.path],
    queryFn: () => fetchOrGenerateLesson(unit!),
    enabled: !!unit,
    retry: false,
  });
}

export function useInvalidateLesson() {
  const queryClient = useQueryClient();
  return (unitPath: string) => queryClient.invalidateQueries({ queryKey: ['lesson', unitPath] });
}
