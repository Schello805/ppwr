import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full space-y-4 border border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <FileQuestion size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">404 - Nicht gefunden</h2>
          <p className="text-xs text-slate-400">Die angeforderte Seite existiert nicht.</p>
        </div>
        <Link href="/" className="btn-primary w-full text-xs">
          <ArrowLeft size={14} />
          <span>Zurück zur Startseite</span>
        </Link>
      </div>
    </div>
  );
}
