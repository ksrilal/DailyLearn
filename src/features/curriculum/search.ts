import type { Curriculum } from '@/types/curriculum';

export interface SearchResult {
  type: 'curriculum' | 'category' | 'topic' | 'unit';
  id: string;
  title: string;
  path: string;
  breadcrumb: string;
}

/** Searches curriculum/category/topic/unit titles for a case-insensitive substring match. */
export function searchCurricula(curricula: Curriculum[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const curriculum of curricula) {
    if (curriculum.title.toLowerCase().includes(q)) {
      results.push({ type: 'curriculum', id: curriculum.id, title: curriculum.title, path: curriculum.path, breadcrumb: curriculum.title });
    }

    for (const category of curriculum.categories) {
      if (category.title.toLowerCase().includes(q)) {
        results.push({
          type: 'category',
          id: category.id,
          title: category.title,
          path: category.path,
          breadcrumb: `${curriculum.title} / ${category.title}`,
        });
      }

      for (const topic of category.topics) {
        if (topic.title.toLowerCase().includes(q)) {
          results.push({
            type: 'topic',
            id: topic.id,
            title: topic.title,
            path: topic.path,
            breadcrumb: `${curriculum.title} / ${category.title} / ${topic.title}`,
          });
        }

        for (const unit of topic.units) {
          if (unit.title.toLowerCase().includes(q)) {
            results.push({
              type: 'unit',
              id: unit.id,
              title: unit.title,
              path: unit.path,
              breadcrumb: `${curriculum.title} / ${category.title} / ${topic.title}`,
            });
          }
        }
      }
    }
  }

  return results.slice(0, 50);
}
