import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Toaster } from '@/components/ui/toast';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 sm:pb-10 lg:px-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
      <Toaster />
    </div>
  );
}
