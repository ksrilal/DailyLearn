import { useState } from 'react';
import { CheckCircle2, ListChecks, XCircle } from 'lucide-react';
import type { LessonQuizQuestion } from '@/types/lesson';
import { Localized } from '@/components/Localized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { QuizResultCard } from '@/features/learning/QuizResultCard';

export function QuizCard({ questions }: { questions: LessonQuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[index];

  function reset() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setDone(false);
  }

  function selectOption(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  if (done) {
    return <QuizResultCard correctCount={correctCount} total={questions.length} onRetry={reset} />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            Quick Quiz
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {index + 1} / {questions.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Localized value={question.question} className="font-medium leading-relaxed" />

        <div className="space-y-2">
          {question.options.map((option, optionIndex) => {
            const isCorrect = optionIndex === question.correctIndex;
            const isSelected = optionIndex === selected;
            const showFeedback = selected !== null;

            return (
              <button
                key={optionIndex}
                onClick={() => selectOption(optionIndex)}
                disabled={showFeedback}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors',
                  !showFeedback && 'hover:bg-accent',
                  showFeedback && isCorrect && 'border-success bg-success/10',
                  showFeedback && isSelected && !isCorrect && 'border-destructive bg-destructive/10',
                  showFeedback && !isSelected && !isCorrect && 'opacity-60',
                )}
              >
                <Localized value={option} />
                {showFeedback && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
                {showFeedback && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="mb-1 font-semibold">{selected === question.correctIndex ? 'Correct!' : 'Not quite.'}</p>
            <Localized value={question.explanation} className="text-muted-foreground" />
          </div>
        )}

        {selected !== null && (
          <Button size="sm" onClick={next}>
            {index + 1 >= questions.length ? 'See Results' : 'Next Question'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
