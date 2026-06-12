import { motion } from 'framer-motion';
import type { LessonFlashcard } from '@/types/lesson';
import { cn } from '@/lib/cn';

interface FlashcardViewerProps {
  card: LessonFlashcard;
  flipped: boolean;
  onFlip: () => void;
}

/** A single flippable flashcard. Click anywhere on the card to flip it. */
export function FlashcardViewer({ card, flipped, onFlip }: FlashcardViewerProps) {
  return (
    <div className="[perspective:1200px]">
      <motion.div
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onFlip();
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        className="relative h-44 w-full cursor-pointer [transform-style:preserve-3d]"
      >
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 text-center [backface-visibility:hidden]',
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Front</p>
          <p className="text-base font-medium leading-relaxed">{card.front}</p>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Back</p>
          <p className="text-base font-medium leading-relaxed">{card.back}</p>
        </div>
      </motion.div>
      <p className="mt-2 text-center text-xs text-muted-foreground">Tap card to flip</p>
    </div>
  );
}
