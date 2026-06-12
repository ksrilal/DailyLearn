import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/PageLoader';
import { useCurriculumStore } from '@/stores/curriculumStore';
import { useProgressStore } from '@/stores/progressStore';
import { useLearningStore } from '@/stores/learningStore';

export default function ReviewPage() {
  const navigate = useNavigate();
  const loaded = useCurriculumStore((s) => s.loaded);
  const getUnit = useCurriculumStore((s) => s.getUnit);
  const completions = useProgressStore((s) => s.completions);
  const setActiveUnit = useLearningStore((s) => s.setActiveUnit);

  if (!loaded) return <PageLoader />;

  const sorted = [...completions].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  function openLesson(unitPath: string) {
    setActiveUnit(unitPath, 'review');
    navigate('/learn');
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review</h1>
        <p className="text-sm text-muted-foreground">Revisit lessons you've already completed.</p>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8" />
            No completed lessons yet. Finish a lesson to see it here.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {sorted.map((record) => {
              const unit = getUnit(record.unitPath);
              if (!unit) return null;
              return (
                <button
                  key={record.unitPath}
                  onClick={() => openLesson(record.unitPath)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-accent sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{unit.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed {new Date(record.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
