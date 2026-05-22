// frontend/src/pages/Dashboard.tsx

import { useNavigate } from 'react-router-dom'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import Navbar from '@/components/layout/Navbar'
import PageTransition from '@/components/ui/PageTransition'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import StatsSummaryRow from '@/components/dashboard/StatsSummaryRow'
import TopArtistsCard from '@/components/dashboard/TopArtistsCard'
import TopTracksCard from '@/components/dashboard/TopTracksCard'
import GenresCard from '@/components/dashboard/GenresCard'
import PeakHourCard from '@/components/dashboard/PeakHourCard'
import HeatmapCard from '@/components/dashboard/HeatmapCard'
import PopularityCard from '@/components/dashboard/PopularityCard'
import { useTopArtists } from '@/hooks/useTopArtists'
import { useTopTracks } from '@/hooks/useTopTracks'
import { useRecentlyPlayed } from '@/hooks/useHistory'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: artistsData, isLoading: la } = useTopArtists()
  const { data: tracksData,  isLoading: lt } = useTopTracks()
  const { data: historyData, isLoading: lh } = useRecentlyPlayed()

  const isLoading = la || lt || lh
  const hasData =
    (artistsData?.artists?.length ?? 0) > 0 ||
    (tracksData?.tracks?.length   ?? 0) > 0 ||
    (historyData?.items?.length   ?? 0) > 0

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
        <Navbar />
        <PageTransition>
          <main className="page-main">

            {/* Header */}
            <div className="anim-fade-up" style={{ marginBottom: 'var(--space-8)' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-4xl)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                marginBottom: 'var(--space-2)',
              }}>
                Tu <span style={{ color: 'var(--color-accent)' }}>Wrapped</span>
              </h1>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                Estadísticas personales extraídas de tu cuenta de Spotify
              </p>
            </div>

            {/* Loading */}
            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="stats-row">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
                <div className="dashboard-grid">
                  {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !hasData && (
              <EmptyState
                icon="🎵"
                title="Sin datos aún"
                description="Sincroniza tu cuenta de Spotify para ver tus estadísticas. El proceso tarda menos de un minuto."
                action={{ label: '→ Ir a Sincronizar', onClick: () => navigate('/etl') }}
              />
            )}

            {/* Charts */}
            {!isLoading && hasData && (
              <>
                <StatsSummaryRow />

                <div className="dashboard-grid anim-stagger">
                  {/* Row 1 */}
                  <div className="col-left">  <TopArtistsCard /> </div>
                  <div className="col-right"> <TopTracksCard />  </div>

                  {/* Row 2 — full width */}
                  <div className="col-full">  <GenresCard />     </div>

                  {/* Row 3 — full width */}
                  <div className="col-full">  <PeakHourCard />   </div>

                  {/* Row 4 — full width */}
                  <div className="col-full">  <HeatmapCard />    </div>

                  {/* Row 5 — full width */}
                  <div className="col-full">  <PopularityCard /> </div>
                </div>
              </>
            )}

          </main>
        </PageTransition>
      </div>
    </ProtectedRoute>
  )
}
