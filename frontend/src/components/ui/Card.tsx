// frontend/src/components/ui/Card.tsx

import type { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  hoverable?: boolean
  padding?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

const paddingMap = {
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
}

export default function Card({
  children,
  style,
  onClick,
  hoverable = false,
  padding = 'md',
  glow = false,
  className = '',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`${hoverable ? 'card-hover' : ''} ${glow ? 'anim-glow' : ''} ${className}`}
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: paddingMap[padding],
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
