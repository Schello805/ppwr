'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Mail, Phone, Globe, Building, ShieldAlert } from 'lucide-react';

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
  isExpired: boolean;
  sku: string;
  title: string;
  category?: string;
  language?: string;
  validUntil?: string;
  latestRevision?: RevisionItem;
  revisionsHistory?: (RevisionItem & { revisionId: string })[];
  contactInfo?: {
    company: string;
    email: string;
    phone: string;
    website: string;
  };
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

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-bold text-white">Dokument nicht verfügbar</h1>
          <p className="text-sm text-slate-400">{error || 'Das angeforderte Dokument existiert nicht.'}</p>
        </div>
      </div>
    );
  }

  // Handle EXPIRED document notice page
  if (data.isExpired) {
    const contact = data.contactInfo;

    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 text-slate-100 overflow-y-auto">
        <div className="glass-panel max-w-lg w-full rounded-3xl p-8 space-y-6 border border-amber-500/30 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <span className="badge-amber text-xs font-semibold">Gültigkeit abgelaufen</span>
            <h1 className="text-2xl font-bold text-white">Dokument abgelaufen</h1>
            <p className="text-xs text-slate-400 font-mono">Verpackungs-SKU: {data.sku}</p>
            <p className="text-sm font-medium text-slate-200 pt-1">{data.title}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
            <p className="font-semibold text-amber-300">Hinweis zur Einhaltung der PPWR:</p>
            <p className="text-slate-400 leading-relaxed">
              Dieses Compliance-Dokument hat das Ende seiner Gültigkeitsdauer erreicht. Das PDF-Dokument wurde gemäß den Vorgaben aus dem System entfernt.
            </p>
            <p className="text-slate-200 font-medium">
              Bitte wenden Sie sich für aktuelle Konformitätsnachweise direkt an den Hersteller:
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-2 text-left text-xs">
            {contact?.company && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <Building size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Hersteller / Inverkehrbringer</span>
                  <span className="font-semibold text-slate-200">{contact.company}</span>
                </div>
              </div>
            )}

            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors"
              >
                <Mail size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">E-Mail-Kontakt</span>
                  <span className="font-semibold text-emerald-400">{contact.email}</span>
                </div>
              </a>
            )}

            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-colors"
              >
                <Phone size={16} className="text-sky-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Telefon</span>
                  <span className="font-semibold text-sky-400">{contact.phone}</span>
                </div>
              </a>
            )}

            {contact?.website && (
              <a
                href={contact.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-colors"
              >
                <Globe size={16} className="text-purple-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Website</span>
                  <span className="font-semibold text-purple-400 truncate block">{contact.website}</span>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const latestFileId = (data.latestRevision as any)?.revisionId || data.latestRevision?.id;

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
