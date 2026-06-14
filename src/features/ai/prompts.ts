import type { Lesson } from '../../types/lesson.js';
import type { LessonInput } from '../../types/ai.js';
import type { LearningLanguage } from '../../types/settings.js';

export const SYSTEM_PROMPT = `You are a Staff Software Engineer, Technical Mentor, and Learning Designer.

Your task is to teach a single software engineering concept through an engaging micro-learning lesson.

IMPORTANT:
- Do NOT write long textbook-style paragraphs.
- Use concise explanations.
- Prioritize diagrams, code, examples, and active thinking.
- Every section should be skimmable in under 30 seconds.
- Keep the entire lesson under 5 minutes.
- Do NOT generate long essays. Keep every section under 200 words.
- Favor diagrams and code over prose.
- Always respond with valid JSON only — no markdown fences, no commentary outside the JSON object.`;

/** Every textual field in the lesson/quiz/flashcard schema is shaped
 * `{ "english": "", "sinhala": "" }`. This describes, per learning-language mode,
 * which of those two fields the model should fill in and how the Sinhala text must
 * be written. */
export function languageInstructions(mode: LearningLanguage): string {
  switch (mode) {
    case 'english':
      return `====================================================

Language Mode: English

Every text field in the JSON has the shape { "english": "", "sinhala": "" }.
- Fill "english" with the explanation in English.
- Leave "sinhala" as an empty string "" for every field.`;

    case 'sinhala_terms':
      return `====================================================

Language Mode: Sinhala + English Terms

Every text field in the JSON has the shape { "english": "", "sinhala": "" }.
- Leave "english" as an empty string "" for every field.
- Fill "sinhala" with the explanation written in Sinhala, using proper Sinhala Unicode characters.

Rules for the "sinhala" text:
- Explanations must be written in Sinhala.
- Technical terms must remain in English (e.g. Class, Object, Encapsulation, Dependency Injection).
- Programming keywords must remain in English.
- Technology, framework, and product names must remain in English.
- Never use Tanglish (romanized Sinhala such as "ekak kiyannē").
- Never translate technical terms into Sinhala words.

Correct example:
"Class එකක් කියන්නේ Object සෑදීමට භාවිතා කරන blueprint එකක්."
"Encapsulation මගින් object එකක internal state එක direct access කිරීමෙන් ආරක්ෂා කරයි."
"Dependency Injection භාවිතා කිරීමෙන් components අතර coupling එක අඩු කළ හැක."

Incorrect (Tanglish — do NOT do this):
"Class ekak kiyannē Object walata blueprint ekak."

Incorrect (translated technical terms — do NOT do this):
"පන්තියක් කියන්නේ වස්තුවක් සෑදීමට භාවිතා කරන සැලැස්මකි."`;

    case 'bilingual':
      return `====================================================

Language Mode: Bilingual

Every text field in the JSON has the shape { "english": "", "sinhala": "" }.
- Fill "english" with a clear explanation in English.
- Fill "sinhala" with the SAME explanation written in Sinhala + English Terms style.

Rules for the "sinhala" text:
- Explanations must be written in Sinhala.
- Technical terms, programming keywords, framework names, and product names must remain in English.
- Never use Tanglish (romanized Sinhala).
- Never translate technical terms into Sinhala words.
- Use proper Sinhala Unicode characters.

Correct example pair:
"english": "An object is a runtime instance of a class."
"sinhala": "Object එකක් කියන්නේ Class එකක runtime instance එකක්."

Both "english" and "sinhala" must be filled for every field — do not leave either empty.`;
  }
}

