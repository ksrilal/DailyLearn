import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Shuffle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LessonViewer } from '@/features/learning/LessonViewer';
import { useLesson, toLessonInput } from '@/features/learning/useLesson';
import { useCurriculumStore } from '@/stores/curriculumStore';
import { useLearningStore } from '@/stores/learningStore';
import { useProgressStore } from '@/stores/progressStore';
import { toast } from '@/components/ui/toast';
import { PageLoader } from '@/components/PageLoader';

export default function LearnPage() {
  const navigate = useNavigate();
  const loaded = useCurriculumStore((s) => s.loaded);
  const allUnits = useCurriculumStore((s) => s.allUnits);
  const curricula = useCurriculumStore((s) => s.curricula);

  const activeUnitPath = useLearningStore((s) => s.activeUnitPath);
  const activeMode = useLearningStore((s) => s.activeMode);
  const pickDailyUnit = useLearningStore((s) => s.pickDailyUnit);
  const pickRandomUnit = useLearningStore((s) => s.pickRandomUnit);
  const setActiveUnit = useLearningStore((s) => s.setActiveUnit);

  const isCompleted = useProgressStore((s) => s.isCompleted);
  const markComplete = useProgressStore((s) => s.markComplete);

  useEffect(() => {
    if (!loaded || activeUnitPath) return;
    const daily = pickDailyUnit(allUnits);
    if (daily) setActiveUnit(daily.path, 'daily');
  }, [loaded, activeUnitPath, allUnits, pickDailyUnit, setActiveUnit]);

  const unit = useMemo(
    () => (activeUnitPath ? allUnits.find((u) => u.path === activeUnitPath) ?? null : null),
    [activeUnitPath, allUnits],
  );

  const { data: lesson, isLoading, isError, error, refetch, isFetching } = useLesson(unit);

  const curriculum = curricula.find((c) => c.id === unit?.curriculumId);
  const category = curriculum?.categories.find((c) => c.id === unit?.categoryId);
  const topic = category?.topics.find((t) => t.id === unit?.topicId);

  if (!loaded) return <PageLoader />;

  if (!unit) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No learning unit selected. Head to Explore to pick one.
        </CardContent>
      </Card>
    );
  }

  function handleSurpriseMe() {
    const next = pickRandomUnit(allUnits);
    if (!next) return;
    setActiveUnit(next.path, 'random');
  }

  function handleMarkComplete() {
    markComplete(unit!.path);
    toast({ title: 'Lesson complete!', description: 'Nice work — keep your streak going.', variant: 'success' });
  }

  const completed = isCompleted(unit.path);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {activeMode && (
            <Badge variant="secondary" className="capitalize">
              {activeMode} learning
            </Badge>
          )}
          {completed && (
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{unit.title}</h1>
        <p className="text-sm text-muted-foreground">
          {curriculum?.title} {category && `· ${category.title}`} {topic && `· ${topic.title}`}
        </p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating your lesson…</p>
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Couldn't generate this lesson
            </CardTitle>
            <CardDescription>{error instanceof Error ? error.message : 'Unknown error'}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/settings')}>
              <Sparkles className="h-4 w-4" />
              Open Settings
            </Button>
            <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {lesson && (
        <>
          <LessonViewer lesson={lesson} lessonInput={toLessonInput(unit)} />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleMarkComplete} disabled={completed} size="lg" className="flex-1">
              <CheckCircle2 className="h-4 w-4" />
              {completed ? 'Completed' : 'Mark Complete'}
            </Button>
            <Button variant="outline" onClick={handleSurpriseMe} size="lg" className="flex-1">
              <Shuffle className="h-4 w-4" />
              Surprise Me
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
