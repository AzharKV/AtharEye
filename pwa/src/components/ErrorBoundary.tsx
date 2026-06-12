// ErrorBoundary.tsx — production safety net. Keeps a render error from blanking
// the app to white; shows a calm branded recovery screen instead.
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { T } from '../theme';
import { Mark, Wordmark } from './Brand';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[OptiSync] render error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: T.bg,
          color: T.text,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          fontFamily: T.font,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mark size={36} />
          <Wordmark size={20} />
        </div>
        <div style={{ fontSize: 15, color: T.muted, maxWidth: 280, lineHeight: 1.5 }}>
          Something went wrong. Reopen the app to continue.
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            height: 48,
            padding: '0 22px',
            borderRadius: 14,
            border: 'none',
            background: T.navy,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: T.font,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
