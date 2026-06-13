import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGate, AdminGate } from '@/components/layout/AuthGate';
import { PageLoader } from '@/components/PageLoader';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LearnPage = lazy(() => import('@/pages/LearnPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const ReviewPage = lazy(() => import('@/pages/ReviewPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/register', element: withSuspense(<RegisterPage />) },
  {
    element: <AuthGate />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: 'learn', element: withSuspense(<LearnPage />) },
          { path: 'explore', element: withSuspense(<ExplorePage />) },
          { path: 'progress', element: withSuspense(<ProgressPage />) },
          { path: 'review', element: withSuspense(<ReviewPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
          {
            element: <AdminGate />,
            children: [{ path: 'admin', element: withSuspense(<AdminPage />) }],
          },
        ],
      },
    ],
  },
]);
