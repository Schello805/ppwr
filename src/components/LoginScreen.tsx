'use client';

import { useState } from 'react';
import { Lock, User, Key, LogIn, AlertCircle, Package, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Anmeldung fehlgeschlagen');
      } else {
        onLoginSuccess();
      }
    } catch {
      setError('Verbindungsfehler zum Server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6">
      {/* Top bar branding */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">PPWR Compliance Manager</h1>
            <p className="text-[11px] text-slate-400">Verpackungsverordnung EU • Revisionssicher</p>
          </div>
        </div>
        <span className="badge-green text-xs">
          <ShieldCheck size={13} />
          Geschützter Bereich
        </span>
      </div>

      {/* Main Login Card */}
      <div className="flex items-center justify-center py-12">
        <div className="glass-panel w-full max-w-md rounded-2xl p-8 shadow-2xl border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-bold text-white">Anmeldung erforderlich</h2>
            <p className="text-xs text-slate-400">
              Bitte melde dich an, um auf die PPWR-Dokumentenverwaltung und den Barcode-Generator zuzugreifen.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Benutzername</label>
              <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 h-11 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <User size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Passwort</label>
              <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 h-11 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <Key size={18} className="text-slate-400 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-full text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Anmelden</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Ersteinrichtung Zugangsdaten: <span className="font-mono text-slate-400">admin</span> / <span className="font-mono text-slate-400">password123</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-[11px] text-slate-600 py-2">
        © 2026 PPWR Compliance Manager • System geschützt
      </div>
    </div>
  );
}
