import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Frown, Layers, Smile } from 'lucide-react';
import type { LessonFlashcard } from '@/types/lesson';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { FlashcardViewer } from '@/features/learning/FlashcardViewer';
import {
  getFlashcardDifficulty,
  setFlashcardDifficulty,
  type FlashcardDifficulty,
} from '@/features/learning/interactionStorage';

interface FlashcardCarouselProps {
  unitPath: string;
  cards: LessonFlashcard[];
}

export function FlashcardCarousel({ unitPath, cards }: FlashcardCarouselProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty | undefined>(() =>
    getFlashcardDifficulty(unitPath, 0),
  );

  useEffect(() => {
    setDifficulty(getFlashcardDifficulty(unitPath, index));
    setFlipped(false);
  }, [unitPath, index]);

  function goTo(nextIndex: number) {
    setIndex(((nextIndex % cards.length) + cards.length) % cards.length);
  }

  function rate(value: FlashcardDifficulty) {
    setFlashcardDifficulty(unitPath, index, value);
    setDifficulty(value);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Flashcards
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {index + 1} / {cards.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FlashcardViewer card={cards[index]} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => goTo(index - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => goTo(index + 1)}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant={difficulty === 'hard' ? 'default' : 'outline'}
            size="sm"
            className={cn(difficulty === 'hard' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
            onClick={() => rate('hard')}
          >
            <Frown className="h-4 w-4" />
            Hard
          </Button>
          <Button
            variant={difficulty === 'easy' ? 'default' : 'outline'}
            size="sm"
            className={cn(difficulty === 'easy' && 'bg-success text-success-foreground hover:bg-success/90')}
            onClick={() => rate('easy')}
          >
            <Smile className="h-4 w-4" />
            Easy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
