// frontend/src/hooks/useHistory.ts

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export const HISTORY_KEY = ['history', 'recently-played'] as const

export function useRecentlyPlayed() {
  return useQuery({
    queryKey: HISTORY_KEY,
    queryFn: endpoints.history.recentlyPlayed,
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    select: (data) => ({
      ...data,
      items: data.items ?? [],
    }),
  })
}

export function usePrefetchHistory() {
  const qc = useQueryClient()
  return () =>
    qc.prefetchQuery({
      queryKey: HISTORY_KEY,
      queryFn: endpoints.history.recentlyPlayed,
      staleTime: 5 * 60 * 1000,
    })
}
