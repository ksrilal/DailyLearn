import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
        realtime: { transport: ws as never },
      })
    : null;

/** Checks whether the bearer token in the Authorization header belongs to a
 * user whose `profiles.ai_enabled` flag is true. Returns `true` if Supabase
 * isn't configured (auth is optional / not enforced). */
export async function isAiAccessAllowed(authHeader: string | undefined): Promise<boolean> {
  if (!supabaseAdmin) return true;

  const token = authHeader?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return false;

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) return false;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('ai_enabled')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !profile) return false;
  return profile.ai_enabled === true;
}
