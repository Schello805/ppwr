'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full space-y-4 border border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Ein Fehler ist aufgetreten</h2>
          <p className="text-xs text-slate-400">
            {error.message || 'Beim Laden der Seite ist ein unerwarteter Fehler aufgetreten.'}
          </p>
        </div>
        <button onClick={() => reset()} className="btn-primary w-full text-xs">
          <RefreshCw size={14} />
          <span>Erneut versuchen</span>
        </button>
      </div>
    </div>
  );
}
