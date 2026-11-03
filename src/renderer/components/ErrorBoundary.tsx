import React from 'react'

interface State { error: Error | null }

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh',
          background: '#0d1e4a', color: '#f8907e', fontFamily: 'monospace', padding: 32,
        }}>
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, maxWidth: 600, opacity: 0.8 }}>
            {this.state.error.message}
          </pre>
          <button
            style={{ marginTop: 20, padding: '8px 20px', cursor: 'pointer' }}
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
