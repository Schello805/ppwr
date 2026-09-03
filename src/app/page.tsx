'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import UploadTab from '@/components/UploadTab';
import ArchiveTab from '@/components/ArchiveTab';
import LoginModal from '@/components/LoginModal';
import SettingsModal from '@/components/SettingsModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'archive'>('upload');
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col justify-between" key={refreshKey}>
      <div>
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          authenticated={authenticated}
          username={username}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'upload' ? (
            <UploadTab
              authenticated={authenticated}
              onOpenLogin={() => setIsLoginOpen(true)}
              onSuccessUpload={() => {
                // Optional action after success
              }}
            />
          ) : (
            <ArchiveTab authenticated={authenticated} onOpenLogin={() => setIsLoginOpen(true)} />
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

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          checkAuth();
        }}
      />

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
