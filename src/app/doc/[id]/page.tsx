'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Download, FileText, Package, AlertCircle, Eye, ArrowLeft, History, CheckCircle } from 'lucide-react';

interface RevisionItem {
  id: string;
  revisionNumber: number;
  fileName: string;
  fileSize: number;
  sha256Hash: string;
  comment?: string;
  createdAt: string;
}

interface PublicDocData {
  sku: string;
  title: string;
  category: string;
  latestRevision: RevisionItem;
  revisionsHistory: (RevisionItem & { revisionId: string })[];
}

export default function PublicDocumentPage({ params }: { params: { id: string } }) {
  const token = params.id;
  const [data, setData] = useState<PublicDocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublicDoc() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/public/doc/${token}`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || 'Dokument konnte nicht gefunden werden.');
        } else {
          const docData: PublicDocData = await res.json();
          setData(docData);
          if (docData.latestRevision) {
            setSelectedRevisionId(docData.latestRevision.id);
          }
        }
      } catch (err) {
        setError('Verbindungsfehler beim Laden des Dokumentes.');
      } finally {
        setLoading(false);
      }
    }
    loadPublicDoc();
  }, [token]);

  const currentRev = data?.revisionsHistory.find((r) => r.revisionId === selectedRevisionId || r.id === selectedRevisionId) || data?.latestRevision;
  const currentFileId = (currentRev as any)?.revisionId || (currentRev as any)?.id;


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-900/30">
              <Package size={26} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PPWR Compliance Document</h1>
              <p className="text-xs text-slate-400">Verpackungsverordnung EU • Revisionsgesicherter Abruf</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-green text-xs px-3 py-1.5">
              <ShieldCheck size={14} />
              SHA-256 Verifiziert
            </span>
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Lade Compliance-Dokument...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-red-500/30">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Dokument nicht gefunden</h2>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          </div>
        ) : data && currentRev ? (
          <div className="space-y-6">
            {/* Meta Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div>
                  <span className="badge-blue text-xs mb-1.5">{data.category}</span>
                  <h2 className="text-2xl font-bold text-white">{data.title}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">Verpackungs-SKU: {data.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/public/file/${currentFileId}?download=true`}
                    className="btn-primary text-xs py-2.5 px-4"
                  >
                    <Download size={16} />
                    <span>PDF Herunterladen</span>
                  </a>
                </div>
              </div>

              {/* Revision status & hash */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Revisionsstufe</span>
                  <span className="font-bold text-emerald-400 text-sm">v{currentRev.revisionNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Erstellungsdatum</span>
                  <span className="font-medium text-slate-200">
                    {new Date(currentRev.createdAt).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Integrität Hash</span>
                  <span className="font-mono text-emerald-400 truncate block" title={currentRev.sha256Hash}>
                    {currentRev.sha256Hash.substring(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Revision picker if multiple */}
              {data.revisionsHistory.length > 1 && (
                <div className="pt-3 border-t border-slate-800/80">
                  <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                    <History size={14} className="text-sky-400" />
                    Revisions-Historie auswählen:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {data.revisionsHistory.map((rev) => (
                      <button
                        key={rev.revisionId}
                        onClick={() => setSelectedRevisionId(rev.revisionId)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                          selectedRevisionId === rev.revisionId
                            ? 'bg-emerald-600 text-white font-medium shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        <span>Revision v{rev.revisionNumber}</span>
                        {rev.revisionId === data.latestRevision.id && (
                          <span className="text-[10px] text-emerald-300 font-semibold">(Aktuell)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Embedded PDF Viewer */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 h-[650px] flex flex-col">
              <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <FileText size={15} className="text-emerald-400" />
                  PDF Vorschau: {currentRev.fileName}
                </span>
                <span className="font-mono">{(currentRev.fileSize / 1024).toFixed(1)} KB</span>
              </div>
              <iframe
                src={`/api/public/file/${currentFileId}`}
                className="w-full h-full border-0 bg-slate-900"
                title="PPWR PDF Viewer"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-slate-600 space-y-1">
        <p>PPWR Compliance System • Revisionsgesicherter Dokumentennachweis gem. Verordnung (EU)</p>
        <p>Digitale Bereitstellung für Verpackungsaufdrucke & GS1 Barcodes</p>
      </div>
    </div>
  );
}
