import { supabase, supabaseEnabled } from '@/lib/supabase';
import { useProgressStore } from '@/stores/progressStore';
import { useLearningStore } from '@/stores/learningStore';
import type { CompletionRecord, StreakData } from '@/types/progress';

interface RemoteProgress {
  completions: CompletionRecord[];
  streak: StreakData;
  daily_unit_by_date: Record<string, string>;
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let syncedUserId: string | null = null;
let unsubscribeProgress: (() => void) | null = null;
let unsubscribeLearning: (() => void) | null = null;

function mergeCompletions(local: CompletionRecord[], remote: CompletionRecord[]): CompletionRecord[] {
  const byPath = new Map<string, CompletionRecord>();
  for (const c of [...remote, ...local]) {
    const existing = byPath.get(c.unitPath);
    if (!existing || c.completedAt > existing.completedAt) byPath.set(c.unitPath, c);
  }
  return Array.from(byPath.values());
}

/** Pull remote progress for `userId` and merge it into the local stores, then start syncing local changes back to Supabase. */
export async function syncProgressOnLogin(userId: string): Promise<void> {
  if (!supabaseEnabled || syncedUserId === userId) return;

  const { data } = await supabase
    .from('user_progress')
    .select('completions, streak, daily_unit_by_date')
    .eq('user_id', userId)
    .maybeSingle();

  const remote = data as RemoteProgress | null;
  if (remote) {
    const progressState = useProgressStore.getState();
    const mergedCompletions = mergeCompletions(progressState.completions, remote.completions ?? []);
    useProgressStore.getState().importProgress({
      completions: mergedCompletions,
      streak: pickNewerStreak(progressState.streak, remote.streak),
    });

    const learningState = useLearningStore.getState();
    useLearningStore.getState().importLearning({
      dailyUnitByDate: { ...remote.daily_unit_by_date, ...learningState.dailyUnitByDate },
    });
  }

  syncedUserId = userId;
  pushProgress(userId);

  unsubscribeProgress?.();
  unsubscribeLearning?.();
  unsubscribeProgress = useProgressStore.subscribe(() => scheduleSync(userId));
  unsubscribeLearning = useLearningStore.subscribe(() => scheduleSync(userId));
}

/** Stop syncing and clear local subscriptions (called on sign-out). */
export function stopProgressSync(): void {
  syncedUserId = null;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
  unsubscribeProgress?.();
  unsubscribeLearning?.();
  unsubscribeProgress = null;
  unsubscribeLearning = null;
}

function pickNewerStreak(local: StreakData, remote: StreakData): StreakData {
  if (!remote.lastCompletedDate) return local;
  if (!local.lastCompletedDate) return remote;
  return local.lastCompletedDate >= remote.lastCompletedDate ? local : remote;
}

function scheduleSync(userId: string): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushProgress(userId), 1500);
}

function pushProgress(userId: string): void {
  const { completions, streak } = useProgressStore.getState();
  const { dailyUnitByDate } = useLearningStore.getState();

  void supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      completions,
      streak,
      daily_unit_by_date: dailyUnitByDate,
      updated_at: new Date().toISOString(),
    })
    .then(({ error }) => {
      if (error) console.error('pushProgress: failed to sync progress:', error);
    });
}
