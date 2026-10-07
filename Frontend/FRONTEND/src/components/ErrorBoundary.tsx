import { Component, type ErrorInfo, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('App crashed:', error, info.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold">Something broke while rendering</h1>
        <p className="mt-2 text-sm text-muted">Reload the page. If it keeps happening, this message is what to report:</p>
        <pre className="mt-4 overflow-x-auto rounded-md border border-line bg-white p-4 text-xs">{this.state.error.stack ?? this.state.error.message}</pre>
        <button className="btn-primary mt-4" onClick={() => { try { localStorage.clear(); } catch { /* ignore */ } location.href = '/'; }}>Clear saved data and reload</button>
      </div>
    );
  }
}
