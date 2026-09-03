'use client';

import { useEffect, useState } from 'react';

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
        }
      } catch (err) {
        setError('Verbindungsfehler beim Laden des Dokumentes.');
      } finally {
        setLoading(false);
      }
    }
    loadPublicDoc();
  }, [token]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data || !data.latestRevision) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-bold text-white">Dokument nicht verfügbar</h1>
          <p className="text-sm text-slate-400">{error || 'Das angeforderte Dokument existiert nicht.'}</p>
        </div>
      </div>
    );
  }

  const latestFileId = (data.latestRevision as any).revisionId || data.latestRevision.id;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden m-0 p-0">
      <iframe
        src={`/api/public/file/${latestFileId}`}
        className="w-full h-full border-0 m-0 p-0 block"
        title={data.title}
      />
    </div>
  );
}
