import { useState } from 'react';
import { CheckCircle2, ListChecks, XCircle } from 'lucide-react';
import type { LessonQuizQuestion } from '@/types/lesson';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { QuizResultCard } from '@/features/learning/QuizResultCard';

export function QuizCard({ questions }: { questions: LessonQuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[index];

  function reset() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setDone(false);
  }

  function selectOption(option: string) {
    if (selected) return;
    setSelected(option);
    if (option === question.correctAnswer) {
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
        <p className="font-medium leading-relaxed">{question.question}</p>

        <div className="space-y-2">
          {question.options.map((option) => {
            const isCorrect = option === question.correctAnswer;
            const isSelected = option === selected;
            const showFeedback = selected !== null;

            return (
              <button
                key={option}
                onClick={() => selectOption(option)}
                disabled={showFeedback}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors',
                  !showFeedback && 'hover:bg-accent',
                  showFeedback && isCorrect && 'border-success bg-success/10',
                  showFeedback && isSelected && !isCorrect && 'border-destructive bg-destructive/10',
                  showFeedback && !isSelected && !isCorrect && 'opacity-60',
                )}
              >
                <span>{option}</span>
                {showFeedback && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
                {showFeedback && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="mb-1 font-semibold">{selected === question.correctAnswer ? 'Correct!' : 'Not quite.'}</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}

        {selected && (
          <Button size="sm" onClick={next}>
            {index + 1 >= questions.length ? 'See Results' : 'Next Question'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
