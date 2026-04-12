import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Debug: comprova que les variables d'entorn arriben
console.log('[Pedretes] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✓ OK' : '✗ MISSING');
console.log('[Pedretes] VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ OK' : '✗ MISSING');

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#b87333' }}>
          <h1>⚠️ Error carregant l'app</h1>
          <pre style={{ background: '#fef3c7', padding: 16, borderRadius: 8, fontSize: 13 }}>
            {this.state.error}
          </pre>
          <p style={{ color: '#666', fontSize: 13 }}>Comprova la consola del navegador (F12) per més detalls.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No s\'ha trobat el element #root');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
