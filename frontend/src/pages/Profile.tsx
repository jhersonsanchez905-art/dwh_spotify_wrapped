// frontend/src/pages/Profile.tsx

import ProtectedRoute from '@/components/layout/ProtectedRoute'
import Navbar from '@/components/layout/Navbar'
import PageTransition from '@/components/ui/PageTransition'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import AnimatedNumber from '@/components/ui/AnimatedNumber'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useProfile } from '@/hooks/useProfile'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="row-hover"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-3) var(--space-2)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export default function Profile() {
  const { data: profile, isLoading, isError } = useProfile()

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
        <Navbar />
        <PageTransition>
          <main className="page-main" style={{ maxWidth: 720 }}>
            <h1
              className="anim-fade-up"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: 'var(--space-8)',
              }}
            >
              Perfil
            </h1>

            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {isError && (
              <Card>
                <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
                  No se pudo cargar el perfil. Verifica que el backend esté corriendo.
                </p>
              </Card>
            )}

            {profile && (
              <div className="anim-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                {/* Hero card */}
                <Card hoverable>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                    <Avatar src={profile.images?.[0]?.url} name={profile.display_name} size="xl" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 4 }}>
                        <h2 style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'var(--text-2xl)',
                          fontWeight: 700,
                          letterSpacing: '-0.03em',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {profile.display_name}
                        </h2>
                        <Badge variant={profile.product === 'premium' ? 'accent' : 'default'}>
                          {profile.product === 'premium' ? '✦ Premium' : 'Free'}
                        </Badge>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-4)',
                    marginTop: 'var(--space-6)',
                    paddingTop: 'var(--space-6)',
                    borderTop: '1px solid var(--color-border-subtle)',
                    textAlign: 'center',
                  }}>
                    {[
                      { label: 'Seguidores', value: profile.followers },
                      { label: 'País', raw: profile.country },
                      { label: 'Plan', raw: profile.product === 'premium' ? 'Premium' : 'Free' },
                    ].map(({ label, value, raw }) => (
                      <div key={label}>
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'var(--text-2xl)',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)',
                          letterSpacing: '-0.03em',
                          marginBottom: 4,
                        }}>
                          {value !== undefined
                            ? <AnimatedNumber value={value} />
                            : raw
                          }
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Details */}
                <Card>
                  <h3 style={{
                    fontSize: 11,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    marginBottom: 'var(--space-2)',
                  }}>
                    Información de cuenta
                  </h3>
                  <InfoRow label="Spotify ID"  value={profile.spotify_id} />
                  <InfoRow label="Email"        value={profile.email} />
                  <InfoRow label="País"         value={profile.country} />
                  <InfoRow label="Plan"         value={profile.product === 'premium' ? 'Spotify Premium' : 'Spotify Free'} />
                  {profile.updated_at && (
                    <InfoRow
                      label="Última sync"
                      value={new Date(profile.updated_at).toLocaleDateString('es-CO', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    />
                  )}
                </Card>

              </div>
            )}
          </main>
        </PageTransition>
      </div>
    </ProtectedRoute>
  )
}
