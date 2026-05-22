// frontend/src/components/ui/Skeleton.tsx

import type { CSSProperties } from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  style?: CSSProperties
}

export default function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 'var(--radius-md)',
  style,
}: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      <Skeleton height={11} width="35%" />
      <Skeleton height={36} width="55%" borderRadius="var(--radius-lg)" />
      <div style={{ height: 'var(--space-2)' }} />
      <Skeleton height={12} width="90%" />
      <Skeleton height={12} width="75%" />
      <Skeleton height={12} width="82%" />
    </div>
  )
}

export function SkeletonListItem() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-3) 0',
    }}>
      <Skeleton width={40} height={40} borderRadius="var(--radius-md)" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton height={12} width="60%" />
        <Skeleton height={10} width="40%" />
      </div>
      <Skeleton height={10} width={32} />
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ['90%', '75%', '83%', '68%', '88%']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={widths[i % widths.length]} />
      ))}
    </div>
  )
}
