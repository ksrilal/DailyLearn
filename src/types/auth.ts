export type UserRole = 'admin' | 'learner';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  ai_enabled: boolean;
  ai_enabled_by_admin: boolean;
  trial_calls_used: number;
  trial_limit: number;
  created_at: string;
}
