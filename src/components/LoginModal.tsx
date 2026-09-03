'use client';

import { useState } from 'react';
import { Lock, User, Key, X, LogIn, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError('Verbindungsfehler beim Server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative shadow-2xl border border-slate-700/80">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">PPWR Admin-Login</h2>
            <p className="text-xs text-slate-400">Anmeldung für Dokumenten-Upload & Revisionsverwaltung</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-sm text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Benutzername</label>
            <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <User size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Passwort</label>
            <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <Key size={18} className="text-slate-400 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-full text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Anmelden</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Standard-Login für Ersteinrichtung: <span className="font-mono text-slate-400">admin</span> / <span className="font-mono text-slate-400">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
