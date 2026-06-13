export type UserRole = 'admin' | 'learner';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  ai_enabled: boolean;
  created_at: string;
}
