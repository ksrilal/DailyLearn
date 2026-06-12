import { cn } from '@/lib/cn';
import type { HeatmapDay } from '@/types/progress';

function intensityClass(count: number): string {
  if (count === 0) return 'bg-muted';
  if (count === 1) return 'bg-primary/30';
  if (count === 2) return 'bg-primary/60';
  return 'bg-primary';
}

export function LearningHeatmap({ days }: { days: HeatmapDay[] }) {
  // Group into weeks (columns), 7 rows each, starting on the day of week of the first entry.
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  days.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || idx === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} lesson${day.count === 1 ? '' : 's'}`}
              className={cn('h-3 w-3 rounded-sm', intensityClass(day.count))}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
