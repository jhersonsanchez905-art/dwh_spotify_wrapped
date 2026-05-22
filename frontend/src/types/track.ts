// frontend/src/types/track.ts

export interface Track {
  id: string
  spotify_id: string
  name: string
  artist_id: string
  artist_name: string
  album_name?: string
  album_image?: string
  duration_ms: number
  popularity: number
  preview_url?: string
  play_count?: number
  rank?: number
}

export interface TopTracksResponse {
  tracks: Track[]
  total: number
  time_range?: 'short_term' | 'medium_term' | 'long_term'
}

export type PopularityCategory = 'underground' | 'emerging' | 'mainstream' | 'viral'

export function getPopularityCategory(score: number): PopularityCategory {
  if (score < 30) return 'underground'
  if (score < 60) return 'emerging'
  if (score < 80) return 'mainstream'
  return 'viral'
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
