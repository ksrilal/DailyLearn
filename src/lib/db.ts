import type { FlashcardSet, Lesson, Quiz, Summary } from '@/types/lesson';

const DB_NAME = 'dailylearn';
// Bumped to 4: lesson/quiz/flashcard/summary text fields changed from plain strings
// to { english, sinhala } pairs for the bilingual learning system, so old cached
// content (and its unitPath-only keys, now unitPath::learningLanguage) is discarded.
const DB_VERSION = 4;

export const STORES = {
  lessons: 'lessons',
  quizzes: 'quizzes',
  flashcards: 'flashcards',
  summaries: 'summaries',
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // v1 -> v2, v2 -> v3, v3 -> v4: Lesson schema changed, so all cached content
      // (which may reference the old shape) must be discarded and regenerated. v4
      // also switches the keyPath from "unitPath" to "cacheKey" (unitPath::language).
      if (event.oldVersion < 4) {
        for (const store of Object.values(STORES)) {
          if (db.objectStoreNames.contains(store)) {
            db.deleteObjectStore(store);
          }
        }
      }

      for (const store of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'cacheKey' });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function getItem<T>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function putItem<T>(store: StoreName, cacheKey: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put({ ...value, cacheKey });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllKeys(store: StoreName): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAllKeys();
    req.onsuccess = () => resolve(req.result as string[]);
    req.onerror = () => reject(req.error);
  });
}

async function getAllItems<T>(store: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function deleteItem(store: StoreName, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearStore(store: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Cached lesson content is per (unit, learning language) — switching the learning
 * language must not surface a lesson generated for a different language. */
function cacheKey(unitPath: string, learningLanguage: string): string {
  return `${unitPath}::${learningLanguage}`;
}

export const lessonCache = {
  get: (unitPath: string, learningLanguage: string) => getItem<Lesson>(STORES.lessons, cacheKey(unitPath, learningLanguage)),
  put: (lesson: Lesson, learningLanguage: string) => putItem(STORES.lessons, cacheKey(lesson.unitPath, learningLanguage), lesson),
  delete: (unitPath: string, learningLanguage: string) => deleteItem(STORES.lessons, cacheKey(unitPath, learningLanguage)),
  allKeys: () => getAllKeys(STORES.lessons),
  all: () => getAllItems<Lesson>(STORES.lessons),
  clear: () => clearStore(STORES.lessons),
};

export const quizCache = {
  get: (unitPath: string, learningLanguage: string) => getItem<Quiz>(STORES.quizzes, cacheKey(unitPath, learningLanguage)),
  put: (quiz: Quiz, learningLanguage: string) => putItem(STORES.quizzes, cacheKey(quiz.unitPath, learningLanguage), quiz),
  delete: (unitPath: string, learningLanguage: string) => deleteItem(STORES.quizzes, cacheKey(unitPath, learningLanguage)),
  allKeys: () => getAllKeys(STORES.quizzes),
  clear: () => clearStore(STORES.quizzes),
};

export const flashcardCache = {
  get: (unitPath: string, learningLanguage: string) => getItem<FlashcardSet>(STORES.flashcards, cacheKey(unitPath, learningLanguage)),
  put: (set: FlashcardSet, learningLanguage: string) => putItem(STORES.flashcards, cacheKey(set.unitPath, learningLanguage), set),
  delete: (unitPath: string, learningLanguage: string) => deleteItem(STORES.flashcards, cacheKey(unitPath, learningLanguage)),
  allKeys: () => getAllKeys(STORES.flashcards),
  clear: () => clearStore(STORES.flashcards),
};

export const summaryCache = {
  get: (unitPath: string, learningLanguage: string) => getItem<Summary>(STORES.summaries, cacheKey(unitPath, learningLanguage)),
  put: (summary: Summary, learningLanguage: string) => putItem(STORES.summaries, cacheKey(summary.unitPath, learningLanguage), summary),
  delete: (unitPath: string, learningLanguage: string) => deleteItem(STORES.summaries, cacheKey(unitPath, learningLanguage)),
  allKeys: () => getAllKeys(STORES.summaries),
  clear: () => clearStore(STORES.summaries),
};

export async function clearAllCaches(): Promise<void> {
  await Promise.all([
    clearStore(STORES.lessons),
    clearStore(STORES.quizzes),
    clearStore(STORES.flashcards),
    clearStore(STORES.summaries),
  ]);
}
