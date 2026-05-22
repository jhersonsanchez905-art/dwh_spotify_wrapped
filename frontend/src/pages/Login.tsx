// frontend/src/pages/Login.tsx

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '@/lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard', { replace: true })
  }, [navigate])

  // Animated particle field
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    type P = { x: number; y: number; r: number; dx: number; dy: number; alpha: number; pulse: number }
    const particles: P[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.45 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }))

    let frame = 0
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      particles.forEach((p) => {
        p.pulse += 0.012
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(29,185,84,${a})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })

      // Connect nearby particles
      if (frame % 2 === 0) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 100) {
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.strokeStyle = `rgba(29,185,84,${0.08 * (1 - dist / 100)})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,185,84,0.07) 0%, transparent 65%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        animation: 'pulseScale 4s ease-in-out infinite',
      }} />

      {/* Card */}
      <div
        className="anim-scale-in"
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(22,22,22,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-12) var(--space-10)',
          width: '100%',
          maxWidth: 420,
          textAlign: 'center',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Animated logo */}
        <div
          className="anim-float"
          style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: 'var(--color-accent-alpha)',
            border: '1px solid rgba(29,185,84,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            boxShadow: '0 0 32px rgba(29,185,84,0.2)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" stroke="#1DB954" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="8"  stroke="#1DB954" strokeWidth="1.2" strokeOpacity="0.5"/>
            <circle cx="16" cy="16" r="3"  fill="#1DB954"/>
          </svg>
        </div>

        <h1
          className="anim-fade-up"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            marginBottom: 'var(--space-2)',
            animationDelay: '80ms',
          }}
        >
          Mi Spotify Wrapped
        </h1>

        <p
          className="anim-fade-up"
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-10)',
            lineHeight: 1.7,
            animationDelay: '140ms',
          }}
        >
          Tu Data Warehouse personal.<br />
          Conecta para ver tus estadísticas.
        </p>

        <button
          className="btn-press anim-fade-up"
          onClick={() => { window.location.href = `${API_URL}/v1/auth/login` }}
          style={{
            width: '100%',
            background: 'var(--color-accent)',
            color: '#000',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-base)',
            padding: 'var(--space-4) var(--space-6)',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'all var(--duration-normal) var(--ease-out)',
            animationDelay: '200ms',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.background = 'var(--color-accent-hover)'
            el.style.transform = 'translateY(-2px)'
            el.style.boxShadow = '0 8px 24px rgba(29,185,84,0.35)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.background = 'var(--color-accent)'
            el.style.transform = 'translateY(0)'
            el.style.boxShadow = 'none'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.622.622 0 01.207.857zm1.223-2.72a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.13-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.52-.972c3.632-1.102 8.147-.568 11.233 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.955 1.611z"/>
          </svg>
          Conectar con Spotify
        </button>

        <p
          className="anim-fade-up"
          style={{
            marginTop: 'var(--space-5)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            animationDelay: '260ms',
          }}
        >
          Sin registro · Sin contraseña · Solo OAuth
        </p>
      </div>
    </div>
  )
}
