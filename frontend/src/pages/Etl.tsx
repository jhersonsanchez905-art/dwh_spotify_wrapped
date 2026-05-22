// frontend/src/pages/Etl.tsx

import ProtectedRoute from '@/components/layout/ProtectedRoute'
import Navbar from '@/components/layout/Navbar'
import PageTransition from '@/components/ui/PageTransition'
import SyncButton from '@/components/etl/SyncButton'
import ETLLogStream from '@/components/etl/ETLLogStream'
import RunHistory from '@/components/etl/RunHistory'
import DwhStatusTable from '@/components/etl/DwhStatusTable'
import Card from '@/components/ui/Card'
import { useETLStatus } from '@/hooks/useETL'
import { useETLContext } from '@/context/ETLContext'

export default function Etl() {
  const { data: status, isLoading } = useETLStatus()
  const { isRunning, logSteps } = useETLContext()

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
        <Navbar />
        <PageTransition>
          <main className="page-main" style={{ maxWidth: 900 }}>

            {/* Header */}
            <div
              className="anim-fade-up"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-8)',
              }}
            >
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  marginBottom: 'var(--space-2)',
                }}>
                  Sincronización ETL
                </h1>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                  Extrae, transforma y carga tus datos de Spotify al Data Warehouse
                </p>
              </div>
              <SyncButton isRunning={isRunning || (status?.is_running ?? false)} />
            </div>

            <div
              className="anim-stagger"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <DwhStatusTable isLoading={isLoading} status={status} />

              {(isRunning || logSteps.length > 0) && (
                <ETLLogStream steps={logSteps} isRunning={isRunning} />
              )}

              <Card>
                <h2 style={{
                  fontSize: 11,
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  marginBottom: 'var(--space-4)',
                }}>
                  Historial de ejecuciones
                </h2>
                <RunHistory lastRun={status?.last_run} totalRuns={status?.total_runs ?? 0} />
              </Card>
            </div>

          </main>
        </PageTransition>
      </div>
    </ProtectedRoute>
  )
}
