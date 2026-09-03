'use client';

import { QrCode, FileText, ShieldCheck, LogOut, User as UserIcon, Package, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: 'upload' | 'archive';
  setActiveTab: (tab: 'upload' | 'archive') => void;
  username?: string;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  username,
  onOpenSettings,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-700/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
            <Package size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">PPWR Compliance Manager</h1>
              <span className="badge-green">
                <ShieldCheck size={12} />
                Revisionsgesichert
              </span>
            </div>
            <p className="text-xs text-slate-400">PDF-Upload, QR & DataMatrix (Code 128) für Verpackungen</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <QrCode size={18} />
            <span>1. Upload & Code-Gen</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'archive'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText size={18} />
            <span>2. Dokumenten-Archiv</span>
          </button>
        </div>

        {/* User section — always shown (app is behind login) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-slate-300 hover:text-emerald-400"
            title="Einstellungen (Domain, Kontakt, SMTP)"
          >
            <Settings size={15} />
            <span className="hidden sm:inline">Einstellungen</span>
          </button>

          <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserIcon size={14} />
              </div>
              <span className="font-medium text-slate-200">{username}</span>
            </div>
            <button
              onClick={onLogout}
              title="Abmelden"
              className="text-slate-400 hover:text-red-400 p-1 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
