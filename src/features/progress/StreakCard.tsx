import { Flame, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useProgressStore } from '@/stores/progressStore';

export function StreakCard() {
  const streak = useProgressStore((s) => s.streak);

  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 pt-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <Flame className="h-7 w-7 text-orange-500" />
          <span className="text-2xl font-bold">{streak.current}</span>
          <span className="text-xs text-muted-foreground">Current Streak</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <Trophy className="h-7 w-7 text-amber-500" />
          <span className="text-2xl font-bold">{streak.longest}</span>
          <span className="text-xs text-muted-foreground">Longest Streak</span>
        </div>
      </CardContent>
    </Card>
  );
}
