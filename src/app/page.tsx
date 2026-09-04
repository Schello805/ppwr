'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import UploadTab from '@/components/UploadTab';
import ArchiveTab from '@/components/ArchiveTab';
import LoginScreen from '@/components/LoginScreen';
import SettingsView from '@/components/SettingsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'archive' | 'settings'>('upload');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setAuthenticated(data.authenticated);
        setUsername(data.user?.username);
      } else {
        setAuthenticated(false);
        setUsername(undefined);
      }
    } catch {
      setAuthenticated(false);
      setUsername(undefined);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
    setUsername(undefined);
  };

  // Loading spinner during initial auth check
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, render full-screen login protection
  if (!authenticated) {
    return <LoginScreen onLoginSuccess={checkAuth} />;
  }

  // Authenticated full app view
  return (
    <div className="min-h-screen flex flex-col justify-between" key={refreshKey}>
      <div>
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          username={username}
          onLogout={handleLogout}
        />

        <main className="w-[92%] max-w-[2000px] mx-auto py-8">
          {activeTab === 'upload' && <UploadTab />}
          {activeTab === 'archive' && <ArchiveTab />}
          {activeTab === 'settings' && (
            <SettingsView
              onSettingsUpdated={() => {
                setRefreshKey((k) => k + 1);
              }}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 mt-12 bg-slate-950/80">
        <div className="w-[92%] max-w-[2000px] mx-auto text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 PPWR Compliance Manager • Revisionsgesicherte Verpackungscodes (QR / DataMatrix)</p>
          <p className="font-mono text-slate-600">Ubuntu Linux ready • SHA-256 Audit Trail</p>
        </div>
      </footer>
    </div>
  );
}
