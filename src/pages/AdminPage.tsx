import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Profile } from '@/types/auth';

export default function AdminPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    void loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
    if (!error && data) setProfiles(data as Profile[]);
    setLoading(false);
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

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">AI access</span>
                    <Switch
                      checked={profile.ai_enabled}
                      disabled={updatingId === profile.id}
                      onCheckedChange={(checked) => toggleAiEnabled(profile, checked)}
                    />
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
