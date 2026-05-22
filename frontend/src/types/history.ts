// frontend/src/types/history.ts
// v2.0 — agrega PeakHourResponse y GenresResponse

export interface ListeningHistoryItem {
  id: number
  user_id: number
  track_id: number
  artist_id: number
  played_at: string
  hour_of_day: number
  /** Ahora siempre llega como número (0=Monday … 6=Sunday) normalizado en el backend */
  day_of_week: number
  context_type: string
  track_name: string
  artist_name: string
}

export interface RecentlyPlayedResponse {
  items: ListeningHistoryItem[]
  total: number
}

// ── NUEVOS ──────────────────────────────────────────────────────────────────

export interface PeakHourResponse {
  hour_of_day: number | null
  play_count: number
}

export interface GenreItem {
  genre: string
  artist_count: number
}

export interface GenresResponse {
  genres: GenreItem[]
  total: number
}

// ── Utilidades para chartUtils ───────────────────────────────────────────────

export const DAY_NAMES = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const

export type DayName = (typeof DAY_NAMES)[number]

export interface HourlyData  { hour: number; count: number }
export interface DailyData   { day: string;  count: number }
export interface HeatmapCell { day: string; hour: number; count: number }