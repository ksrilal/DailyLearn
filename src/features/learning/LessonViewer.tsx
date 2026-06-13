import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Briefcase,
  Code2,
  Lightbulb,
  MessageCircleQuestion,
  Sparkles,
  Workflow,
} from 'lucide-react';
import type { Lesson } from '@/types/lesson';
import type { LessonInput } from '@/types/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { ChallengeQuestionCard } from '@/features/learning/ChallengeQuestionCard';
import { QuizCard } from '@/features/learning/QuizCard';
import { FlashcardCarousel } from '@/features/learning/FlashcardCarousel';
import { CodeSandboxCard } from '@/features/learning/CodeSandboxCard';
import { MentorChatDrawer } from '@/features/learning/MentorChatDrawer';

function Section({
  title,
  icon: Icon,
  delay,
  highlight,
  children,
}: {
  title: string;
  icon: LucideIcon;
  delay: number;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={highlight ? 'border-primary/40 bg-primary/5' : undefined}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-base leading-relaxed text-foreground/90">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
      <code className={language ? `language-${language}` : undefined}>{code}</code>
    </pre>
  );
}

interface LessonViewerProps {
  lesson: Lesson;
  lessonInput: LessonInput;
}

export function LessonViewer({ lesson, lessonInput }: LessonViewerProps) {
  const [mentorOpen, setMentorOpen] = useState(false);

  return (
    <div className="relative space-y-4 pb-16">
      <div className="flex flex-wrap items-center gap-2">
        {lesson.difficulty && <Badge>{lesson.difficulty}</Badge>}
        <Badge variant="secondary">{lesson.provider}</Badge>
        <Badge variant="outline">{lesson.model}</Badge>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <ChallengeQuestionCard challenge={lesson.challengeQuestion} />
      </motion.div>

      <Section title="Core Idea" icon={Lightbulb} delay={0.05}>
        {lesson.coreIdea.summary}
      </Section>

      <Section title="Visual Explanation" icon={Workflow} delay={0.1}>
        <MermaidDiagram chart={lesson.visualExplanation.diagram} />
      </Section>

      <Section title="Code Example" icon={Code2} delay={0.15}>
        <div className="space-y-2">
          <CodeBlock code={lesson.codeExample.code} language={lesson.codeExample.language} />
          <p>{lesson.codeExample.explanation}</p>
        </div>
      </Section>

      {lesson.sandbox && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.3 }}>
          <CodeSandboxCard sandbox={lesson.sandbox} />
        </motion.div>
      )}

      <Section title="Real World Example" icon={Briefcase} delay={0.2}>
        {lesson.realWorldExample.example}
      </Section>

      <Section title="Common Mistake" icon={AlertTriangle} delay={0.25}>
        <div className="space-y-2">
          <p className="font-medium">{lesson.commonMistake.title}</p>
          <CodeBlock code={lesson.commonMistake.code} />
          <p>{lesson.commonMistake.explanation}</p>
        </div>
      </Section>

      <Section title="Interview Question" icon={MessageCircleQuestion} delay={0.3}>
        <div className="space-y-2">
          <p className="font-medium">{lesson.interviewQuestion.question}</p>
          <p>{lesson.interviewQuestion.answer}</p>
        </div>
      </Section>

      <Section title="Key Takeaway" icon={Sparkles} delay={0.35} highlight>
        {lesson.keyTakeaway.summary}
      </Section>

      {lesson.quiz && lesson.quiz.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }}>
          <QuizCard questions={lesson.quiz} />
        </motion.div>
      )}

      {lesson.flashcards && lesson.flashcards.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.3 }}>
          <FlashcardCarousel unitPath={lesson.unitPath} cards={lesson.flashcards} />
        </motion.div>
      )}

      <Button
        size="lg"
        onClick={() => setMentorOpen(true)}
        className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg sm:bottom-6 sm:right-6"
      >
        <Sparkles className="h-4 w-4" />
        Ask Mentor
      </Button>

      <MentorChatDrawer open={mentorOpen} onOpenChange={setMentorOpen} input={lessonInput} lesson={lesson} />
    </div>
  );
}
