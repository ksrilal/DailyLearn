import { NavLink } from 'react-router-dom';
import { BookOpen, Compass, Home, History, Settings, Flame, ShieldCheck, LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useProgressStore } from '@/stores/progressStore';
import { useAuthStore } from '@/stores/authStore';
import { supabaseEnabled } from '@/lib/supabase';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/progress', label: 'Progress', icon: Flame },
  { to: '/review', label: 'Review', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const streak = useProgressStore((s) => s.streak);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  const navItems = profile?.role === 'admin' ? [...NAV_ITEMS, { to: '/admin', label: 'Admin', icon: ShieldCheck }] : NAV_ITEMS;

  return (
    <aside className="hidden border-r bg-card lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">DailyLearn</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t p-4">
        <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-medium">{streak.current} day streak</span>
        </div>
        {supabaseEnabled && profile && (
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
