import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/PageLoader';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LearnPage = lazy(() => import('@/pages/LearnPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const ReviewPage = lazy(() => import('@/pages/ReviewPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
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
    ],
  },
]);
