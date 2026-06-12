import { HelpCircle } from 'lucide-react';
import type { ChallengeQuestion } from '@/types/lesson';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevealAnswerPanel } from '@/features/learning/RevealAnswerPanel';

export function ChallengeQuestionCard({ challenge }: { challenge: ChallengeQuestion }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="h-4 w-4 text-primary" />
          Challenge Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/90">
        <p>{challenge.question}</p>
        <RevealAnswerPanel answer={challenge.answer} />
      </CardContent>
    </Card>
  );
}
