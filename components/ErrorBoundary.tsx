import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State { error: Error | null; }

/** Last line of defence: shows a friendly reload screen instead of a blank page. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Pedretes] Unhandled error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
        <div className="card max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-xl font-semibold text-ink-900">Etwas ist schiefgelaufen</h1>
          <p className="mt-2 text-sm text-ink-500">Die Seite konnte nicht geladen werden. Lade sie neu — deine Daten sind sicher.</p>
          <pre className="mt-4 max-h-24 overflow-auto rounded-lg bg-cream-100 p-3 text-left text-[11px] text-ink-500">{this.state.error.message}</pre>
          <button onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-copper-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-copper-700">
            Neu laden
          </button>
        </div>
      </div>
    );
  }
}
