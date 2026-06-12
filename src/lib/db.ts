import type { FlashcardSet, Lesson, Quiz, Summary } from '@/types/lesson';

const DB_NAME = 'dailylearn';
// Bumped to 3: the Lesson schema gained challengeQuestion.answer, quiz,
// flashcards, and sandbox fields, so old cached lessons must be discarded.
const DB_VERSION = 3;

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
      for (const store of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'unitPath' });
        }
      }

      // v1 -> v2 and v2 -> v3: Lesson schema changed, so all cached content
      // (which may reference the old shape) must be discarded and regenerated.
      if (event.oldVersion < 3) {
        const tx = request.transaction;
        if (tx) {
          for (const store of Object.values(STORES)) {
            tx.objectStore(store).clear();
          }
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

async function putItem<T extends { unitPath: string }>(store: StoreName, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
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

export const lessonCache = {
  get: (unitPath: string) => getItem<Lesson>(STORES.lessons, unitPath),
  put: (lesson: Lesson) => putItem(STORES.lessons, lesson),
  delete: (unitPath: string) => deleteItem(STORES.lessons, unitPath),
  allKeys: () => getAllKeys(STORES.lessons),
  all: () => getAllItems<Lesson>(STORES.lessons),
  clear: () => clearStore(STORES.lessons),
};

export const quizCache = {
  get: (unitPath: string) => getItem<Quiz>(STORES.quizzes, unitPath),
  put: (quiz: Quiz) => putItem(STORES.quizzes, quiz),
  delete: (unitPath: string) => deleteItem(STORES.quizzes, unitPath),
  allKeys: () => getAllKeys(STORES.quizzes),
  clear: () => clearStore(STORES.quizzes),
};

export const flashcardCache = {
  get: (unitPath: string) => getItem<FlashcardSet>(STORES.flashcards, unitPath),
  put: (set: FlashcardSet) => putItem(STORES.flashcards, set),
  delete: (unitPath: string) => deleteItem(STORES.flashcards, unitPath),
  allKeys: () => getAllKeys(STORES.flashcards),
  clear: () => clearStore(STORES.flashcards),
};

export const summaryCache = {
  get: (unitPath: string) => getItem<Summary>(STORES.summaries, unitPath),
  put: (summary: Summary) => putItem(STORES.summaries, summary),
  delete: (unitPath: string) => deleteItem(STORES.summaries, unitPath),
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
