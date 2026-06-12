import type { ModuleConfig } from '@/types/curriculum';

/**
 * Registry of all learning modules. Only `enabled` modules are loadable.
 * `curricula` lists the curriculum ids (filenames without .json) under
 * `src/data/curricula/<moduleId>/`.
 */
export const MODULES: ModuleConfig[] = [
  {
    id: 'software-engineering-master',
    title: 'Software Engineering Master',
    description: 'Become a world-class software engineer, one concept at a time.',
    enabled: true,
    curricula: [
      'software-design',
      'system-design',
      'architecture',
      'domain-driven-design',
      'databases',
      'distributed-systems',
      'event-driven-systems',
      'concurrency-parallelism',
      'networking-fundamentals',
      'api-engineering',
      'cloud-infrastructure',
      'devops-platform-engineering',
      'observability',
      'security',
      'performance-engineering',
      'testing-quality-engineering',
      'engineering-principles',
      'ai-assisted-engineering',
      'career-growth',
      'engineering-leadership',
    ],
  },
  {
    id: 'english-master',
    title: 'English Master',
    description: 'Sharpen grammar, vocabulary, and communication skills daily.',
    enabled: false,
    curricula: [],
  },
  {
    id: 'finance-master',
    title: 'Finance Master',
    description: 'Build financial literacy from fundamentals to investing.',
    enabled: false,
    curricula: [],
  },
  {
    id: 'philosophy-master',
    title: 'Philosophy Master',
    description: 'Explore the ideas that shaped human thought.',
    enabled: false,
    curricula: [],
  },
  {
    id: 'science-master',
    title: 'Science Master',
    description: 'Daily bites of physics, biology, chemistry, and beyond.',
    enabled: false,
    curricula: [],
  },
];

export function getModule(moduleId: string): ModuleConfig | undefined {
  return MODULES.find((m) => m.id === moduleId);
}

export function getEnabledModules(): ModuleConfig[] {
  return MODULES.filter((m) => m.enabled);
}
