import { NavLink } from 'react-router-dom';
import { BookOpen, Compass, Home, History, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/review', label: 'Review', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function MobileBottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