export function lessonPrompt(input: LessonInput): string {
  return `Learning Context

Module:
${input.module}

Curriculum:
${input.curriculum}

Category:
${input.category}

Topic:
${input.topic}

Learning Unit:
${input.learningUnit}

====================================================

Return ONLY valid JSON in exactly this shape:

{
  "title": "",
  "difficulty": "",
  "challengeQuestion": {
    "question": { "english": "", "sinhala": "" },
    "answer": { "english": "", "sinhala": "" }
  },
  "coreIdea": {
    "summary": { "english": "", "sinhala": "" }
  },
  "visualExplanation": {
    "type": "mermaid",
    "diagram": ""
  },
  "codeExample": {
    "language": "<plain string, e.g. \"csharp\">",
    "code": "<plain string of source code, NOT a { english, sinhala } object>",
    "explanation": { "english": "", "sinhala": "" }
  },
  "realWorldExample": {
    "example": { "english": "", "sinhala": "" }
  },
  "commonMistake": {
    "title": { "english": "", "sinhala": "" },
    "code": "<plain string of source code, NOT a { english, sinhala } object>",
    "explanation": { "english": "", "sinhala": "" }
  },
  "interviewQuestion": {
    "question": { "english": "", "sinhala": "" },
    "answer": { "english": "", "sinhala": "" }
  },
  "keyTakeaway": {
    "summary": { "english": "", "sinhala": "" }
  },
  "quiz": [
    {
      "question": { "english": "", "sinhala": "" },
      "options": [
        { "english": "", "sinhala": "" },
        { "english": "", "sinhala": "" },
        { "english": "", "sinhala": "" },
        { "english": "", "sinhala": "" }
      ],
      "correctIndex": 0,
      "explanation": { "english": "", "sinhala": "" }
    }
  ],
  "flashcards": [
    {
      "front": { "english": "", "sinhala": "" },
      "back": { "english": "", "sinhala": "" }
    }
  ],
  "sandbox": {
    "language": "<plain string, e.g. \"csharp\">",
    "code": "<plain string of source code, NOT a { english, sinhala } object>",
    "expectedOutput": "<plain string, NOT a { english, sinhala } object>"
  }
}

====================================================

IMPORTANT: The fields "codeExample.language", "codeExample.code", "commonMistake.code",
"sandbox.language", "sandbox.code", and "sandbox.expectedOutput" are PLAIN STRINGS.
Do NOT wrap them in a { "english": "", "sinhala": "" } object, even in Bilingual mode.

Rules

Title:
- Short, specific title for "${input.learningUnit}".

Difficulty:
- One of: "Beginner", "Intermediate", "Advanced".

Challenge Question:
- Ask a question before teaching.
- Force the learner to think.
- "answer" is the AI-generated explanation revealed after the learner thinks about it. Maximum 80 words.

Core Idea:
- Maximum 50 words.

Visual Explanation:
- Generate a Mermaid diagram (type "mermaid").
- Use class diagrams for OOP.
- Use sequence diagrams for distributed systems.
- Use flow charts for architecture.
- Use ER diagrams for databases.
- Pick whichever diagram type best fits "${input.learningUnit}".
- Diagram labels stay in English regardless of language mode.

Code Example:
- Use realistic production-quality code.
- Prefer C# examples.
- Keep under 20 lines.
- The code itself (and any comments inside it) stays in English regardless of language mode. Only "explanation" follows the language mode below.

Real World Example:
- Use examples from: Netflix, Amazon, Google, Uber, ASP.NET, Kubernetes, Docker, Git.

Common Mistake:
- Show incorrect code (stays in English, like Code Example).
- Explain why it is problematic.

Interview Question:
- Real senior-engineer level question, with a model answer.

Key Takeaway:
- One memorable sentence.

Quiz:
- Generate 3-5 multiple-choice questions that test understanding of "${input.learningUnit}".
- Exactly 4 options per question.
- "correctIndex" is the 0-based index of the correct option in "options".
- Include a short explanation for the correct answer.
- Omit (return an empty array) only if the concept genuinely isn't teachable through quiz questions.

Flashcards:
- Generate 3-5 front/back flashcards covering the most important facts to memorize from this lesson.
- Front: a short question or term. Back: a short answer or definition.

Sandbox:
- If "${input.learningUnit}" is a programming concept with runnable code, generate a small, self-contained code snippet (reuse or adapt the code example) plus its exact expected console output. Code and output stay in English regardless of language mode.
- If the topic is non-programming (e.g. soft skills, process, theory with no code), omit "sandbox" entirely (do not include the key).

${languageInstructions(input.learningLanguage)}

Be specific to "${input.learningUnit}", not generic. Return only JSON.`;
}

/** Picks a sensible plain-text snippet from a Localized field for use as internal
 * prompt context (the AI's own understanding of the prior lesson) — doesn't need to
 * be localized itself. */
