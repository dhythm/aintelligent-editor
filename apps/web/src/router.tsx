import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LoadingState } from './components/loading-state'

const HomePage = lazy(() => import('./pages/HomePage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'))
const VersionsPage = lazy(() => import('./pages/VersionsPage'))

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(HomePage),
  },
  {
    path: '/documents',
    element: withSuspense(DocumentsPage),
  },
  {
    path: '/settings',
    element: withSuspense(SettingsPage),
  },
  {
    path: '/templates',
    element: withSuspense(TemplatesPage),
  },
  {
    path: '/versions',
    element: withSuspense(VersionsPage),
  },
])