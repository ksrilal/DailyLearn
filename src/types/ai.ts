import type { FlashcardSet, Lesson, Quiz, Summary } from './lesson.js';
import type { LearningLanguage } from './settings.js';

export interface LessonInput {
  module: string;
  curriculum: string;
  category: string;
  topic: string;
  learningUnit: string;
  unitPath: string;
  learningLanguage: LearningLanguage;
}

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
}

export interface MentorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  id: string;
  generateLesson(input: LessonInput, apiKey: string, model: string): Promise<Lesson>;
  generateQuiz(input: LessonInput, lesson: Lesson, apiKey: string, model: string): Promise<Quiz>;
  generateFlashcards(input: LessonInput, lesson: Lesson, apiKey: string, model: string): Promise<FlashcardSet>;
  generateSummary(input: LessonInput, lesson: Lesson, apiKey: string, model: string): Promise<Summary>;
  testConnection(apiKey: string, model: string): Promise<ConnectionTestResult>;
  /** Follow-up Q&A about the current lesson, with the lesson as context. */
  chatMentor(input: LessonInput, lesson: Lesson, messages: MentorMessage[], apiKey: string, model: string): Promise<string>;
}

export class AIProviderError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'AIProviderError';
  }
}
