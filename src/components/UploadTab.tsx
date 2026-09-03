'use client';

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileCheck, QrCode, Download, Copy, Check, ShieldCheck, AlertCircle, RefreshCw, Barcode, Eye, Globe } from 'lucide-react';
import { GeneratedCodes } from '@/lib/barcode';
import Tooltip from './Tooltip';



const LANGUAGES = [
  { code: 'DE', label: 'Deutsch 🇩🇪' },
  { code: 'EN', label: 'Englisch 🇬🇧' },
  { code: 'FR', label: 'Französisch 🇫🇷' },
  { code: 'IT', label: 'Italienisch 🇮🇹' },
  { code: 'ES', label: 'Spanisch 🇪🇸' },
  { code: 'MULTI', label: 'Mehrsprachig 🇪🇺' },
];

export default function UploadTab() {
  const [file, setFile] = useState<File | null>(null);
  const [sku, setSku] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Konformitätserklärung');
  const [language, setLanguage] = useState('DE');
  const [validUntil, setValidUntil] = useState('');
  const [notifyBeforeExpiry, setNotifyBeforeExpiry] = useState(true);
  const [comment, setComment] = useState('Erstupload v1 (PPWR Konformität)');
  const [categories, setCategories] = useState<string[]>([
    'Konformitätserklärung',
    'Anleitung',
    'Datenblatt',
    'Sonstiges Compliance-Dokument',
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<{
    publicUrl: string;
    sku: string;
    title: string;
    codes: GeneratedCodes;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
            setCategory(data.categories[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !sku || !title) {
      setError('Bitte wähle eine PDF-Datei aus und fülle SKU und Titel aus.');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sku', sku);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('language', language);
      if (validUntil) formData.append('validUntil', validUntil);
      formData.append('notifyBeforeExpiry', notifyBeforeExpiry ? 'true' : 'false');
      formData.append('comment', comment);

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload fehlgeschlagen');
      } else {
        setSuccessResult({
          publicUrl: data.publicUrl,
          sku: data.document.sku,
          title: data.document.title,
          codes: data.codes,
        });
      }
    } catch (err) {
      setError('Netzwerkfehler beim Upload');
    } finally {
      setIsUploading(false);
    }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setFile(null);
    setSku('');
    setTitle('');
    setComment('Erstupload v1 (PPWR Konformität)');
    setSuccessResult(null);
    setError('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner info */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-900/80">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
              <ShieldCheck size={20} />
              Revisionsgesicherte Dokumentenverknüpfung (PPWR)
            </h2>
            <p className="text-sm text-slate-300">
              Lade deine PPWR-Konformitätserklärung, Anleitung oder dein Datenblatt hoch. Die Anwendung generiert automatisch einen **QR-Code**, einen **DataMatrix-Code (GS1)** und einen **Code 128** zum Vektor-Druck auf Verpackungen.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <UploadCloud size={18} className="text-emerald-400" />
              Dokument hochladen
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* File Dropzone */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300 flex items-center">
                  Dokumentendatei (PDF) *
                  <Tooltip content="Wähle die PDF-Datei deiner Konformitätserklärung, Entsorgungsanleitung oder Materialdatenblatt." />
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    file
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-700 hover:border-emerald-500/40 bg-slate-900/40 hover:bg-slate-900/60'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,application/pdf"
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <FileCheck size={24} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-100 truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadCloud size={36} className="mx-auto text-slate-500" />
                      <p className="text-sm font-medium text-slate-200">
                        Klicke hier oder ziehe eine PDF-Datei hinein
                      </p>
                      <p className="text-xs text-slate-500">PDFs bis 50 MB (Konformitätserklärung, Anleitung, Datenblatt)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col justify-end">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center h-5">
                    <span>SKU / Artikelnummer *</span>
                    <Tooltip content="Eindeutige Artikelnummer oder Verpackungs-ID zur Identifikation der Verpackung." />
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="z.B. PKG-84920-EU"
                    className="input-field w-full"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center h-5">
                    <span>Dokumenten-Sprache</span>
                    <Tooltip content="Sprache, in der das Dokument abgefasst ist (gem. PPWR Sprachanforderungen)." />
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input-field w-full"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col justify-end">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center h-5">
                    <span>Kategorie</span>
                    <Tooltip content="Verwaltungs-Kategorie für dieses Compliance-Dokument." />
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field w-full"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center h-5">
                    <span>Dokumentenbezeichnung *</span>
                    <Tooltip content="Freier Name des Dokuments für die Übersicht im Archiv." />
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="z.B. PPWR Konformitätserklärung Kartonage"
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center">
                  <span>Revisionsnotiz (v1)</span>
                  <Tooltip content="Revisionssichere Anmerkung zum Anlass des Uploads oder zur Versionsänderung." />
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Notiz zur Revisionssicherheit"
                  className="input-field w-full"
                />
              </div>

              {/* Expiry Date & 7-Day Notification */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col justify-end">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center h-5">
                      <span>Gültig bis (optional)</span>
                      <Tooltip content="Optionales Ablaufdatum des Compliance-Dokuments. Nach Ablauf zeigt die öffentliche Verpackungs-Seite eine Kontakt-Hinweisseite an." />
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="input-field w-full text-xs text-slate-200"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300 h-11">
                      <input
                        type="checkbox"
                        checked={notifyBeforeExpiry}
                        onChange={(e) => setNotifyBeforeExpiry(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                      />
                      <span>7 Tage vor Ablauf per E-Mail benachrichtigen</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isUploading} className="btn-primary w-full py-3">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <QrCode size={18} />
                      <span>Dokument hochladen & Codes generieren</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Code Generator Output */}
        <div className="lg:col-span-6 space-y-6">
          {successResult ? (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="badge-green mb-1">Erfolgreich erstellt & Revisionsgesichert</span>
                  <h3 className="text-lg font-bold text-white">{successResult.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">SKU: {successResult.sku}</p>
                </div>
                <button onClick={resetForm} className="btn-secondary text-xs py-1.5 px-3">
                  <RefreshCw size={14} />
                  <span>Neues Dokument</span>
                </button>
              </div>

              {/* Public link share bar */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <label className="block text-xs font-medium text-slate-400">Öffentlicher Ziel-Link (auf Verpackung):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={successResult.publicUrl}
                    className="input-field w-full text-xs font-mono text-emerald-400 bg-slate-950"
                  />
                  <button
                    onClick={() => copyToClipboard(successResult.publicUrl)}
                    className="btn-secondary shrink-0 text-xs py-2"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                  <a
                    href={successResult.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary shrink-0 text-xs py-2 text-sky-400"
                    title="Öffentliche Seite öffnen"
                  >
                    <Eye size={16} />
                  </a>
                </div>
              </div>

              {/* Codes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* QR Code */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-between text-center space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
                      <QrCode size={14} className="text-emerald-400" />
                      QR-Code (Verpackungsaufdruck)
                    </h4>
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-inner my-2">
                    <img src={successResult.codes.qrCodePng} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => downloadFile(successResult.codes.qrCodePng, `QR_${successResult.sku}.png`, false)}
                      className="btn-secondary w-full text-xs py-1.5"
                    >
                      <Download size={13} /> PNG
                    </button>
                    <button
                      onClick={() => downloadFile(successResult.codes.qrCodeSvg, `QR_${successResult.sku}.svg`, true)}
                      className="btn-secondary w-full text-xs py-1.5 text-emerald-400"
                    >
                      <Download size={13} /> SVG
                    </button>
                  </div>
                </div>

                {/* DataMatrix Code (128/GS1) */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-between text-center space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
                      <Barcode size={14} className="text-sky-400" />
                      DataMatrix Code (128/GS1)
                    </h4>
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-inner my-2 flex items-center justify-center min-h-[136px]">
                    <img src={successResult.codes.dataMatrixPng} alt="DataMatrix Code" className="w-32 h-32 object-contain" />
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => downloadFile(successResult.codes.dataMatrixPng, `DataMatrix_${successResult.sku}.png`, false)}
                      className="btn-secondary w-full text-xs py-1.5"
                    >
                      <Download size={13} /> PNG
                    </button>
                    <button
                      onClick={() => downloadFile(successResult.codes.dataMatrixSvg, `DataMatrix_${successResult.sku}.svg`, true)}
                      className="btn-secondary w-full text-xs py-1.5 text-sky-400"
                    >
                      <Download size={13} /> SVG
                    </button>
                  </div>
                </div>
              </div>

              {/* Code 128 Barcode */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-between text-center space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
                  <Barcode size={14} className="text-amber-400" />
                  Code 128 Strichcode (Artikel-SKU)
                </h4>
                <div className="p-3 bg-white rounded-xl shadow-inner my-1 w-full flex justify-center">
                  <img src={successResult.codes.code128Png} alt="Code 128 Barcode" className="max-h-20 object-contain" />
                </div>
                <div className="flex items-center gap-2 w-full max-w-xs">
                  <button
                    onClick={() => downloadFile(successResult.codes.code128Png, `Code128_${successResult.sku}.png`, false)}
                    className="btn-secondary w-full text-xs py-1.5"
                  >
                    <Download size={13} /> PNG
                  </button>
                  <button
                    onClick={() => downloadFile(successResult.codes.code128Svg, `Code128_${successResult.sku}.svg`, true)}
                    className="btn-secondary w-full text-xs py-1.5 text-amber-400"
                  >
                    <Download size={13} /> SVG
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[460px] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                <QrCode size={32} />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-base font-semibold text-slate-200">Vorschau der generierten Codes</h4>
                <p className="text-xs text-slate-400">
                  Sobald du links ein PDF hochlädst, erhältst du hier deinen druckfähigen QR-Code, DataMatrix-Code und Code 128 Strichcode für deine Verpackungen.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
