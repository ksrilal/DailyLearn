import type { VercelRequest, VercelResponse } from '@vercel/node';
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

/** Deletes stale anonymous Supabase users (and their cascading profiles/progress/usage
 * rows) to keep the project within free-tier MAU/DB limits. Triggered daily by Vercel
 * Cron, which sends `CRON_SECRET` as a bearer token. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!supabaseAdmin) {
    res.status(503).json({ error: 'Supabase is not configured.' });
    return;
  }

  const { data, error } = await supabaseAdmin.rpc('cleanup_anonymous_users');
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ ok: true, deleted: data });
}
