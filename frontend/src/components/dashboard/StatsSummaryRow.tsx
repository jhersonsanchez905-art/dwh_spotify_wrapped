// frontend/src/components/dashboard/StatsSummaryRow.tsx
// v2.0 — usa play_count real de artistas/tracks, peak-hour del backend

import { useMemo } from 'react'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useTopArtists } from '@/hooks/useTopArtists'
import { useTopTracks } from '@/hooks/useTopTracks'
import { useRecentlyPlayed, usePeakHour } from '@/hooks/useHistory'
import { avgPopularity, avgDurationMin } from '@/lib/chartUtils'

function Stat({
  label,
  value,
  displayValue,
  sub,
  accent,
  tooltip,
}: {
  label: string
  value: number
  displayValue?: string
  sub?: string
  accent?: boolean
  tooltip?: string
}) {
  return (
    <Card
      style={{ flex: 1, minWidth: 0 }}
      title={tooltip}
    >
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)',
      }}>
        {displayValue ?? value}
      </div>
      {sub && (
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)',
          marginTop: 2,
        }}>
          {sub}
        </div>
      )}
    </Card>
  )
}

export default function StatsSummaryRow() {
  const { data: artistsData } = useTopArtists()
  const { data: tracksData  } = useTopTracks()
  const { data: historyData } = useRecentlyPlayed()
  const { data: peakHourData } = usePeakHour()

  const artists = artistsData?.artists ?? []
  const tracks  = tracksData?.tracks   ?? []
  const history = historyData?.items   ?? []

  // Popularidad promedio real (viene del backend con popularity real de Spotify)
  const avgPop = useMemo(() => avgPopularity(tracks), [tracks])

  // Hora pico desde el backend (ya calculada analíticamente sobre TODO el historial)
  const peakHour = peakHourData?.hour_of_day
  const peakCount = peakHourData?.play_count ?? 0

  return (
    <div className="stats-row" style={{ marginBottom: 'var(--space-6)' }}>
      <Stat
        label="Reproducciones"
        value={history.length}
        sub="en historial"
        accent
        tooltip="Total de reproducciones registradas en fact_listening_history"
      />
      <Stat
        label="Top artistas"
        value={artists.length}
        sub="únicos"
        tooltip="Artistas en dim_artists escuchados por ti"
      />
      <Stat
        label="Top tracks"
        value={tracks.length}
        sub="únicas"
        tooltip="Canciones en dim_tracks escuchadas por ti"
      />
      <Stat
        label="Popularidad avg"
        value={avgPop}
        sub="de 100"
        tooltip="Promedio de popularity de tus top tracks (0–100)"
      />
      <Stat
        label="Duración avg"
        value={0}
        displayValue={avgDurationMin(tracks)}
        sub="por canción"
        tooltip="Duración promedio de tus canciones"
      />
      <Stat
        label="Hora pico"
        value={0}
        displayValue={
          peakHour !== null && peakHour !== undefined
            ? `${String(peakHour).padStart(2, '0')}:00`
            : '—'
        }
        sub={peakCount > 0 ? `${peakCount} plays` : ''}
        tooltip="Hora del día con más reproducciones (calculado sobre todo el historial)"
      />
    </div>
  )
}