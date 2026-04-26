import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log('[Pedretes] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✓ OK' : '✗ MISSING');
console.log('[Pedretes] VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ OK' : '✗ MISSING');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("No s'ha trobat el element #root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
