import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import type { Localized as LocalizedText } from '@/types/lesson';
import { Localized } from '@/components/Localized';
import { Button } from '@/components/ui/button';

interface RevealAnswerPanelProps {
  answer: LocalizedText;
  revealLabel?: string;
  hideLabel?: string;
}

/** Hides an AI-generated answer behind a "Reveal Answer" button with a smooth expand animation. */
export function RevealAnswerPanel({ answer, revealLabel = 'Reveal Answer', hideLabel = 'Hide Answer' }: RevealAnswerPanelProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-3">
      {!revealed && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Think first.</p>
      )}

      <AnimatePresence initial={false}>
        {revealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Answer</p>
              <Localized value={answer} className="text-base leading-relaxed text-foreground/90" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button variant={revealed ? 'outline' : 'default'} size="sm" className="w-full sm:w-auto" onClick={() => setRevealed((v) => !v)}>
        <Eye className="h-4 w-4" />
        {revealed ? hideLabel : revealLabel}
      </Button>
    </div>
  );
}
