import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Profile } from '@/types/auth';
import { estimateCost, formatCost } from '@/lib/aiPricing';

interface UsageCounts {
  total: number;
  last24h: number;
  last7d: number;
  byMonth: Record<string, { count: number; cost: number }>;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function AdminPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [usage, setUsage] = useState<Record<string, UsageCounts>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [monthOptions, setMonthOptions] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(monthKey(new Date()));

  useEffect(() => {
    void loadProfiles();
    void loadUsage();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
    if (!error && data) setProfiles(data as Profile[]);
    setLoading(false);
  }

  async function loadUsage() {
    const { data, error } = await supabase
      .from('ai_usage')
      .select('user_id, created_at, model, input_tokens, output_tokens, is_trial')
      .order('created_at', { ascending: false })
      .limit(5000);
    if (error || !data) return;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const counts: Record<string, UsageCounts> = {};
    const months = new Set<string>();
    for (const row of data as {
      user_id: string;
      created_at: string;
      model: string | null;
      input_tokens: number | null;
      output_tokens: number | null;
      is_trial: boolean | null;
    }[]) {
      const created = new Date(row.created_at);
      const age = now - created.getTime();
      const c = counts[row.user_id] ?? { total: 0, last24h: 0, last7d: 0, byMonth: {} };
      c.total += 1;
      if (age <= dayMs) c.last24h += 1;
      if (age <= 7 * dayMs) c.last7d += 1;
      const key = monthKey(created);
      months.add(key);
      const m = c.byMonth[key] ?? { count: 0, cost: 0 };
      m.count += 1;
      if (!row.is_trial) {
        m.cost += estimateCost(row.model, row.input_tokens ?? 0, row.output_tokens ?? 0);
      }
      c.byMonth[key] = m;
      counts[row.user_id] = c;
    }
    months.add(monthKey(new Date()));
    setMonthOptions(Array.from(months).sort((a, b) => b.localeCompare(a)));
    setUsage(counts);
  }

  async function toggleAiEnabled(profile: Profile, enabled: boolean) {
    setUpdatingId(profile.id);
    const { error } = await supabase
      .from('profiles')
      .update({ ai_enabled: enabled, ai_enabled_by_admin: enabled })
      .eq('id', profile.id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'error' });
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, ai_enabled: enabled, ai_enabled_by_admin: enabled } : p)),
      );
      toast({
        title: enabled ? 'AI access enabled' : 'AI access disabled',
        description: profile.email,
        variant: 'success',
      });
    }
    setUpdatingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">Enable or disable AI lesson generation access per user.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Users
              </CardTitle>
              <CardDescription>{profiles.length} registered account{profiles.length === 1 ? '' : 's'}</CardDescription>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              {monthOptions.map((key) => (
                <option key={key} value={key}>
                  {monthLabel(key)}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {profiles.map((profile) => {
                const stats = usage[profile.id];
                const monthStats = stats?.byMonth[selectedMonth];
                const expanded = expandedId === profile.id;
                return (
                  <div key={profile.id} className="rounded-lg border">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{profile.email}</span>
                          {profile.role === 'admin' && (
                            <Badge variant="secondary">
                              <ShieldCheck className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {profile.id === currentUser?.id && <Badge variant="outline">You</Badge>}
                          {!profile.ai_enabled_by_admin && (
                            <Badge variant="outline">
                              Trial {Math.min(profile.trial_calls_used, profile.trial_limit)}/{profile.trial_limit}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expanded ? null : profile.id)}
                        >
                          {stats?.total ?? 0} requests
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">AI access</span>
                          <Switch
                            checked={profile.ai_enabled}
                            disabled={updatingId === profile.id}
                            onCheckedChange={(checked) => toggleAiEnabled(profile, checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {expanded && (
                      <div className="grid grid-cols-2 gap-4 border-t p-3 sm:grid-cols-4">
                        <div>
                          <p className="text-lg font-semibold">{stats?.last24h ?? 0}</p>
                          <p className="text-xs text-muted-foreground">Last 24 hours</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{stats?.last7d ?? 0}</p>
                          <p className="text-xs text-muted-foreground">Last 7 days</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{monthStats?.count ?? 0}</p>
                          <p className="text-xs text-muted-foreground">Requests ({monthLabel(selectedMonth)})</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">~{formatCost(monthStats?.cost ?? 0)}</p>
                          <p className="text-xs text-muted-foreground">Est. cost ({monthLabel(selectedMonth)})</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
