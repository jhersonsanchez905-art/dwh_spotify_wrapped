// frontend/src/components/dashboard/TopTracksCard.tsx

import Card from '@/components/ui/Card'
import { SkeletonListItem } from '@/components/ui/Skeleton'
import { useTopTracks } from '@/hooks/useTopTracks'
import { formatDuration } from '@/types/track'

export default function TopTracksCard() {
  const { data, isLoading } = useTopTracks()

  if (isLoading) return (
    <Card>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Top Tracks</div>
      </div>
      {[...Array(8)].map((_, i) => <SkeletonListItem key={i} />)}
    </Card>
  )

  const tracks = (data?.tracks ?? []).slice(0, 10)

  return (
    <Card>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Top Tracks
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.03em' }}>
          {data?.total ?? 0} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>canciones</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tracks.map((track, i) => (
          <div
            key={track.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr auto',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '8px 0',
              borderBottom: i < tracks.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
            }}
          >
            {/* Rank */}
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xs)',
              color: i < 3 ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              fontWeight: 700,
              textAlign: 'right',
            }}>
              {i + 1}
            </span>

            {/* Name + artist + popularity bar */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 3,
              }}>
                {track.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                {track.artist_name}
              </div>
              {/* Popularity bar */}
              <div style={{ height: 2, background: 'var(--color-border-subtle)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${track.popularity}%`,
                  background: `hsl(${track.popularity * 1.2}, 70%, 50%)`,
                  borderRadius: 1,
                  transition: 'width 0.6s var(--ease-out)',
                }} />
              </div>
            </div>

            {/* Duration */}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              flexShrink: 0,
            }}>
              {formatDuration(track.duration_ms)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
