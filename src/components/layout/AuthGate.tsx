import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabaseEnabled } from '@/lib/supabase';
import { PageLoader } from '@/components/PageLoader';
import { syncProgressOnLogin } from '@/lib/progressSync';

/** Requires a signed-in user (including anonymous guest sessions) before
 * rendering child routes; redirects to /login otherwise. */
export function AuthGate() {
  const location = useLocation();
  const init = useAuthStore((s) => s.init);
  const initialized = useAuthStore((s) => s.initialized);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (session?.user.id) void syncProgressOnLogin(session.user.id);
  }, [session?.user.id]);

  if (!supabaseEnabled) return <Outlet />;

  if (!initialized) return <PageLoader />;

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) return <PageLoader />;

  return <Outlet />;
}

/** Requires the signed-in user to have the admin role; redirects home otherwise. */
export function AdminGate() {
  const profile = useAuthStore((s) => s.profile);

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
