// frontend/src/components/dashboard/TopArtistsCard.tsx

import { memo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useTopArtists } from '@/hooks/useTopArtists'
import { useArtistBarData } from '@/lib/chartUtils'

const COLORS = [
  '#1DB954','#17c560','#1ed760','#60a5fa',
  '#a78bfa','#f472b6','#fb923c','#34d399',
  '#f59e0b','#e879f9',
]

const CustomTooltip = memo(function CustomTooltip({
  active, payload,
}: {
  active?: boolean
  payload?: { payload: { fullName: string; plays: number } }[]
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontSize: 'var(--text-xs)',
    }}>
      <div style={{ color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 4 }}>{d.fullName}</div>
      <div style={{ color: 'var(--color-text-secondary)' }}>{d.plays.toLocaleString()} reproducciones</div>
    </div>
  )
})

const TopArtistsCard = memo(function TopArtistsCard() {
  const { data, isLoading } = useTopArtists()
  const chartData = useArtistBarData(data?.artists ?? [])

  if (isLoading) return <SkeletonCard />

  return (
    <Card>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Top Artistas
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.03em' }}>
          {data?.total ?? 0}{' '}
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>artistas</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontFamily: 'var(--font-body)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="plays" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={1 - i * 0.06} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
})

export default TopArtistsCard
