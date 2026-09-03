'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Key, AlertCircle, Check } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Zurücksetzen.');
      } else {
        setSuccess(data.message);
        setTimeout(() => router.push('/'), 2500);
      }
    } catch {
      setError('Verbindungsfehler zum Server.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle size={32} className="mx-auto text-red-400" />
        <h2 className="text-xl font-bold text-white">Ungültiger Link</h2>
        <p className="text-xs text-slate-400">Der Reset-Link fehlt oder ist unvollständig.</p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
          <Key size={24} />
        </div>
        <h2 className="text-xl font-bold text-white">Neues Passwort festlegen</h2>
        <p className="text-xs text-slate-400">Gib dein neues Admin-Passwort ein.</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check size={16} /> <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Neues Passwort</label>
          <input type="password" required minLength={6} value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••" className="input-field w-full text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Passwort bestätigen</label>
          <input type="password" required minLength={6} value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••" className="input-field w-full text-xs" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full text-xs py-3 mt-2">
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <span>Passwort jetzt zurücksetzen</span>}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 space-y-6 border border-slate-800">
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
