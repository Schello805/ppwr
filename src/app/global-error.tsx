'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
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
    <html lang="de" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-4 border border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Systemfehler</h2>
            <p className="text-xs text-slate-400">Ein schwerwiegender Fehler ist aufgetreten.</p>
          </div>
          <button onClick={() => reset()} className="btn-primary w-full text-xs">
            <RefreshCw size={14} />
            <span>Erneut versuchen</span>
          </button>
        </div>
      </body>
    </html>
  );
}
