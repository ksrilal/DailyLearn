export interface ChallengeQuestion {
  question: string;
  answer: string;
}

export interface CoreIdea {
  summary: string;
}

export interface VisualExplanation {
  type: 'mermaid';
  diagram: string;
}

export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
}

export interface RealWorldExample {
  example: string;
}

export interface CommonMistake {
  title: string;
  code: string;
  explanation: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface KeyTakeaway {
  summary: string;
}

/** A single multiple-choice question generated alongside a lesson. */
export interface LessonQuizQuestion {
  question: string;
  options: string[];
  /** Exact text of the correct option (must match one entry in `options`). */
  correctAnswer: string;
  explanation: string;
}

/** A single front/back flashcard generated alongside a lesson. */
export interface LessonFlashcard {
  front: string;
  back: string;
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
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  unitPath: string;
  questions: QuizQuestion[];
  generatedAt: string;
  model: string;
  provider: string;
}

export interface Flashcard {
  front: string;
  back: string;
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
  summary: string;
  generatedAt: string;
  model: string;
  provider: string;
}
