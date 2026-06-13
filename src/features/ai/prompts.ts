import type { Lesson } from '../../types/lesson.js';
import type { LessonInput } from '../../types/ai.js';

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
    "question": "",
    "answer": ""
  },
  "coreIdea": {
    "summary": ""
  },
  "visualExplanation": {
    "type": "mermaid",
    "diagram": ""
  },
  "codeExample": {
    "language": "",
    "code": "",
    "explanation": ""
  },
  "realWorldExample": {
    "example": ""
  },
  "commonMistake": {
    "title": "",
    "code": "",
    "explanation": ""
  },
  "interviewQuestion": {
    "question": "",
    "answer": ""
  },
  "keyTakeaway": {
    "summary": ""
  },
  "quiz": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": ""
    }
  ],
  "flashcards": [
    { "front": "", "back": "" }
  ],
  "sandbox": {
    "language": "",
    "code": "",
    "expectedOutput": ""
  }
}

====================================================

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

Code Example:
- Use realistic production-quality code.
- Prefer C# examples.
- Keep under 20 lines.

Real World Example:
- Use examples from: Netflix, Amazon, Google, Uber, ASP.NET, Kubernetes, Docker, Git.

Common Mistake:
- Show incorrect code.
- Explain why it is problematic.

Interview Question:
- Real senior-engineer level question, with a model answer.

Key Takeaway:
- One memorable sentence.

Quiz:
- Generate 3-5 multiple-choice questions that test understanding of "${input.learningUnit}".
- Exactly 4 options per question.
- "correctAnswer" must exactly match one of the strings in "options".
- Include a short explanation for the correct answer.
- Omit (return an empty array) only if the concept genuinely isn't teachable through quiz questions.

Flashcards:
- Generate 3-5 front/back flashcards covering the most important facts to memorize from this lesson.
- Front: a short question or term. Back: a short answer or definition.

Sandbox:
- If "${input.learningUnit}" is a programming concept with runnable code, generate a small, self-contained code snippet (reuse or adapt the code example) plus its exact expected console output.
- If the topic is non-programming (e.g. soft skills, process, theory with no code), omit "sandbox" entirely (do not include the key).

Be specific to "${input.learningUnit}", not generic. Return only JSON.`;
}

export function mentorSystemPrompt(input: LessonInput, lesson: Lesson): string {
  return `You are a friendly, expert AI Mentor inside a micro-learning app called DailyLearn.

The learner just completed a lesson on "${input.learningUnit}" (Module: ${input.module} / Curriculum: ${input.curriculum} / Category: ${input.category} / Topic: ${input.topic}).

Lesson context:
- Core idea: ${lesson.coreIdea.summary}
- Code example (${lesson.codeExample.language}): ${lesson.codeExample.code}
- Common mistake: ${lesson.commonMistake.title} — ${lesson.commonMistake.explanation}
- Key takeaway: ${lesson.keyTakeaway.summary}

The learner may ask follow-up questions such as "explain simpler", "give another example", "show a .NET/Java example", "show a production example", or "explain like I'm a junior developer".

Rules:
- Be concise and conversational. Prefer short paragraphs, bullet points, and code snippets over long essays.
- Stay focused on "${input.learningUnit}" and directly related concepts.
- Respond in plain text (markdown is fine for code blocks), not JSON.`;
}

export function quizPrompt(input: LessonInput, lesson: Lesson): string {
  return `Based on this lesson about "${input.learningUnit}" (${input.topic} / ${input.category}):

Core idea: ${lesson.coreIdea.summary}
Key takeaway: ${lesson.keyTakeaway.summary}

Generate a short multiple-choice quiz with 3 questions to test understanding.

Respond with a single JSON object:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}

Exactly 3 questions, exactly 4 options each, correctIndex is 0-based.`;
}

export function flashcardsPrompt(input: LessonInput, lesson: Lesson): string {
  return `Based on this lesson about "${input.learningUnit}":

Core idea: ${lesson.coreIdea.summary}
Key takeaway: ${lesson.keyTakeaway.summary}

Generate 5 flashcards (front/back) covering the most important facts to memorize.

Respond with a single JSON object:
{
  "cards": [
    { "front": "string", "back": "string" }
  ]
}

Exactly 5 cards.`;
}

export function summaryPrompt(input: LessonInput, lesson: Lesson): string {
  return `Summarize this lesson about "${input.learningUnit}" in 2-3 sentences for quick review:

Core idea: ${lesson.coreIdea.summary}
Key takeaway: ${lesson.keyTakeaway.summary}

Respond with a single JSON object:
{
  "summary": "string"
}`;
}
