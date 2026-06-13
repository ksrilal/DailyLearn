import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { estimateCost, formatCost } from '@/lib/aiPricing';

interface UsageStats {
  last24h: number;
  last7d: number;
  total: number;
  byMonth: Record<string, { count: number; cost: number }>;
}

const EMPTY_STATS: UsageStats = { last24h: 0, last7d: 0, total: 0, byMonth: {} };

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** Shows the signed-in user's own AI usage (request counts + estimated cost). */
export function UsageSummaryCard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void loadUsage(user.id);
  }, [user]);

  async function loadUsage(userId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_usage')
      .select('created_at, model, input_tokens, output_tokens')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error || !data) {
      setStats(EMPTY_STATS);
      setLoading(false);
      return;
    }

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const result: UsageStats = { last24h: 0, last7d: 0, total: 0, byMonth: {} };
    for (const row of data as { created_at: string; model: string | null; input_tokens: number | null; output_tokens: number | null }[]) {
      const created = new Date(row.created_at);
      const age = now - created.getTime();
      result.total += 1;
      if (age <= dayMs) result.last24h += 1;
      if (age <= 7 * dayMs) result.last7d += 1;

      const key = monthKey(created);
      const m = result.byMonth[key] ?? { count: 0, cost: 0 };
      m.count += 1;
      m.cost += estimateCost(row.model, row.input_tokens ?? 0, row.output_tokens ?? 0);
      result.byMonth[key] = m;
    }
    setStats(result);
    setLoading(false);
  }

  if (!supabaseEnabled || !user) return null;

  const months = stats ? Object.keys(stats.byMonth).sort((a, b) => b.localeCompare(a)) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Usage
        </CardTitle>
        <CardDescription>Your AI lesson generation activity and estimated cost.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-bold tracking-tight">{stats?.total ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total requests</p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{stats?.last24h ?? 0}</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{stats?.last7d ?? 0}</p>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
            </div>

            {months.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">Monthly bill</p>
                <div className="space-y-1">
                  {months.map((key) => {
                    const m = stats!.byMonth[key];
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{monthLabel(key)}</span>
                        <span>
                          {m.count} request{m.count === 1 ? '' : 's'} · ~{formatCost(m.cost)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
