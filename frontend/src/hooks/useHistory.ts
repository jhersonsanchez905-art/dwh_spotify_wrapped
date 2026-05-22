// frontend/src/hooks/useHistory.ts
// v2.0 — agrega usePeakHour y useGenres que consumen endpoints del backend

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

// ── Recently Played ──────────────────────────────────────────────────────────

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

// ── Peak Hour ────────────────────────────────────────────────────────────────

export const PEAK_HOUR_KEY = ['history', 'peak-hour'] as const

export function usePeakHour() {
  return useQuery({
    queryKey: PEAK_HOUR_KEY,
    queryFn: endpoints.history.peakHour,
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  })
}

// ── Genres ───────────────────────────────────────────────────────────────────

export const GENRES_KEY = ['history', 'genres'] as const

export function useGenres() {
  return useQuery({
    queryKey: GENRES_KEY,
    queryFn: endpoints.history.genres,
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
    select: (data) => ({
      ...data,
      genres: data.genres ?? [],
    }),
  })
}