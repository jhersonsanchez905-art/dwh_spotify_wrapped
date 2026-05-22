// frontend/src/components/layout/Navbar.tsx

import { useState, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { usePrefetchArtists } from '@/hooks/useTopArtists'
import { usePrefetchTracks } from '@/hooks/useTopTracks'
import { usePrefetchHistory } from '@/hooks/useHistory'
import Avatar from '@/components/ui/Avatar'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', prefetch: 'dashboard' },
  { to: '/profile',   label: 'Perfil',    prefetch: 'profile'   },
  { to: '/etl',       label: 'Sincronizar', prefetch: null       },
] as const

export default function Navbar() {
  const { logout } = useAuth()
  const { data: profile } = useProfile()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const prefetchArtists = usePrefetchArtists()
  const prefetchTracks  = usePrefetchTracks()
  const prefetchHistory = usePrefetchHistory()

  const handlePrefetch = useCallback((target: string | null) => {
    if (target === 'dashboard') {
      prefetchArtists()
      prefetchTracks()
      prefetchHistory()
    }
  }, [prefetchArtists, prefetchTracks, prefetchHistory])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      <nav
        style={{
          height: 'var(--layout-navbar-height)',
          background: 'rgba(10,10,10,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--layout-gutter)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          gap: 'var(--space-6)',
        }}
      >
        {/* Logo */}
        <NavLink
          to="/dashboard"
          onMouseEnter={() => handlePrefetch('dashboard')}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'var(--text-lg)',
            color: 'var(--color-accent)',
            letterSpacing: '-0.04em',
            textDecoration: 'none',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="#1DB954" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="5.5" stroke="#1DB954" strokeWidth="1.2" strokeOpacity="0.5"/>
            <circle cx="12" cy="12" r="2" fill="#1DB954"/>
          </svg>
          Wrapped
        </NavLink>

        {/* Desktop links */}
        <div className="nav-desktop-links" style={{ display: 'flex', gap: 'var(--space-1)', flex: 1 }}>
          {NAV_LINKS.map(({ to, label, prefetch }) => (
            <NavLink
              key={to}
              to={to}
              onMouseEnter={() => handlePrefetch(prefetch)}
              style={({ isActive }) => ({
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                transition: 'all var(--duration-fast) var(--ease-out)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              })}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                if (!el.getAttribute('aria-current')) el.style.color = 'var(--color-text-tertiary)'
              }}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginLeft: 'auto' }}>
          {profile && (
            <NavLink to="/profile" style={{ display: 'flex', textDecoration: 'none' }}>
              <Avatar src={profile.images?.[0]?.url} name={profile.display_name} size="sm" />
            </NavLink>
          )}

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              padding: '6px 14px',
              cursor: 'pointer',
              transition: 'all var(--duration-fast) var(--ease-out)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-strong)'
              e.currentTarget.style.color = 'var(--color-text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)'
              e.currentTarget.style.color = 'var(--color-text-tertiary)'
            }}
          >
            Salir
          </button>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
            style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-secondary)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{
          display: 'none', position: 'fixed',
          top: 'var(--layout-navbar-height)', left: 0, right: 0,
          background: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: 'var(--space-4) var(--layout-gutter)',
          zIndex: 99, flexDirection: 'column', gap: 'var(--space-2)',
          animation: 'fadeDown 0.2s var(--ease-out) both',
        }}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)', fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-accent-alpha2)' : 'transparent',
                textDecoration: 'none', display: 'block',
              })}
            >
              {label}
            </NavLink>
          ))}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <button onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '10px 14px', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop-links { display: none !important; }
          .nav-mobile-btn    { display: flex !important; }
          .nav-mobile-menu   { display: flex !important; }
        }
      `}</style>
    </>
  )
}
