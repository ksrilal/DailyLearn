/** A piece of AI-generated text in both English and Sinhala. Either field may be
 * empty depending on the learner's selected language mode (English-only mode leaves
 * `sinhala` empty, Sinhala+Terms mode leaves `english` empty, Bilingual fills both). */
export interface Localized {
  english: string;
  sinhala: string;
}

export interface ChallengeQuestion {
  question: Localized;
  answer: Localized;
}

export interface CoreIdea {
  summary: Localized;
}

export interface VisualExplanation {
  type: 'mermaid';
  diagram: string;
}

export interface CodeExample {
  language: string;
  code: string;
  explanation: Localized;
}

export interface RealWorldExample {
  example: Localized;
}

export interface CommonMistake {
  title: Localized;
  code: string;
  explanation: Localized;
}

export interface InterviewQuestion {
  question: Localized;
  answer: Localized;
}

export interface KeyTakeaway {
  summary: Localized;
}

/** A single multiple-choice question generated alongside a lesson. */
export interface LessonQuizQuestion {
  question: Localized;
  options: Localized[];
  /** 0-based index into `options` of the correct choice. */
  correctIndex: number;
  explanation: Localized;
}

/** A single front/back flashcard generated alongside a lesson. */
export interface LessonFlashcard {
  front: Localized;
  back: Localized;
}

/** A non-executable, "predict the output" code sandbox for programming lessons. */
export interface LessonSandbox {
  language: string;
  code: string;
  expectedOutput: string;
}

export interface Lesson {
  unitPath: string;
  title: string;
  difficulty: string;
  challengeQuestion: ChallengeQuestion;
  coreIdea: CoreIdea;
  visualExplanation: VisualExplanation;
  codeExample: CodeExample;
  realWorldExample: RealWorldExample;
  commonMistake: CommonMistake;
  interviewQuestion: InterviewQuestion;
  keyTakeaway: KeyTakeaway;
  /** Optional 3-5 question recall quiz, generated when the concept is teachable. */
  quiz?: LessonQuizQuestion[];
  /** Optional memorization flashcards. */
  flashcards?: LessonFlashcard[];
  /** Optional "predict the output" sandbox, omitted for non-programming topics. */
  sandbox?: LessonSandbox;
  generatedAt: string;
  model: string;
  provider: string;
}

export interface QuizQuestion {
  question: Localized;
  options: Localized[];
  correctIndex: number;
  explanation: Localized;
}

export interface Quiz {
  unitPath: string;
  questions: QuizQuestion[];
  generatedAt: string;
  model: string;
  provider: string;
}

export interface Flashcard {
  front: Localized;
  back: Localized;
}

export interface FlashcardSet {
  unitPath: string;
  cards: Flashcard[];
  generatedAt: string;
  model: string;
  provider: string;
}

export interface Summary {
  unitPath: string;
  summary: Localized;
  generatedAt: string;
  model: string;
  provider: string;
}
