'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, Globe, Building, ShieldAlert, Download, Info, ShieldCheck, Languages, X } from 'lucide-react';

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

type SupportedLang = 'de' | 'en' | 'fr' | 'es' | 'it' | 'pl' | 'nl';

const i18n: Record<SupportedLang, {
  docExpiredTitle: string;
  docExpiredNotice: string;
  contactManufacturer: string;
  validityExpired: string;
  sku: string;
  manufacturer: string;
  emailContact: string;
  phone: string;
  website: string;
  downloadPdf: string;
  documentDetails: string;
  sha256Hash: string;
  category: string;
  validUntil: string;
  revision: string;
  complianceDoc: string;
  notFound: string;
  connectionError: string;
  close: string;
}> = {
  de: {
    docExpiredTitle: 'Dokument abgelaufen',
    docExpiredNotice: 'Dieses Compliance-Dokument hat das Ende seiner Gültigkeitsdauer erreicht. Das PDF-Dokument wurde gemäß den Vorgaben aus dem aktiven System entfernt.',
    contactManufacturer: 'Bitte wenden Sie sich für aktuelle Konformitätsnachweise direkt an den Hersteller:',
    validityExpired: 'Gültigkeit abgelaufen',
    sku: 'Verpackungs-SKU',
    manufacturer: 'Hersteller / Inverkehrbringer',
    emailContact: 'E-Mail-Kontakt',
    phone: 'Telefon',
    website: 'Website',
    downloadPdf: 'PDF Herunterladen',
    documentDetails: 'Dokumenten-Details',
    sha256Hash: 'SHA-256 Prüfsumme',
    category: 'Kategorie',
    validUntil: 'Gültig bis',
    revision: 'Revision',
    complianceDoc: 'EU-PPWR Konformitätsnachweis',
    notFound: 'Dokument nicht verfügbar',
    connectionError: 'Verbindungsfehler beim Laden des Dokumentes.',
    close: 'Schließen',
  },
  en: {
    docExpiredTitle: 'Document Expired',
    docExpiredNotice: 'This compliance document has reached the end of its validity period. The PDF document has been removed from active distribution in accordance with requirements.',
    contactManufacturer: 'Please contact the manufacturer directly for current compliance certificates:',
    validityExpired: 'Validity Expired',
    sku: 'Packaging SKU',
    manufacturer: 'Manufacturer / Distributor',
    emailContact: 'Email Contact',
    phone: 'Phone',
    website: 'Website',
    downloadPdf: 'Download PDF',
    documentDetails: 'Document Details',
    sha256Hash: 'SHA-256 Checksum',
    category: 'Category',
    validUntil: 'Valid Until',
    revision: 'Revision',
    complianceDoc: 'EU PPWR Compliance Certificate',
    notFound: 'Document Not Available',
    connectionError: 'Connection error while loading document.',
    close: 'Close',
  },
  fr: {
    docExpiredTitle: 'Document Expiré',
    docExpiredNotice: 'Ce document de conformité a atteint la fin de sa période de validité. Le fichier PDF a été retiré du système actif.',
    contactManufacturer: 'Veuillez contacter directement le fabricant pour les certificats de conformité actuels:',
    validityExpired: 'Validité expirée',
    sku: 'SKU d\'emballage',
    manufacturer: 'Fabricant / Distributeur',
    emailContact: 'Contact E-mail',
    phone: 'Téléphone',
    website: 'Site Web',
    downloadPdf: 'Télécharger le PDF',
    documentDetails: 'Détails du document',
    sha256Hash: 'Empreinte SHA-256',
    category: 'Catégorie',
    validUntil: 'Valide jusqu\'au',
    revision: 'Révision',
    complianceDoc: 'Certificat de Conformité UE PPWR',
    notFound: 'Document non disponible',
    connectionError: 'Erreur de connexion lors du chargement.',
    close: 'Fermer',
  },
  es: {
    docExpiredTitle: 'Documento Expirado',
    docExpiredNotice: 'Este documento de conformidad ha alcanzado el final de su período de validez. El archivo PDF ha sido retirado del sistema activo.',
    contactManufacturer: 'Póngase en contacto directamente con el fabricante para obtener certificados de conformidad actualizados:',
    validityExpired: 'Validez Expirada',
    sku: 'SKU de Embalaje',
    manufacturer: 'Fabricante / Distribuidor',
    emailContact: 'Contacto por Correo',
    phone: 'Teléfono',
    website: 'Sitio Web',
    downloadPdf: 'Descargar PDF',
    documentDetails: 'Detalles del documento',
    sha256Hash: 'Suma de comprobación SHA-256',
    category: 'Categoría',
    validUntil: 'Válido hasta',
    revision: 'Revisión',
    complianceDoc: 'Certificado de Conformidad UE PPWR',
    notFound: 'Documento no disponible',
    connectionError: 'Error de conexión al cargar el documento.',
    close: 'Cerrar',
  },
  it: {
    docExpiredTitle: 'Documento Scaduto',
    docExpiredNotice: 'Questo documento di conformità ha raggiunto il termine del suo periodo di validità. Il file PDF è stato rimosso dal sistema attivo.',
    contactManufacturer: 'Si prega di contattare direttamente il produttore per i certificati di conformità aggiornati:',
    validityExpired: 'Validità Scaduta',
    sku: 'SKU Imballaggio',
    manufacturer: 'Produttore / Distributore',
    emailContact: 'Contatto E-mail',
    phone: 'Telefono',
    website: 'Sito Web',
    downloadPdf: 'Scarica PDF',
    documentDetails: 'Dettagli Documento',
    sha256Hash: 'Checksum SHA-256',
    category: 'Categoria',
    validUntil: 'Valido fino al',
    revision: 'Revisione',
    complianceDoc: 'Certificato di Conformità UE PPWR',
    notFound: 'Documento non disponibile',
    connectionError: 'Errore di connessione durante il caricamento.',
    close: 'Chiudi',
  },
  pl: {
    docExpiredTitle: 'Dokument wygasł',
    docExpiredNotice: 'Ten dokument zgodności osiągnął koniec okresu ważności. Plik PDF został usunięty z aktywnego systemu.',
    contactManufacturer: 'Skontaktuj się bezpośrednio z producentem w celu uzyskania aktualnych certyfikatów zgodności:',
    validityExpired: 'Ważność wygasła',
    sku: 'SKU Opakowania',
    manufacturer: 'Producent / Dystrybutor',
    emailContact: 'Kontakt E-mail',
    phone: 'Telefon',
    website: 'Strona WWW',
    downloadPdf: 'Pobierz PDF',
    documentDetails: 'Szczegóły dokumentu',
    sha256Hash: 'Suma kontrolna SHA-256',
    category: 'Kategoria',
    validUntil: 'Ważne do',
    revision: 'Rewizja',
    complianceDoc: 'Certyfikat Zgodności UE PPWR',
    notFound: 'Dokument niedostępny',
    connectionError: 'Błąd połączenia podczas ładowania dokumentu.',
    close: 'Zamknij',
  },
  nl: {
    docExpiredTitle: 'Document Verlopen',
    docExpiredNotice: 'Dit conformiteitsdocument heeft het einde van zijn geldigheidsperiode bereikt. Het PDF-bestand is verwijderd uit het actieve systeem.',
    contactManufacturer: 'Neem rechtstreeks contact op met de fabrikant voor actuele conformiteitscertificaten:',
    validityExpired: 'Geldigheid Verlopen',
    sku: 'Verpakkings-SKU',
    manufacturer: 'Fabrikant / Distributeur',
    emailContact: 'E-mail Contact',
    phone: 'Telefoon',
    website: 'Website',
    downloadPdf: 'PDF Downloaden',
    documentDetails: 'Documentdetails',
    sha256Hash: 'SHA-256 Checksum',
    category: 'Categorie',
    validUntil: 'Geldig tot',
    revision: 'Revisie',
    complianceDoc: 'EU PPWR Conformiteitscertificaat',
    notFound: 'Document niet beschikbaar',
    connectionError: 'Verbindingsfout bij het laden van het document.',
    close: 'Sluiten',
  },
};

