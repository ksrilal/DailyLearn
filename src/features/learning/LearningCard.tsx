import { ArrowRight, Sparkles } from 'lucide-react';
import type { LearningUnit } from '@/types/curriculum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurriculumStore } from '@/stores/curriculumStore';
import { useProgressStore } from '@/stores/progressStore';

interface LearningCardProps {
  unit: LearningUnit;
  onStart: () => void;
  label?: string;
}

export function LearningCard({ unit, onStart, label = "Today's Lesson" }: LearningCardProps) {
  const curriculum = useCurriculumStore((s) => s.curricula.find((c) => c.id === unit.curriculumId));
  const category = curriculum?.categories.find((c) => c.id === unit.categoryId);
  const topic = category?.topics.find((t) => t.id === unit.topicId);
  const completed = useProgressStore((s) => s.isCompleted(unit.path));

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          {label}
        </div>
        <CardTitle className="text-2xl">{unit.title}</CardTitle>
        <CardDescription>
          {curriculum?.title} {category && `· ${category.title}`} {topic && `· ${topic.title}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        {completed && <Badge variant="success">Completed</Badge>}
        <Button onClick={onStart} size="lg" className="ml-auto">
          {completed ? 'Review Lesson' : 'Start Learning'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
