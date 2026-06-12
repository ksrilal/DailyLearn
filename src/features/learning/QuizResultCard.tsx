import { RotateCcw, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuizResultCardProps {
  correctCount: number;
  total: number;
  onRetry: () => void;
}

export function QuizResultCard({ correctCount, total, onRetry }: QuizResultCardProps) {
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Quiz Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-2xl font-bold tracking-tight">
          {correctCount}/{total} Correct
        </p>
        <p className="text-muted-foreground">{percentage}% — {percentage >= 80 ? 'Great work!' : percentage >= 50 ? 'Good effort, keep practicing.' : 'Review the lesson and try again.'}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
