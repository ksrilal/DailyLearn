import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  last30d: number;
  costLast30d: number;
}

export default function AdminPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [usage, setUsage] = useState<Record<string, UsageCounts>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      .select('user_id, created_at, model, input_tokens, output_tokens')
      .order('created_at', { ascending: false })
      .limit(5000);
    if (error || !data) return;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const counts: Record<string, UsageCounts> = {};
    for (const row of data as {
      user_id: string;
      created_at: string;
      model: string | null;
      input_tokens: number | null;
      output_tokens: number | null;
    }[]) {
      const age = now - new Date(row.created_at).getTime();
      const c = counts[row.user_id] ?? { total: 0, last24h: 0, last7d: 0, last30d: 0, costLast30d: 0 };
      c.total += 1;
      if (age <= dayMs) c.last24h += 1;
      if (age <= 7 * dayMs) c.last7d += 1;
      if (age <= 30 * dayMs) {
        c.last30d += 1;
        c.costLast30d += estimateCost(row.model, row.input_tokens ?? 0, row.output_tokens ?? 0);
      }
      counts[row.user_id] = c;
    }
    setUsage(counts);
  }

  async function toggleAiEnabled(profile: Profile, enabled: boolean) {
    setUpdatingId(profile.id);
    const { error } = await supabase.from('profiles').update({ ai_enabled: enabled }).eq('id', profile.id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'error' });
    } else {
      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? { ...p, ai_enabled: enabled } : p)));
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
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Users
          </CardTitle>
          <CardDescription>{profiles.length} registered account{profiles.length === 1 ? '' : 's'}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
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
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{usage[profile.id]?.total ?? 0} requests total</p>
                      <p>
                        {usage[profile.id]?.last24h ?? 0} in 24h · {usage[profile.id]?.last7d ?? 0} in 7d ·{' '}
                        {usage[profile.id]?.last30d ?? 0} in 30d
                      </p>
                      <p>~{formatCost(usage[profile.id]?.costLast30d ?? 0)} est. (30d)</p>
                    </div>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
