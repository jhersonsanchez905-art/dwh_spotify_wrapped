// frontend/src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getToken, isAuthenticated, logout as authLogout } from '@/lib/auth'

interface AuthContextValue {
  isAuth: boolean
  isLoading: boolean
  logout: () => void
  checkAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(() => {
    setIsAuth(isAuthenticated())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Re-check when localStorage changes (multi-tab)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'app_token') checkAuth()
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [checkAuth])

  const logout = useCallback(() => {
    authLogout()
    setIsAuth(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuth, isLoading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Convenience: get token for use in hooks
export { getToken }
