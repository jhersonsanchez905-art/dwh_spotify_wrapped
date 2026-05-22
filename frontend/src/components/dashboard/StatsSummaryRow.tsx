// frontend/src/components/dashboard/StatsSummaryRow.tsx

import AnimatedNumber from '@/components/ui/AnimatedNumber'
import Tooltip from '@/components/ui/Tooltip'
import { useTopArtists } from '@/hooks/useTopArtists'
import { useTopTracks } from '@/hooks/useTopTracks'
import { useRecentlyPlayed } from '@/hooks/useHistory'
import { avgPopularity, avgDurationMin, toHourlyData } from '@/lib/chartUtils'

interface StatProps {
  label: string
  value: number
  displayValue?: string
  sub?: string
  accent?: boolean
  tooltip?: string
  format?: (n: number) => string
}

function Stat({ label, value, displayValue, sub, accent, tooltip, format }: StatProps) {
  const card = (
    <div
      className="card-hover anim-fade-up"
      style={{
        background: 'var(--color-bg-card)',
        border: accent
          ? '1px solid var(--color-accent-dim)'
          : '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5) var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        cursor: tooltip ? 'help' : 'default',
      }}
    >
      <span style={{
        fontSize: 10,
        color: 'var(--color-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        {label}
      </span>

      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)',
        lineHeight: 1,
      }}>
        {displayValue ?? (
          <AnimatedNumber
            value={value}
            format={format ?? ((n) => Math.round(n).toLocaleString())}
          />
        )}
      </span>

      {sub && (
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
          {sub}
        </span>
      )}
    </div>
  )

  if (tooltip) return <Tooltip content={tooltip}>{card}</Tooltip>
  return card
}

export default function StatsSummaryRow() {
  const { data: artistsData } = useTopArtists()
  const { data: tracksData }  = useTopTracks()
  const { data: historyData } = useRecentlyPlayed()

  const artists = artistsData?.artists ?? []
  const tracks  = tracksData?.tracks   ?? []
  const history = historyData?.items   ?? []

  const hourly   = toHourlyData(history)
  const peakHour = hourly.reduce((m, h) => h.count > m.count ? h : m, { hour: 0, count: 0 })

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
        tooltip="Artistas en dim_artists"
      />
      <Stat
        label="Top tracks"
        value={tracks.length}
        sub="únicas"
        tooltip="Canciones en dim_tracks"
      />
      <Stat
        label="Popularidad avg"
        value={avgPopularity(tracks)}
        sub="de 100"
        tooltip="Promedio de popularity de tus top tracks (0–100)"
      />
      <Stat
        label="Duración avg"
        value={0}
        displayValue={avgDurationMin(tracks)}
        sub="por canción"
        tooltip="Duración promedio de tus canciones en minutos"
      />
      <Stat
        label="Hora pico"
        value={0}
        displayValue={peakHour.count > 0 ? `${peakHour.hour}:00` : '—'}
        sub={`${peakHour.count} plays`}
        tooltip="Hora del día con más reproducciones"
      />
    </div>
  )
}
