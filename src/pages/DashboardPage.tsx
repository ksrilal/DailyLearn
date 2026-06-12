import { useNavigate } from 'react-router-dom';
import { CalendarCheck, CalendarDays, CalendarRange, Shuffle, Trophy } from 'lucide-react';
import { LearningCard } from '@/features/learning/LearningCard';
import { StreakCard } from '@/features/progress/StreakCard';
import { ProgressCard } from '@/features/progress/ProgressCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/PageLoader';
import { useCurriculumStore } from '@/stores/curriculumStore';
import { useProgressStore } from '@/stores/progressStore';
import { useLearningStore } from '@/stores/learningStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const loaded = useCurriculumStore((s) => s.loaded);
  const allUnits = useCurriculumStore((s) => s.allUnits);
  const curricula = useCurriculumStore((s) => s.curricula);

  const counts = useProgressStore((s) => s.getCounts());
  const curriculumProgress = useProgressStore((s) => s.getCurriculumProgress(curricula));

  const pickDailyUnit = useLearningStore((s) => s.pickDailyUnit);
  const pickRandomUnit = useLearningStore((s) => s.pickRandomUnit);
  const setActiveUnit = useLearningStore((s) => s.setActiveUnit);

  if (!loaded) return <PageLoader />;

  const dailyUnit = pickDailyUnit(allUnits);

  function startDaily() {
    if (!dailyUnit) return;
    setActiveUnit(dailyUnit.path, 'daily');
    navigate('/learn');
  }

  function surpriseMe() {
    const unit = pickRandomUnit(allUnits);
    if (!unit) return;
    setActiveUnit(unit.path, 'random');
    navigate('/learn');
  }

  const topCurricula = [...curriculumProgress].sort((a, b) => b.percent - a.percent || b.total - a.total).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Here's your learning for today.</p>
      </div>

      {dailyUnit ? (
        <LearningCard unit={dailyUnit} onStart={startDaily} />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No learning units available yet.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StreakCard />
        <Card>
          <CardContent className="flex h-full items-center justify-center pt-6">
            <Button variant="secondary" size="lg" onClick={surpriseMe} className="w-full">
              <Shuffle className="h-4 w-4" />
              Surprise Me
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ProgressCard label="Today" value={counts.today} icon={CalendarCheck} />
        <ProgressCard label="This Week" value={counts.week} icon={CalendarDays} />
        <ProgressCard label="This Month" value={counts.month} icon={CalendarRange} />
        <ProgressCard label="All Time" value={counts.allTime} icon={Trophy} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Curriculum Progress</CardTitle>
          <CardDescription>Your top curricula by completion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCurricula.length === 0 && <p className="text-sm text-muted-foreground">No progress yet — start learning!</p>}
          {topCurricula.map((cp) => (
            <div key={cp.curriculumId} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{cp.title}</span>
                <span className="text-muted-foreground">{cp.percent}%</span>
              </div>
              <Progress value={cp.percent} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
