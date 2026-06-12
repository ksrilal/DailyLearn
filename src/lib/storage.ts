/** Typed localStorage helpers, namespaced under `dailylearn:`. */

const PREFIX = 'dailylearn:';

export const STORAGE_KEYS = {
  settings: `${PREFIX}settings`,
  progress: `${PREFIX}progress`,
  learning: `${PREFIX}learning`,
  flashcardDifficulty: `${PREFIX}flashcard-difficulty`,
  mentorChats: `${PREFIX}mentor-chats`,
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode, quota exceeded) — fail silently.
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
