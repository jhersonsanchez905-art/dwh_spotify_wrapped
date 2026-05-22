// frontend/src/hooks/useTopArtists.ts

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export const ARTISTS_KEY = ['artists', 'top'] as const

export function useTopArtists() {
  return useQuery({
    queryKey: ARTISTS_KEY,
    queryFn: endpoints.artists.top,
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
    select: (data) => ({
      ...data,
      // Memoize sorted artists so downstream useMemo re-runs only on data change
      artists: data.artists ?? [],
    }),
  })
}

// Call on Navbar hover over "Dashboard" to prefetch before the page mounts
export function usePrefetchArtists() {
  const qc = useQueryClient()
  return () =>
    qc.prefetchQuery({
      queryKey: ARTISTS_KEY,
      queryFn: endpoints.artists.top,
      staleTime: 10 * 60 * 1000,
    })
}
