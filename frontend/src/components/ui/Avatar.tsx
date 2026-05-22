// frontend/src/components/ui/Avatar.tsx

interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function Avatar({ src, name = '', size = 'md' }: AvatarProps) {
  const px = sizeMap[size]
  const fontSize = px * 0.36

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={px}
        height={px}
        style={{
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '1px solid var(--color-border-subtle)',
        }}
      />
    )
  }

  return (
    <div
      aria-label={name}
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        background: 'var(--color-accent-alpha)',
        border: '1px solid var(--color-accent-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize,
        color: 'var(--color-accent)',
        letterSpacing: '-0.02em',
      }}
    >
      {initials(name)}
    </div>
  )
}
