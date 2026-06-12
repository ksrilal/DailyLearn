import type { MentorMessage } from '@/types/ai';
import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage';

export type FlashcardDifficulty = 'easy' | 'hard';

/** Map of `${unitPath}::${cardIndex}` -> difficulty rating. */
type FlashcardDifficultyMap = Record<string, FlashcardDifficulty>;

function flashcardKey(unitPath: string, cardIndex: number): string {
  return `${unitPath}::${cardIndex}`;
}

export function getFlashcardDifficulty(unitPath: string, cardIndex: number): FlashcardDifficulty | undefined {
  const map = readStorage<FlashcardDifficultyMap>(STORAGE_KEYS.flashcardDifficulty, {});
  return map[flashcardKey(unitPath, cardIndex)];
}

export function setFlashcardDifficulty(unitPath: string, cardIndex: number, difficulty: FlashcardDifficulty): void {
  const map = readStorage<FlashcardDifficultyMap>(STORAGE_KEYS.flashcardDifficulty, {});
  map[flashcardKey(unitPath, cardIndex)] = difficulty;
  writeStorage(STORAGE_KEYS.flashcardDifficulty, map);
}

/** Map of unitPath -> mentor conversation history. */
type MentorChatMap = Record<string, MentorMessage[]>;

export function getMentorChat(unitPath: string): MentorMessage[] {
  const map = readStorage<MentorChatMap>(STORAGE_KEYS.mentorChats, {});
  return map[unitPath] ?? [];
}

export function setMentorChat(unitPath: string, messages: MentorMessage[]): void {
  const map = readStorage<MentorChatMap>(STORAGE_KEYS.mentorChats, {});
  map[unitPath] = messages;
  writeStorage(STORAGE_KEYS.mentorChats, map);
}