const LANGUAGES: { code: SupportedLang; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];

export default function PublicDocumentPage({ params }: { params: { id: string } }) {
  const token = params.id;
  const [data, setData] = useState<PublicDocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<SupportedLang>('de');
  const [showDetails, setShowDetails] = useState(false);

  const t = i18n[lang] || i18n.de;

  useEffect(() => {
    // Detect browser language if supported
    const userLang = navigator.language?.slice(0, 2).toLowerCase() as SupportedLang;
    if (Object.keys(i18n).includes(userLang)) {
      setLang(userLang);
    }
  }, []);

  useEffect(() => {
    async function loadPublicDoc() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/public/doc/${token}`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || t.notFound);
        } else {
          const docData: PublicDocData = await res.json();
          setData(docData);
          if (docData.language && Object.keys(i18n).includes(docData.language.toLowerCase() as SupportedLang)) {
            setLang(docData.language.toLowerCase() as SupportedLang);
          }
        }
      } catch {
        setError(t.connectionError);
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
          <h1 className="text-xl font-bold text-white">{t.notFound}</h1>
          <p className="text-sm text-slate-400">{error || t.notFound}</p>
        </div>
      </div>
    );
  }

  // Handle EXPIRED document notice page
  if (data.isExpired) {
    const contact = data.contactInfo;

    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 text-slate-100 overflow-y-auto">
        <div className="glass-panel max-w-lg w-full rounded-3xl p-8 space-y-6 border border-amber-500/30 text-center shadow-2xl relative">
          
          {/* Language Selector */}
          <div className="flex justify-end gap-1 mb-2">
            <div className="inline-flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <Languages size={14} className="text-emerald-400" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as SupportedLang)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <span className="badge-amber text-xs font-semibold">{t.validityExpired}</span>
            <h1 className="text-2xl font-bold text-white">{t.docExpiredTitle}</h1>
            <p className="text-xs text-slate-400 font-mono">{t.sku}: {data.sku}</p>
            <p className="text-sm font-medium text-slate-200 pt-1">{data.title}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
            <p className="font-semibold text-amber-300">PPWR Compliance:</p>
            <p className="text-slate-400 leading-relaxed">{t.docExpiredNotice}</p>
            <p className="text-slate-200 font-medium">{t.contactManufacturer}</p>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-2 text-left text-xs">
            {contact?.company && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <Building size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">{t.manufacturer}</span>
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
                  <span className="text-slate-500 block text-[10px]">{t.emailContact}</span>
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
                  <span className="text-slate-500 block text-[10px]">{t.phone}</span>
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
                  <span className="text-slate-500 block text-[10px]">{t.website}</span>
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
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden flex flex-col m-0 p-0">
      {/* Top Glassmorphism Navigation Bar */}
      <div className="w-full bg-slate-950/90 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-4 z-30 shrink-0 backdrop-blur-md">
        
        {/* Title & SKU */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">{data.title}</h1>
              <span className="badge-blue text-[10px] font-mono shrink-0">{data.sku}</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden sm:block">{t.complianceDoc}</p>
          </div>
        </div>

        {/* Right Actions: Details, Download & Language */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Details Drawer Button */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition-colors"
          >
            <Info size={14} className="text-sky-400" />
            <span className="hidden sm:inline">{t.documentDetails}</span>
          </button>

          {/* Download Direct Link */}
          {latestFileId && (
            <a
              href={`/api/public/file/${latestFileId}`}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-md shadow-emerald-950/40"
            >
              <Download size={14} />
              <span className="hidden sm:inline">{t.downloadPdf}</span>
            </a>
          )}

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <Languages size={14} className="text-slate-400 shrink-0" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLang)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main PDF Viewer */}
      <div className="flex-1 w-full h-full relative bg-slate-950">
        <iframe
          src={`/api/public/file/${latestFileId}`}
          className="w-full h-full border-0 block"
          title={data.title}
        />
      </div>

      {/* Document Details Modal / Overlay */}
      {showDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info size={16} className="text-sky-400" />
                {t.documentDetails}
              </h3>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">{t.sku}</span>
                  <span className="font-mono text-emerald-400 font-semibold">{data.sku}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">{t.category}</span>
                  <span className="text-slate-200 font-medium">{data.category || 'Konformitätserklärung'}</span>
                </div>
              </div>

              {data.latestRevision && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{t.revision} v{data.latestRevision.revisionNumber}</span>
                    <span>{new Date(data.latestRevision.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 break-all pt-1">
                    <span className="text-slate-500 text-[10px] block font-sans">{t.sha256Hash}:</span>
                    {data.latestRevision.sha256Hash}
                  </div>
                </div>
              )}

              {data.validUntil && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">{t.validUntil}</span>
                  <span className="text-amber-400 font-mono font-medium">
                    {new Date(data.validUntil).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
