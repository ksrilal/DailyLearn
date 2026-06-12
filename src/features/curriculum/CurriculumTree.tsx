import { ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import type { Category, Curriculum, Topic } from '@/types/curriculum';
import { cn } from '@/lib/cn';
import { useCurriculumStore } from '@/stores/curriculumStore';
import { useProgressStore } from '@/stores/progressStore';

interface CurriculumTreeProps {
  curricula: Curriculum[];
  onSelectUnit: (unitPath: string) => void;
}

export function CurriculumTree({ curricula, onSelectUnit }: CurriculumTreeProps) {
  return (
    <div className="space-y-1">
      {curricula.map((curriculum) => (
        <TreeNode key={curriculum.path} id={curriculum.path} title={curriculum.title} level={0}>
          {curriculum.categories.map((category) => (
            <CategoryNode key={category.path} category={category} onSelectUnit={onSelectUnit} />
          ))}
        </TreeNode>
      ))}
    </div>
  );
}

function CategoryNode({ category, onSelectUnit }: { category: Category; onSelectUnit: (unitPath: string) => void }) {
  return (
    <TreeNode id={category.path} title={category.title} level={1}>
      {category.topics.map((topic) => (
        <TopicNode key={topic.path} topic={topic} onSelectUnit={onSelectUnit} />
      ))}
    </TreeNode>
  );
}

function TopicNode({ topic, onSelectUnit }: { topic: Topic; onSelectUnit: (unitPath: string) => void }) {
  const completions = useProgressStore((s) => s.completions);
  const completedSet = new Set(completions.map((c) => c.unitPath));
  const completedCount = topic.units.filter((u) => completedSet.has(u.path)).length;

  return (
    <TreeNode
      id={topic.path}
      title={topic.title}
      level={2}
      badge={`${completedCount}/${topic.units.length}`}
    >
      {topic.units.map((unit) => {
        const isComplete = completedSet.has(unit.path);
        return (
          <button
            key={unit.path}
            onClick={() => onSelectUnit(unit.path)}
            className="flex w-full items-center gap-2 rounded-md py-1.5 pl-12 pr-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {isComplete ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate">{unit.title}</span>
          </button>
        );
      })}
    </TreeNode>
  );
}

interface TreeNodeProps {
  id: string;
  title: string;
  level: number;
  badge?: string;
  children: React.ReactNode;
}

function TreeNode({ id, title, level, badge, children }: TreeNodeProps) {
  const expanded = useCurriculumStore((s) => s.expandedIds.has(id));
  const toggle = useCurriculumStore((s) => s.toggleExpanded);

  return (
    <div>
      <button
        onClick={() => toggle(id)}
        className="flex w-full items-center gap-2 rounded-md py-2 pr-2 text-left text-sm font-medium transition-colors hover:bg-accent"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        aria-expanded={expanded}
      >
        <ChevronRight className={cn('h-4 w-4 shrink-0 transition-transform text-muted-foreground', expanded && 'rotate-90')} />
        <span className={cn('truncate', level === 0 && 'text-base font-semibold')}>{title}</span>
        {badge && <span className="ml-auto shrink-0 text-xs font-normal text-muted-foreground">{badge}</span>}
      </button>
      {expanded && <div>{children}</div>}
    </div>
  );
}
