'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import UploadTab from '@/components/UploadTab';
import ArchiveTab from '@/components/ArchiveTab';
import LoginScreen from '@/components/LoginScreen';
import SettingsModal from '@/components/SettingsModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'archive'>('upload');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'upload' ? (
            <UploadTab />
          ) : (
            <ArchiveTab />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 mt-12 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 PPWR Compliance Manager • Revisionsgesicherte Verpackungscodes (QR / DataMatrix / Code 128)</p>
          <p className="font-mono text-slate-600">Ubuntu Linux ready • SHA-256 Audit Trail</p>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={() => {
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}
