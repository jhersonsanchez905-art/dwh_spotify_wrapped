// frontend/src/types/history.ts

export interface ListeningHistoryItem {
  id: string
  track_id: string
  track_name: string
  artist_name: string
  played_at: string
  hour_of_day: number
  day_of_week: number
  duration_ms: number
}

export interface RecentlyPlayedResponse {
  items: ListeningHistoryItem[]
  total: number
  next_cursor?: number
}

export interface HourlyData {
  hour: number
  count: number
}

export interface DailyData {
  day: number
  day_name: string
  count: number
}

export interface HeatmapCell {
  day: string
  hour: string
  value: number
}

export const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const
export type DayName = (typeof DAY_NAMES)[number]
