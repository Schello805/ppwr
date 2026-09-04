'use client';

import { QrCode, FileText, ShieldCheck, LogOut, User as UserIcon, Package, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: 'upload' | 'archive' | 'settings';
  setActiveTab: (tab: 'upload' | 'archive' | 'settings') => void;
  username?: string;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  username,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-700/60 backdrop-blur-xl bg-slate-950/80">
      <div className="w-[92%] max-w-[2000px] mx-auto h-20 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 shrink-0">
            <Package size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
                PPWR Compliance Manager
              </h1>
              <span className="badge-green text-xs flex items-center gap-1 shrink-0">
                <ShieldCheck size={13} />
                Revisionsgesichert
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              EU-Verpackungsverordnung (PPWR) • QR-Code & DataMatrix
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Center) */}
        <nav className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <QrCode size={17} />
            <span>1. Upload & Code-Gen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'archive'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText size={17} />
            <span>2. Dokumenten-Archiv</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings size={17} />
            <span>3. Einstellungen</span>
          </button>
        </nav>

        {/* User Section (Right) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800/90 shadow-sm">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-medium">
                  <UserIcon size={15} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-200 leading-none">{username || 'Admin'}</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Administrator</div>
              </div>
            </div>

            <div className="w-px h-5 bg-slate-800" />

            <button
              type="button"
              onClick={onLogout}
              title="Abmelden"
              className="text-slate-400 hover:text-red-400 hover:bg-red-950/30 p-1.5 rounded-lg transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
