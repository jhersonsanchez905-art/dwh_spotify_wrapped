// frontend/src/hooks/useTopTracks.ts

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export const TRACKS_KEY = ['tracks', 'top'] as const

export function useTopTracks() {
  return useQuery({
    queryKey: TRACKS_KEY,
    queryFn: endpoints.tracks.top,
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
    select: (data) => ({
      ...data,
      tracks: data.tracks ?? [],
    }),
  })
}

export function usePrefetchTracks() {
  const qc = useQueryClient()
  return () =>
    qc.prefetchQuery({
      queryKey: TRACKS_KEY,
      queryFn: endpoints.tracks.top,
      staleTime: 10 * 60 * 1000,
    })
}
