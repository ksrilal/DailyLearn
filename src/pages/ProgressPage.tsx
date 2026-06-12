import { CalendarCheck, CalendarDays, CalendarRange, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PageLoader } from '@/components/PageLoader';
import { StreakCard } from '@/features/progress/StreakCard';
import { ProgressCard } from '@/features/progress/ProgressCard';
import { LearningHeatmap } from '@/features/progress/LearningHeatmap';
import { useCurriculumStore } from '@/stores/curriculumStore';
import { useProgressStore } from '@/stores/progressStore';
import { getEnabledModules } from '@/data/modules';

export default function ProgressPage() {
  const loaded = useCurriculumStore((s) => s.loaded);
  const curricula = useCurriculumStore((s) => s.curricula);

  const counts = useProgressStore((s) => s.getCounts());
  const curriculumProgress = useProgressStore((s) => s.getCurriculumProgress(curricula));
  const heatmap = useProgressStore((s) => s.getHeatmap());

  if (!loaded) return <PageLoader />;

  const totalUnits = curriculumProgress.reduce((sum, c) => sum + c.total, 0);
  const totalCompleted = curriculumProgress.reduce((sum, c) => sum + c.completed, 0);
  const overallPercent = totalUnits === 0 ? 0 : Math.round((totalCompleted / totalUnits) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="text-sm text-muted-foreground">Track your learning journey over time.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ProgressCard label="Today" value={counts.today} icon={CalendarCheck} />
        <ProgressCard label="This Week" value={counts.week} icon={CalendarDays} />
        <ProgressCard label="This Month" value={counts.month} icon={CalendarRange} />
        <ProgressCard label="All Time" value={counts.allTime} icon={Trophy} />
      </div>

      <StreakCard />

      <Card>
        <CardHeader>
          <CardTitle>Learning Heatmap</CardTitle>
          <CardDescription>Your activity over the last 12 weeks.</CardDescription>
        </CardHeader>
        <CardContent>
          <LearningHeatmap days={heatmap} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module Progress</CardTitle>
          <CardDescription>Overall completion across enabled modules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {getEnabledModules().map((mod) => (
            <div key={mod.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{mod.title}</span>
                <span className="text-muted-foreground">
                  {totalCompleted}/{totalUnits} ({overallPercent}%)
                </span>
              </div>
              <Progress value={overallPercent} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Curriculum Progress</CardTitle>
          <CardDescription>Completion across every curriculum.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {curriculumProgress.map((cp) => (
            <div key={cp.curriculumId} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{cp.title}</span>
                <span className="text-muted-foreground">
                  {cp.completed}/{cp.total} ({cp.percent}%)
                </span>
              </div>
              <Progress value={cp.percent} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
