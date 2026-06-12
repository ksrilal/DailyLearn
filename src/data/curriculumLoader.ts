import type { Category, Curriculum, LearningUnit, RawCurriculum, Topic } from '@/types/curriculum';
import { slugify } from '@/lib/slugify';
import { getModule } from '@/data/modules';

// Eagerly import all curriculum JSON as raw modules; Vite code-splits these
// into separate chunks, and we only touch the ones we actually request.
const rawModules = import.meta.glob<{ default: RawCurriculum }>(
  '@/data/curricula/*/*.json',
);

const curriculumCache = new Map<string, Curriculum>();

function buildPath(...segments: string[]): string {
  return segments.join('/');
}

function normalize(raw: RawCurriculum, moduleId: string): Curriculum {
  const curriculumPath = buildPath(moduleId, raw.id);

  const categories: Category[] = raw.categories.map((cat) => {
    const categoryPath = buildPath(curriculumPath, cat.id);

    const topics: Topic[] = cat.topics.map((topic) => {
      const topicPath = buildPath(categoryPath, topic.id);

      const units: LearningUnit[] = topic.learningUnits.map((unitTitle) => {
        const unitId = slugify(unitTitle);
        return {
          id: unitId,
          title: unitTitle,
          path: buildPath(topicPath, unitId),
          moduleId,
          curriculumId: raw.id,
          categoryId: cat.id,
          topicId: topic.id,
        };
      });

      return {
        id: topic.id,
        title: topic.title,
        path: topicPath,
        curriculumId: raw.id,
        categoryId: cat.id,
        units,
      };
    });

    return {
      id: cat.id,
      title: cat.title,
      path: categoryPath,
      curriculumId: raw.id,
      topics,
    };
  });

  return {
    id: raw.id,
    title: raw.title,
    moduleId,
    path: curriculumPath,
    categories,
  };
}

/** Loads and normalizes a single curriculum by module/curriculum id, with caching. */
export async function loadCurriculum(moduleId: string, curriculumId: string): Promise<Curriculum> {
  const cacheKey = buildPath(moduleId, curriculumId);
  const cached = curriculumCache.get(cacheKey);
  if (cached) return cached;

  const loaderKey = `/src/data/curricula/${moduleId}/${curriculumId}.json`;
  const loader = rawModules[loaderKey];
  if (!loader) {
    throw new Error(`Curriculum not found: ${cacheKey}`);
  }

  const mod = await loader();
  const normalized = normalize(mod.default, moduleId);
  curriculumCache.set(cacheKey, normalized);
  return normalized;
}

/** Loads every curriculum belonging to an enabled module. */
export async function loadModuleCurricula(moduleId: string): Promise<Curriculum[]> {
  const moduleConfig = getModule(moduleId);
  if (!moduleConfig || !moduleConfig.enabled) return [];

  return Promise.all(moduleConfig.curricula.map((id) => loadCurriculum(moduleId, id)));
}

/** Flattens a curriculum into a list of learning units. */
export function flattenUnits(curriculum: Curriculum): LearningUnit[] {
  return curriculum.categories.flatMap((cat) => cat.topics.flatMap((topic) => topic.units));
}
