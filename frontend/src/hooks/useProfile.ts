// frontend/src/hooks/useProfile.ts

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export const PROFILE_KEY = ['profile'] as const

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: endpoints.profile.me,
    enabled: isAuthenticated(),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchProfile() {
  const qc = useQueryClient()
  return () =>
    qc.prefetchQuery({
      queryKey: PROFILE_KEY,
      queryFn: endpoints.profile.me,
      staleTime: 15 * 60 * 1000,
    })
}
