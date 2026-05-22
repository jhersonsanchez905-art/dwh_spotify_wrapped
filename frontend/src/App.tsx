// frontend/src/App.tsx

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

const Login     = lazy(() => import('@/pages/Login'))
const Callback  = lazy(() => import('@/pages/Callback'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Profile   = lazy(() => import('@/pages/Profile'))
const Etl       = lazy(() => import('@/pages/Etl'))

function RootRedirect() {
  const { isAuth, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner fullScreen />
  return <Navigate to={isAuth ? '/dashboard' : '/login'} replace />
}

// Wraps each route in ErrorBoundary so one broken page doesn't kill the app
function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner fullScreen label="Cargando..." />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login"     element={<RouteErrorBoundary><Login /></RouteErrorBoundary>} />
          <Route path="/callback"  element={<RouteErrorBoundary><Callback /></RouteErrorBoundary>} />
          <Route path="/dashboard" element={<RouteErrorBoundary><Dashboard /></RouteErrorBoundary>} />
          <Route path="/profile"   element={<RouteErrorBoundary><Profile /></RouteErrorBoundary>} />
          <Route path="/etl"       element={<RouteErrorBoundary><Etl /></RouteErrorBoundary>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
