import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/PageLoader';
import { CurriculumTree } from '@/features/curriculum/CurriculumTree';
import { searchCurricula } from '@/features/curriculum/search';
import { useCurriculumStore } from '@/stores/curriculumStore';
import { useLearningStore } from '@/stores/learningStore';
import { useProgressStore } from '@/stores/progressStore';
import { getEnabledModules } from '@/data/modules';

export default function ExplorePage() {
  const navigate = useNavigate();
  const loaded = useCurriculumStore((s) => s.loaded);
  const curricula = useCurriculumStore((s) => s.curricula);
  const setActiveUnit = useLearningStore((s) => s.setActiveUnit);
  const isCompleted = useProgressStore((s) => s.isCompleted);

  const [query, setQuery] = useState('');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const modules = useMemo(() => getEnabledModules(), []);
  const results = useMemo(() => searchCurricula(curricula, query), [curricula, query]);
  const activeCurricula = useMemo(
    () => curricula.filter((c) => c.moduleId === activeModuleId),
    [curricula, activeModuleId],
  );
  const activeModule = modules.find((m) => m.id === activeModuleId);

  function selectUnit(unitPath: string) {
    setActiveUnit(unitPath, 'guided');
    navigate('/learn');
  }

  if (!loaded) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
        <p className="text-sm text-muted-foreground">Browse the full curriculum or search for a topic.</p>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Search curriculum, category, topic, or unit..." />

      {query ? (
        <Card>
          <CardContent className="space-y-1 pt-6">
            {results.length === 0 && <p className="text-sm text-muted-foreground">No results found.</p>}
            {results.map((result) => (
              <button
                key={`${result.type}-${result.path}`}
                onClick={() => (result.type === 'unit' ? selectUnit(result.path) : undefined)}
                disabled={result.type !== 'unit'}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:cursor-default disabled:opacity-70"
              >
                <div>
                  <p className="font-medium">{result.title}</p>
                  <p className="text-xs text-muted-foreground">{result.breadcrumb}</p>
                </div>
                {result.type === 'unit' && (
                  <BookOpen className={isCompleted(result.path) ? 'h-4 w-4 text-success' : 'h-4 w-4 text-muted-foreground'} />
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      ) : activeModuleId ? (
        <Card>
          <CardContent className="pt-6">
            <button
              onClick={() => setActiveModuleId(null)}
              className="mb-2 flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              {activeModule?.title ?? 'Back to modules'}
            </button>
            <CurriculumTree curricula={activeCurricula} onSelectUnit={selectUnit} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModuleId(module.id)}
              className="flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{module.title}</p>
                <p className="text-xs text-muted-foreground">{module.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
