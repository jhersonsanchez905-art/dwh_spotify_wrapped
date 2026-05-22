// frontend/src/components/ui/ErrorBoundary.tsx

import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 'var(--space-4)' }}>⚠️</div>
          <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Algo salió mal en este componente.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
          <details style={{ marginTop: 'var(--space-4)', textAlign: 'left' }}>
            <summary style={{ fontSize: 11, color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
              Detalles del error
            </summary>
            <pre style={{
              marginTop: 8,
              fontSize: 11,
              color: 'var(--color-danger)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {this.state.error.message}
            </pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}
