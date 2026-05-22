// frontend/src/components/layout/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuth, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner fullScreen />
  if (!isAuth) return <Navigate to="/login" replace />

  return <>{children}</>
}
