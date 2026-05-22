// frontend/src/components/dashboard/PopularityCard.tsx

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useTopTracks } from '@/hooks/useTopTracks'
import { toPopularityHistogram, toPopularityCategories, avgPopularity } from '@/lib/chartUtils'

function CatTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
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
      <div style={{ color: 'var(--color-text-secondary)' }}>{payload[0].value} canciones</div>
    </div>
  )
}

// ── Fix: usar unknown[] y castear — evita importar tipos internos de recharts ──
function renderLegend(props: unknown) {
  const { payload } = props as { payload?: { color?: string; value?: string }[] }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>
      {(payload ?? []).map((e, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.color ?? '#888', flexShrink: 0 }} />
          {e.value}
        </span>
      ))}
    </div>
  )
}

export default function PopularityCard() {
  const { data, isLoading } = useTopTracks()

  if (isLoading) return <SkeletonCard />

  const tracks     = data?.tracks ?? []
  const histogram  = toPopularityHistogram(tracks)
  const categories = toPopularityCategories(tracks)
  const avg        = avgPopularity(tracks)

  return (
    <Card style={{ gridColumn: 'span 2' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Popularidad
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.03em' }}>
          {avg}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>/100 promedio</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 'var(--space-6)', alignItems: 'center' }}>
        {/* Histogram */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>Distribución (0–100)</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={histogram} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="range"
                tick={{ fill: 'var(--color-text-tertiary)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CatTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={20}>
                {histogram.map((_, i) => (
                  <Cell key={i} fill={`hsl(${i * 12}, 65%, 50%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 4, textAlign: 'center' }}>Categorías</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={categories}
                dataKey="value"
                innerRadius={40}
                outerRadius={62}
                paddingAngle={2}
                strokeWidth={0}
              >
                {categories.map((c, i) => (
                  <Cell key={i} fill={c.color} />
                ))}
              </Pie>
              <Legend content={renderLegend} />
              <Tooltip content={<CatTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
