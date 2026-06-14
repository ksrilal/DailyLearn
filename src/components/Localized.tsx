import type { Localized as LocalizedText } from '@/types/lesson';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/cn';

interface LocalizedProps {
  value: LocalizedText;
  className?: string;
}

/** Renders a `{ english, sinhala }` text field according to the learner's selected
 * learning language. Bilingual mode stacks both (English then Sinhala), skipping
 * whichever is empty. */
export function Localized({ value, className }: LocalizedProps) {
  const mode = useSettingsStore((s) => s.learningLanguage);

  if (mode === 'sinhala_terms') {
    return <p className={className}>{value.sinhala || value.english}</p>;
  }

  if (mode === 'bilingual') {
    return (
      <div className="space-y-2">
        {value.english && <p className={className}>{value.english}</p>}
        {value.sinhala && <p className={cn(className, value.english && 'text-muted-foreground')}>{value.sinhala}</p>}
      </div>
    );
  }

  return <p className={className}>{value.english || value.sinhala}</p>;
}
