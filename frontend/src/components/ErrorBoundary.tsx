import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NanoTech Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary, #0a0d14)',
          color: 'var(--text-primary, #e6edf3)',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '24px',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--bg-card, #121824)',
            border: '1px solid var(--border, rgba(255,255,255,0.1))',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
              System Recovered
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #8b949e)', lineHeight: 1.5, margin: '0 0 24px' }}>
              The application encountered a display hiccup. You can reload the interface or reset local demo state.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <RefreshCw size={15} /> Reload Dashboard
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); } catch {}
                  window.location.href = '/';
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary, #8b949e)',
                  border: '1px solid var(--border, rgba(255,255,255,0.15))',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
