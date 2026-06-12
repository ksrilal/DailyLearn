/** Raw shape of a curriculum JSON file as stored under src/data/curricula. */
export interface RawTopic {
  id: string;
  title: string;
  learningUnits: string[];
}

export interface RawCategory {
  id: string;
  title: string;
  topics: RawTopic[];
}

export interface RawCurriculum {
  id: string;
  title: string;
  categories: RawCategory[];
}

/** Normalized learning unit with a stable, globally unique path. */
export interface LearningUnit {
  id: string;
  title: string;
  /** module/curriculum/category/topic/unit */
  path: string;
  moduleId: string;
  curriculumId: string;
  categoryId: string;
  topicId: string;
}

export interface Topic {
  id: string;
  title: string;
  path: string;
  curriculumId: string;
  categoryId: string;
  units: LearningUnit[];
}

export interface Category {
  id: string;
  title: string;
  path: string;
  curriculumId: string;
  topics: Topic[];
}

export interface Curriculum {
  id: string;
  title: string;
  moduleId: string;
  path: string;
  categories: Category[];
}

export interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  /** Curriculum ids that belong to this module (filenames without .json under src/data/curricula/<moduleId>/) */
  curricula: string[];
}

export interface ModuleSummary {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  curriculumIds: string[];
}
