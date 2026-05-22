// frontend/src/lib/chartUtils.ts

import { useMemo } from 'react'
import type { Artist } from '@/types/artist'
import type { Track } from '@/types/track'
import type { ListeningHistoryItem, HourlyData, DailyData, HeatmapCell } from '@/types/history'
import { DAY_NAMES } from '@/types/history'

// ── Pure transform functions ──────────────────────────────────────────────────

export function toArtistBarData(artists: Artist[]) {
  return artists.slice(0, 10).map((a) => ({
    name: a.name.length > 20 ? a.name.slice(0, 18) + '…' : a.name,
    fullName: a.name,
    plays: a.play_count ?? a.popularity,
    popularity: a.popularity,
  }))
}

export function toGenreData(artists: Artist[]) {
  const freq: Record<string, number> = {}
  artists.forEach((a) => {
    a.genres.forEach((g) => { freq[g] = (freq[g] ?? 0) + 1 })
  })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, value]) => ({ name, value }))
}

export function toGenreTreemap(artists: Artist[]) {
  return { name: 'Géneros', children: toGenreData(artists).map((g) => ({ name: g.name, size: g.value })) }
}

export function toHeatmapData(items: ListeningHistoryItem[]): HeatmapCell[] {
  const matrix: Record<string, Record<string, number>> = {}
  DAY_NAMES.forEach((day) => {
    matrix[day] = {}
    for (let h = 0; h < 24; h++) matrix[day][String(h)] = 0
  })
  items.forEach((item) => {
    const day = DAY_NAMES[item.day_of_week % 7]
    const hour = String(item.hour_of_day)
    if (matrix[day]?.[hour] !== undefined) matrix[day][hour] += 1
  })
  const cells: HeatmapCell[] = []
  DAY_NAMES.forEach((day) => {
    for (let h = 0; h < 24; h++) cells.push({ day, hour: String(h), value: matrix[day][String(h)] })
  })
  return cells
}

export function toHourlyData(items: ListeningHistoryItem[]): HourlyData[] {
  const counts = new Array<number>(24).fill(0)
  items.forEach((i) => { counts[i.hour_of_day] += 1 })
  return counts.map((count, hour) => ({ hour, count }))
}

export function toDailyData(items: ListeningHistoryItem[]): DailyData[] {
  const counts = new Array<number>(7).fill(0)
  items.forEach((i) => { counts[i.day_of_week % 7] += 1 })
  return DAY_NAMES.map((day_name, day) => ({ day, day_name, count: counts[day] }))
    .sort((a, b) => b.count - a.count)
}

export function toPopularityHistogram(tracks: Track[]) {
  const buckets = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  const counts: Record<string, number> = {}
  for (let i = 0; i < buckets.length - 1; i++) counts[`${buckets[i]}–${buckets[i + 1]}`] = 0
  tracks.forEach((t) => {
    for (let i = 0; i < buckets.length - 1; i++) {
      if (t.popularity >= buckets[i] && t.popularity < buckets[i + 1]) {
        counts[`${buckets[i]}–${buckets[i + 1]}`] += 1
        break
      }
    }
  })
  return Object.entries(counts).map(([range, count]) => ({ range, count }))
}

export function toPopularityCategories(tracks: Track[]) {
  const cats = { underground: 0, emerging: 0, mainstream: 0, viral: 0 }
  tracks.forEach((t) => {
    if      (t.popularity < 30) cats.underground += 1
    else if (t.popularity < 60) cats.emerging    += 1
    else if (t.popularity < 80) cats.mainstream  += 1
    else                        cats.viral       += 1
  })
  return [
    { name: 'Underground', value: cats.underground, color: '#a78bfa' },
    { name: 'Emerging',    value: cats.emerging,    color: '#60a5fa' },
    { name: 'Mainstream',  value: cats.mainstream,  color: '#1DB954' },
    { name: 'Viral',       value: cats.viral,       color: '#f59e0b' },
  ].filter((c) => c.value > 0)
}

export function toDurationBuckets(tracks: Track[]) {
  const buckets: Record<string, number> = {
    '0–1m': 0, '1–2m': 0, '2–3m': 0, '3–4m': 0,
    '4–5m': 0, '5–6m': 0, '6m+': 0,
  }
  tracks.forEach((t) => {
    const min = t.duration_ms / 60000
    if      (min < 1) buckets['0–1m'] += 1
    else if (min < 2) buckets['1–2m'] += 1
    else if (min < 3) buckets['2–3m'] += 1
    else if (min < 4) buckets['3–4m'] += 1
    else if (min < 5) buckets['4–5m'] += 1
    else if (min < 6) buckets['5–6m'] += 1
    else              buckets['6m+']  += 1
  })
  return Object.entries(buckets).map(([range, count]) => ({ range, count }))
}

export function toParetoData(artists: Artist[]) {
  const sorted = [...artists].sort(
    (a, b) => (b.play_count ?? b.popularity) - (a.play_count ?? a.popularity)
  )
  const total = sorted.reduce((s, a) => s + (a.play_count ?? a.popularity), 0)
  let cumulative = 0
  return sorted.map((a, i) => {
    cumulative += a.play_count ?? a.popularity
    return {
      rank: i + 1,
      name: a.name.length > 14 ? a.name.slice(0, 12) + '…' : a.name,
      plays: a.play_count ?? a.popularity,
      cumPct: Math.round((cumulative / total) * 100),
    }
  })
}

export function avgPopularity(tracks: Track[]): number {
  if (!tracks.length) return 0
  return Math.round(tracks.reduce((s, t) => s + t.popularity, 0) / tracks.length)
}

export function avgDurationMin(tracks: Track[]): string {
  if (!tracks.length) return '0:00'
  const avgMs = tracks.reduce((s, t) => s + t.duration_ms, 0) / tracks.length
  const min = Math.floor(avgMs / 60000)
  const sec = Math.round((avgMs % 60000) / 1000)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// ── useMemo hooks for expensive chart transforms ──────────────────────────────

export function useArtistBarData(artists: Artist[]) {
  return useMemo(() => toArtistBarData(artists), [artists])
}

export function useGenreData(artists: Artist[]) {
  return useMemo(() => toGenreData(artists), [artists])
}

export function useHeatmapData(items: ListeningHistoryItem[]) {
  return useMemo(() => toHeatmapData(items), [items])
}

export function useHourlyData(items: ListeningHistoryItem[]) {
  return useMemo(() => toHourlyData(items), [items])
}

export function usePopularityHistogram(tracks: Track[]) {
  return useMemo(() => toPopularityHistogram(tracks), [tracks])
}

export function usePopularityCategories(tracks: Track[]) {
  return useMemo(() => toPopularityCategories(tracks), [tracks])
}
