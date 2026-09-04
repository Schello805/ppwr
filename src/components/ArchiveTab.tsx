'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  History,
  QrCode,
  Download,
  PlusCircle,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  AlertCircle,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Globe,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { GeneratedCodes } from '@/lib/barcode';

export interface RevisionData {
  id: string;
  revisionNumber: number;
  fileName: string;
  fileSize: number;
  sha256Hash: string;
  comment?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface AuditLogData {
  id: string;
  documentId?: string | null;
  action: string;
  details: string;
  user?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface DocumentData {
  id: string;
  sku: string;
  title: string;
  category: string;
  language: string;
  publicToken: string;
  validUntil?: string | null;
  notifyBeforeExpiry?: boolean;
  expiryNotified?: boolean;
  createdAt: string;
  updatedAt: string;
  revisions: RevisionData[];
  auditLogs?: AuditLogData[];
}

type SortField = 'sku' | 'title' | 'category' | 'language' | 'revision' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function ArchiveTab() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [categories, setCategories] = useState<string[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modals state
  const [historyDoc, setHistoryDoc] = useState<DocumentData | null>(null);
  const [historyTab, setHistoryTab] = useState<'revisions' | 'audit'>('revisions');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [codeDoc, setCodeDoc] = useState<{ doc: DocumentData; codes: GeneratedCodes; publicUrl: string } | null>(null);
  const [newRevDoc, setNewRevDoc] = useState<DocumentData | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New revision form state
  const [revFile, setRevFile] = useState<File | null>(null);
  const [revComment, setRevComment] = useState('');
  const [revUploading, setRevUploading] = useState(false);
  const [revError, setRevError] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${deleteDoc.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteDoc(null);
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(data.error || 'Fehler beim Löschen');
      }
    } catch {
      alert('Netzwerkfehler beim Löschen');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/documents');
      if (res.status === 401) {
        setError('Nicht angemeldet. Bitte als Admin anmelden, um das Archiv zu verwalten.');
        setDocuments([]);
      } else if (!res.ok) {
        setError('Fehler beim Laden des Archivs.');
      } else {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      setError('Verbindungsfehler zum Server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleOpenCodes = async (doc: DocumentData) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}/codes`);
      if (res.ok) {
        const data = await res.json();
        setCodeDoc({ doc, codes: data.codes, publicUrl: data.publicUrl });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevDoc || !revFile) return;

    setRevUploading(true);
    setRevError('');

    try {
      const formData = new FormData();
      formData.append('file', revFile);
      formData.append('comment', revComment || 'Neue Revision hochgeladen');

      const res = await fetch(`/api/documents/${newRevDoc.id}/revision`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setRevError(data.error || 'Fehler beim Erstellen der Revision');
      } else {
        setNewRevDoc(null);
        setRevFile(null);
        setRevComment('');
        fetchDocuments();
      }
    } catch (err) {
      setRevError('Netzwerkfehler');
    } finally {
      setRevUploading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadFile = (dataStr: string, fileName: string, isSvg: boolean) => {
    const element = document.createElement('a');
    if (isSvg) {
      const blob = new Blob([dataStr], { type: 'image/svg+xml' });
      element.href = URL.createObjectURL(blob);
    } else {
      element.href = dataStr;
    }
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    const matchesLanguage = languageFilter === 'ALL' || doc.language === languageFilter;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  // Sorting logic
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    let aValue: any = a[sortField as keyof DocumentData];
    let bValue: any = b[sortField as keyof DocumentData];

    if (sortField === 'revision') {
      aValue = a.revisions[0]?.revisionNumber || 0;
      bValue = b.revisions[0]?.revisionNumber || 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-600 ml-1" />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} className="text-emerald-400 ml-1" />
    ) : (
      <ArrowDown size={12} className="text-emerald-400 ml-1" />
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="text-emerald-400" size={22} />
            PPWR Dokumenten-Archiv
          </h2>
          <p className="text-xs text-slate-400">
            Alle hochgeladenen Dokumente mit Revisionshistorie & QR/DataMatrix Verpackungscodes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-2 flex-1 sm:w-64 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SKU oder Titel suchen..."
              className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-full text-xs"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field text-xs py-2.5"
          >
            <option value="ALL">Alle Kategorien</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="input-field text-xs py-2.5"
          >
            <option value="ALL">Alle Sprachen</option>
            <option value="DE">Deutsch 🇩🇪</option>
            <option value="EN">Englisch 🇬🇧</option>
            <option value="FR">Französisch 🇫🇷</option>
            <option value="IT">Italienisch 🇮🇹</option>
            <option value="ES">Spanisch 🇪🇸</option>
            <option value="MULTI">Mehrsprachig 🇪🇺</option>
          </select>
        </div>
      </div>


      {error && (
        <div className="glass-panel p-4 rounded-xl border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th
                    onClick={() => handleSort('sku')}
                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <span className="flex items-center">
                      SKU / Verpackung {renderSortIcon('sku')}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('title')}
                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <span className="flex items-center">
                      Dokumententitel {renderSortIcon('title')}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <span className="flex items-center">
                      Kategorie {renderSortIcon('category')}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('language')}
                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <span className="flex items-center">
                      Sprache {renderSortIcon('language')}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('revision')}
                    className="px-6 py-4 text-center cursor-pointer hover:text-white transition-colors"
                  >
                    <span className="flex items-center justify-center">
                      Revisionsstufe {renderSortIcon('revision')}
                    </span>
                  </th>
                  <th className="px-6 py-4">SHA-256 Checksumme</th>
                  <th
                    onClick={() => handleSort('updatedAt')}
                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <span className="flex items-center">
                      Aktualisiert {renderSortIcon('updatedAt')}
                    </span>
                  </th>
                  <th className="px-6 py-4 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span>Lade Dokumente...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      Keine Dokumente gefunden.
                    </td>
                  </tr>
                ) : (
                  sortedDocs.map((doc) => {
                    const latestRev = doc.revisions[0];
                    const publicUrl = `${window.location.origin}/doc/${doc.publicToken}`;

                    return (
                      <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-emerald-400 font-semibold">{doc.sku}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-100">{doc.title}</div>
                          {latestRev && <div className="text-xs text-slate-500 truncate max-w-xs">{latestRev.fileName}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge-blue">{doc.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge-amber font-mono">{doc.language || 'DE'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setHistoryDoc(doc);
                              setHistoryTab('revisions');
                            }}
                            className="badge-green font-bold hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Klicken für Revisionsstufen & Audit-Trail"
                          >
                            <span>v{latestRev?.revisionNumber || 1}</span>
                            {doc.revisions.length > 1 && (
                              <span className="text-[10px] opacity-75 font-normal">({doc.revisions.length})</span>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {latestRev?.sha256Hash ? (
                            <span title={latestRev.sha256Hash} className="flex items-center gap-1">
                              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                              <span>{latestRev.sha256Hash.substring(0, 12)}...</span>
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(doc.updatedAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Open File */}
                            {latestRev && (
                              <a
                                href={`/api/public/file/${latestRev.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="PDF Vorschau"
                              >
                                <Eye size={16} />
                              </a>
                            )}

                            {/* View Codes */}
                            <button
                              onClick={() => handleOpenCodes(doc)}
                              className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                              title="QR & DataMatrix Verpackungscodes"
                            >
                              <QrCode size={16} />
                            </button>

                            {/* Add Revision */}
                            <button
                              onClick={() => setNewRevDoc(doc)}
                              className="p-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 transition-colors"
                              title="Neue Revisionsstufe hochladen"
                            >
                              <PlusCircle size={16} />
                            </button>

                            {/* Revision History */}
                            <button
                              onClick={() => {
                                setHistoryDoc(doc);
                                setHistoryTab('revisions');
                              }}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Revisionshistorie & Audit-Log"
                            >
                              <History size={16} />
                            </button>

                            {/* Copy Public Link */}
                            <button
                              onClick={() => copyToClipboard(publicUrl, doc.id)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Öffentlichen Link kopieren"
                            >
                              {copiedId === doc.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            </button>

                            {/* Delete Document */}
                            <button
                              onClick={() => setDeleteDoc(doc)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Dokument löschen"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* Revision History & Compliance Audit-Trail Modal */}
      {historyDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-4xl rounded-2xl p-6 sm:p-8 relative space-y-6 max-h-[90vh] flex flex-col border border-slate-700/80 shadow-2xl">
            <button
              onClick={() => setHistoryDoc(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Schließen"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-white">{historyDoc.title}</h3>
                    <span className="badge-green text-xs font-mono">SKU: {historyDoc.sku}</span>
                    <span className="badge-blue text-xs">{historyDoc.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                      {historyDoc.language}
                    </span>
                    {historyDoc.validUntil && (
                      <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                        new Date(historyDoc.validUntil) < new Date()
                          ? 'bg-red-900/50 text-red-300 border border-red-500/50'
                          : 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        Gültig bis: {new Date(historyDoc.validUntil).toLocaleDateString('de-DE')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Revisionshistorie & Unveränderlicher Audit-Trail (EU-PPWR Richtlinienkonform)
                  </p>
                </div>
              </div>
            </div>

            {/* Subnavigation Tabs in Modal */}
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setHistoryTab('revisions')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  historyTab === 'revisions'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History size={16} />
                <span>Revisionsstufen ({historyDoc.revisions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setHistoryTab('audit')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  historyTab === 'audit'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Compliance Audit-Trail ({historyDoc.auditLogs?.length || 0})</span>
              </button>
            </div>

            {/* Modal Body: Revisions Tab */}
            {historyTab === 'revisions' && (
              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                {historyDoc.revisions.map((rev, index) => {
                  const isLatest = index === 0;
                  const fileSizeFormatted =
                    rev.fileSize > 1024 * 1024
                      ? (rev.fileSize / (1024 * 1024)).toFixed(2) + ' MB'
                      : (rev.fileSize / 1024).toFixed(1) + ' KB';

                  return (
                    <div
                      key={rev.id}
                      className={`p-5 rounded-xl border space-y-3 transition-colors ${
                        isLatest
                          ? 'bg-slate-900/95 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`font-bold text-xs px-2.5 py-1 rounded-lg ${
                              isLatest
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            v{rev.revisionNumber} {isLatest ? '• Aktuelle Version' : '• Archiviert'}
                          </span>
                          <span className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                            {rev.fileName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">({fileSizeFormatted})</span>
                        </div>

                        <a
                          href={`/api/public/file/${rev.id}?download=true`}
                          className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
                        >
                          <Download size={13} /> PDF Herunterladen
                        </a>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                        <strong className="text-slate-400">Revisionskommentar:</strong>{' '}
                        {rev.comment || 'Keine Revisionsnotiz angegeben'}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                        <div className="flex items-center gap-2 overflow-x-auto">
                          <span className="font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                            <ShieldCheck size={14} /> SHA-256:
                          </span>
                          <span className="font-mono text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                            {rev.sha256Hash}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(rev.sha256Hash);
                              setCopiedHash(rev.sha256Hash);
                              setTimeout(() => setCopiedHash(null), 2500);
                            }}
                            className="text-slate-400 hover:text-emerald-400 p-1 rounded transition-colors shrink-0"
                            title="Prüfsumme kopieren"
                          >
                            {copiedHash === rev.sha256Hash ? (
                              <Check size={13} className="text-emerald-400" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>

                        <div className="text-slate-400 shrink-0">
                          Hochgeladen von <strong className="text-slate-200">{rev.uploadedBy}</strong> am{' '}
                          {new Date(rev.createdAt).toLocaleString('de-DE')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal Body: Audit-Trail Tab */}
            {historyTab === 'audit' && (
              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                {(!historyDoc.auditLogs || historyDoc.auditLogs.length === 0) ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    Keine Audit-Einträge für dieses Dokument gefunden.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyDoc.auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-mono font-semibold">
                              {log.action}
                            </span>
                            <span className="text-slate-300 font-medium">
                              Benutzer: <strong className="text-white">{log.user || 'Admin'}</strong>
                            </span>
                            {log.ipAddress && (
                              <span className="text-slate-500 font-mono">({log.ipAddress})</span>
                            )}
                          </div>
                          <span className="text-slate-400 font-mono">
                            {new Date(log.createdAt).toLocaleString('de-DE')}
                          </span>
                        </div>
                        <p className="text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                          {log.details}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>
                    Unveränderliches Prüfprotokoll gemäß Art. 11/14 EU-PPWR Richtlinie für lückenlose Rückverfolgbarkeit.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code Export Modal */}
      {codeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 relative space-y-6">
            <button
              onClick={() => setCodeDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Verpackungscodes Export</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {codeDoc.doc.title} (SKU: {codeDoc.doc.sku})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* QR Code */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-3 flex flex-col items-center">
                <h4 className="text-xs font-semibold text-slate-300">QR-Code</h4>
                <div className="p-2 bg-white rounded-xl shadow-inner">
                  <img src={codeDoc.codes.qrCodePng} alt="QR Code" className="w-32 h-32" />
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => downloadFile(codeDoc.codes.qrCodePng, `QR_${codeDoc.doc.sku}.png`, false)}
                    className="btn-secondary w-full text-xs py-1.5"
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => downloadFile(codeDoc.codes.qrCodeSvg, `QR_${codeDoc.doc.sku}.svg`, true)}
                    className="btn-secondary w-full text-xs py-1.5 text-emerald-400"
                  >
                    SVG
                  </button>
                </div>
              </div>

              {/* DataMatrix Code */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-3 flex flex-col items-center">
                <h4 className="text-xs font-semibold text-slate-300">DataMatrix Code (128/GS1)</h4>
                <div className="p-2 bg-white rounded-xl shadow-inner min-h-[136px] flex items-center justify-center">
                  <img src={codeDoc.codes.dataMatrixPng} alt="DataMatrix Code" className="w-32 h-32 object-contain" />
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => downloadFile(codeDoc.codes.dataMatrixPng, `DataMatrix_${codeDoc.doc.sku}.png`, false)}
                    className="btn-secondary w-full text-xs py-1.5"
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => downloadFile(codeDoc.codes.dataMatrixSvg, `DataMatrix_${codeDoc.doc.sku}.svg`, true)}
                    className="btn-secondary w-full text-xs py-1.5 text-sky-400"
                  >
                    SVG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Revision Upload Modal */}
      {newRevDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative space-y-5">
            <button
              onClick={() => setNewRevDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <PlusCircle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Neue Revisionsstufe hochladen</h3>
                <p className="text-xs text-slate-400">
                  Erstellt Revisionsstufe v{(newRevDoc.revisions[0]?.revisionNumber || 0) + 1} für SKU: {newRevDoc.sku}
                </p>
              </div>
            </div>

            {revError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{revError}</span>
              </div>
            )}

            <form onSubmit={handleNewRevisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">PDF-Datei der neuen Version *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,application/pdf"
                  onChange={(e) => setRevFile(e.target.files?.[0] || null)}
                  className="input-field w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Revisionsnotiz / Änderungsgrund</label>
                <input
                  type="text"
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="z.B. Aktualisierte Konformitätserklärung gem. PPWR Art. 14"
                  className="input-field w-full text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewRevDoc(null)}
                  className="btn-secondary text-xs"
                >
                  Abbrechen
                </button>
                <button type="submit" disabled={revUploading} className="btn-primary text-xs">
                  {revUploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Revision v{(newRevDoc.revisions[0]?.revisionNumber || 0) + 1} speichern</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-5 border border-red-500/30">
            <button
              onClick={() => setDeleteDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dokument wirklich löschen?</h3>
                <p className="text-xs text-slate-400 font-mono">SKU: {deleteDoc.sku}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
              <p className="font-semibold">Achtung: Dies löscht das Dokument "{deleteDoc.title}" und alle zugehörigen Revisionsdateien unwiderruflich!</p>
              <p className="text-slate-400">Verpackungscodes auf gedruckten Schachteln führen danach ins Leere.</p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteDoc(null)}
                className="btn-secondary text-xs"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-2.5 rounded-lg text-xs transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Unwiderruflich löschen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
