import React, { Component } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ScriptForge Error Boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 40,
            fontFamily: 'monospace',
            color: '#ff6b6b',
            background: '#0f1117',
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <h1 style={{ marginBottom: 8 }}>⚡ ScriptForge — Error</h1>
          <p style={{ color: '#a1a1aa' }}>Something went wrong during rendering:</p>
          <pre
            style={{
              color: '#e4e4e7',
              background: '#1e2130',
              padding: 16,
              borderRadius: 8,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              fontSize: 13,
              marginTop: 12,
            }}
          >
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => {
              localStorage.removeItem('scriptforge-storage');
              window.location.reload();
            }}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Clear saved data &amp; reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
