// frontend/src/components/dashboard/GenresCard.tsx
// v2.0 — consume /v1/history/genres en lugar de calcular en cliente
//        + estado vacío explícito cuando no hay géneros

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useGenres } from '@/hooks/useHistory'

const PALETTE = [
  '#1DB954','#17a349','#60a5fa','#3b82f6',
  '#a78bfa','#8b5cf6','#f472b6','#ec4899',
  '#fb923c','#f97316','#34d399','#10b981',
  '#e879f9','#f59e0b','#fbbf24',
]

function CustomContent(props: {
  x?: number; y?: number; width?: number; height?: number;
  name?: string; value?: number; index?: number
}) {
  const { x = 0, y = 0, width = 0, height = 0, name = '', index = 0 } = props
  const color   = PALETTE[index % PALETTE.length]
  const showLabel = width > 50 && height > 30

  return (
    <g>
      <rect
        x={x + 1} y={y + 1}
        width={width - 2} height={height - 2}
        style={{ fill: color, opacity: 0.85 }}
        rx={6}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: '#fff',
            fontSize: Math.min(13, width / 7),
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          {name.length > 14 ? name.slice(0, 12) + '…' : name}
        </text>
      )}
    </g>
  )
}

function GenreTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontSize: 'var(--text-xs)',
    }}>
      <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{payload[0].name}</div>
      <div style={{ color: 'var(--color-text-secondary)' }}>{payload[0].value} artistas</div>
    </div>
  )
}

export default function GenresCard() {
  const { data, isLoading } = useGenres()

  if (isLoading) return <SkeletonCard />

  // Los géneros vienen del backend: { genre: string, artist_count: number }[]
  const rawGenres = data?.genres ?? []
  // Mapear al formato que espera Treemap
  const treemapData = rawGenres.map((g) => ({ name: g.genre, size: g.artist_count }))

  return (
    <Card style={{ gridColumn: 'span 2' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 4,
        }}>
          Géneros musicales
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
        }}>
          {rawGenres.length}{' '}
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>
            géneros distintos
          </span>
        </div>
      </div>

      {/* Estado vacío explícito — evita el bloque verde sólido */}
      {rawGenres.length === 0 ? (
        <div style={{
          height: 240,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-sm)',
        }}>
          Sin datos de géneros. Sincroniza tu cuenta para ver resultados.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              content={<CustomContent />}
            >
              <Tooltip content={<GenreTooltip />} />
            </Treemap>
          </ResponsiveContainer>

          {/* Leyenda top 8 */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-4)',
          }}>
            {rawGenres.slice(0, 8).map((g, i) => (
              <span key={g.genre} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                color: 'var(--color-text-secondary)',
              }}>
                <span style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: PALETTE[i % PALETTE.length],
                  flexShrink: 0,
                }} />
                {g.genre}
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}