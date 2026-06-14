import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import type { TokenUsage } from './chat.js';

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
        realtime: { transport: ws as never },
      })
    : null;

export interface AuthCheckResult {
  /** True if Supabase isn't configured (auth not enforced) or the user has AI access. */
  allowed: boolean;
  /** The authenticated user's id, if Supabase is configured and the token is valid. */
  userId: string | null;
}

/** Resolves the bearer token in the Authorization header and checks whether
 * that user's `profiles.ai_enabled` flag is true. If Supabase isn't
 * configured, auth is not enforced and access is always allowed. Guests
 * authenticate via Supabase anonymous sign-in and always carry a token, so
 * a missing token is rejected. */
export async function checkAiAccess(authHeader: string | undefined): Promise<AuthCheckResult> {
  if (!supabaseAdmin) return { allowed: true, userId: null };

  const token = authHeader?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return { allowed: false, userId: null };

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) return { allowed: false, userId: null };

  const userId = userData.user.id;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('ai_enabled')
    .eq('id', userId)
    .single();

  if (profileError || !profile) return { allowed: false, userId };
  return { allowed: profile.ai_enabled === true, userId };
}

/** Records one AI request for usage monitoring, marks whether it was covered
 * by the user's free trial, and increments/expires the trial counter. Once
 * `trial_calls_used` reaches `trial_limit`, `ai_enabled` is auto-disabled
 * unless the admin has granted full access (`ai_enabled_by_admin`).
 * Best-effort: failures are swallowed so logging never blocks the AI response. */
export async function logAiUsage(
  userId: string | null,
  kind: string,
  provider?: string,
  model?: string,
  usage?: TokenUsage | null,
) {
  if (!supabaseAdmin || !userId) return;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('trial_calls_used, trial_limit, ai_enabled_by_admin')
    .eq('id', userId)
    .single();

  const trialCallsUsed = profile?.trial_calls_used ?? 0;
  const trialLimit = profile?.trial_limit ?? 5;
  const adminGranted = profile?.ai_enabled_by_admin === true;
  const isTrial = !adminGranted && trialCallsUsed < trialLimit;

  await supabaseAdmin
    .from('ai_usage')
    .insert({
      user_id: userId,
      kind,
      provider,
      model,
      input_tokens: usage?.inputTokens ?? null,
      output_tokens: usage?.outputTokens ?? null,
      is_trial: isTrial,
    })
    .then(
      () => undefined,
      () => undefined,
    );

  if (isTrial && profile) {
    const newCount = trialCallsUsed + 1;
    const update: Record<string, unknown> = { trial_calls_used: newCount };
    if (newCount >= trialLimit) update.ai_enabled = false;
    await supabaseAdmin
      .from('profiles')
      .update(update)
      .eq('id', userId)
      .then(
        () => undefined,
        () => undefined,
      );
  }
}