function context(field: { english: string; sinhala: string }): string {
  return field.english || field.sinhala;
}

export function mentorSystemPrompt(input: LessonInput, lesson: Lesson): string {
  return `You are a friendly, expert AI Mentor inside a micro-learning app called DailyLearn.

The learner just completed a lesson on "${input.learningUnit}" (Module: ${input.module} / Curriculum: ${input.curriculum} / Category: ${input.category} / Topic: ${input.topic}).

Lesson context:
- Core idea: ${context(lesson.coreIdea.summary)}
- Code example (${lesson.codeExample.language}): ${lesson.codeExample.code}
- Common mistake: ${context(lesson.commonMistake.title)} — ${context(lesson.commonMistake.explanation)}
- Key takeaway: ${context(lesson.keyTakeaway.summary)}

The learner may ask follow-up questions such as "explain simpler", "give another example", "show a .NET/Java example", "show a production example", or "explain like I'm a junior developer".

Rules:
- Be concise and conversational. Prefer short paragraphs, bullet points, and code snippets over long essays.
- Stay focused on "${input.learningUnit}" and directly related concepts.
- Respond in plain text (markdown is fine for code blocks), not JSON.
- Code, programming keywords, framework names, and product names always stay in English.

${mentorLanguageInstructions(input.learningLanguage)}`;
}

function mentorLanguageInstructions(mode: LearningLanguage): string {
  switch (mode) {
    case 'english':
      return 'Language: respond in English.';
    case 'sinhala_terms':
      return `Language: respond in Sinhala using proper Sinhala Unicode characters. Keep all technical terms, programming keywords, framework names, and product names in English within the Sinhala text. Never use Tanglish (romanized Sinhala).

Example: "Dependency Injection කියන්නේ class එකක් තමන්ගේ dependencies create නොකර outside එකෙන් receive කිරීමයි."`;
    case 'bilingual':
      return `Language: respond in BOTH English and Sinhala. Structure your reply as:

**English**
<your English explanation>

**සිංහල**
<the same explanation in Sinhala + English Terms style — technical terms stay in English, proper Sinhala Unicode, never Tanglish>`;
  }
}

export function quizPrompt(input: LessonInput, lesson: Lesson): string {
  return `Based on this lesson about "${input.learningUnit}" (${input.topic} / ${input.category}):

Core idea: ${context(lesson.coreIdea.summary)}
Key takeaway: ${context(lesson.keyTakeaway.summary)}

Generate a short multiple-choice quiz with 3 questions to test understanding.

Respond with a single JSON object:
{
  "questions": [
    {
      "question": { "english": "", "sinhala": "" },
      "options": [
        { "english": "", "sinhala": "" },
        { "english": "", "sinhala": "" },
        { "english": "", "sinhala": "" },
        { "english": "", "sinhala": "" }
      ],
      "correctIndex": 0,
      "explanation": { "english": "", "sinhala": "" }
    }
  ]
}

Exactly 3 questions, exactly 4 options each, correctIndex is 0-based.

${languageInstructions(input.learningLanguage)}`;
}

export function flashcardsPrompt(input: LessonInput, lesson: Lesson): string {
  return `Based on this lesson about "${input.learningUnit}":

Core idea: ${context(lesson.coreIdea.summary)}
Key takeaway: ${context(lesson.keyTakeaway.summary)}

Generate 5 flashcards (front/back) covering the most important facts to memorize.

Respond with a single JSON object:
{
  "cards": [
    {
      "front": { "english": "", "sinhala": "" },
      "back": { "english": "", "sinhala": "" }
    }
  ]
}

Exactly 5 cards.

${languageInstructions(input.learningLanguage)}`;
}

export function summaryPrompt(input: LessonInput, lesson: Lesson): string {
  return `Summarize this lesson about "${input.learningUnit}" in 2-3 sentences for quick review:

Core idea: ${context(lesson.coreIdea.summary)}
Key takeaway: ${context(lesson.keyTakeaway.summary)}

Respond with a single JSON object:
{
  "summary": { "english": "", "sinhala": "" }
}

${languageInstructions(input.learningLanguage)}`;
}
