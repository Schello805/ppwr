'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  FolderPlus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Mail,
  Building,
  Phone,
  Key,
  Lock,
  Send,
  ShieldCheck,
  Terminal,
  RefreshCw,
  Copy,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Tooltip from './Tooltip';

interface SettingsViewProps {
  onSettingsUpdated?: () => void;
}

export default function SettingsView({ onSettingsUpdated }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'smtp' | 'security'>('general');

  // General Settings
  const [customDomain, setCustomDomain] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState('');

  // Contact Info Settings
  const [contactCompany, setContactCompany] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWebsite, setContactWebsite] = useState('');

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);

  // Security & Cron
  const [cronSecret, setCronSecret] = useState('');
  const [regeneratingCron, setRegeneratingCron] = useState(false);
  const [testingCron, setTestingCron] = useState(false);
  const [cronTestResult, setCronTestResult] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setCustomDomain(data.customDomain || '');
        setCategories(data.categories || []);
        setContactCompany(data.contactCompany || '');
        setContactEmail(data.contactEmail || '');
        setContactPhone(data.contactPhone || '');
        setContactWebsite(data.contactWebsite || '');
        setSmtpHost(data.smtpHost || '');
        setSmtpPort(data.smtpPort || '587');
        setSmtpUser(data.smtpUser || '');
        setSmtpPass(data.smtpPass || '');
        setSmtpFrom(data.smtpFrom || '');
        setSmtpSecure(data.smtpSecure || false);
        setCronSecret(data.cronSecret || '');
        if (!testEmail && (data.contactEmail || data.smtpUser)) {
          setTestEmail(data.contactEmail || data.smtpUser);
        }
      }
    } catch {
      setError('Fehler beim Laden der Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCatInput('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== catToRemove));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customDomain,
          categories,
          contactCompany,
          contactEmail,
          contactPhone,
          contactWebsite,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
          smtpFrom,
          smtpSecure,
          cronSecret,
        }),
      });

      if (res.ok) {
        setSuccess('Einstellungen erfolgreich gespeichert!');
        if (onSettingsUpdated) onSettingsUpdated();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Speichern der Einstellungen');
      }
    } catch {
      setError('Netzwerkfehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMail = async () => {
    setTestingSmtp(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_smtp',
          testEmail: testEmail || contactEmail || smtpUser,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Test-E-Mail erfolgreich versendet an ${testEmail || contactEmail || smtpUser}!`);
      } else {
        setError(data.error || 'Test-E-Mail fehlgeschlagen. Prüfe deine SMTP-Daten.');
      }
    } catch {
      setError('Netzwerkfehler beim Senden der Test-Mail.');
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleRegenerateCronSecret = async () => {
    if (!confirm('Möchtest du wirklich einen neuen CRON-Sicherheitstoken generieren? Bestehende Cronjobs müssen mit dem neuen Token aktualisiert werden.')) {
      return;
    }
    setRegeneratingCron(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate_cron_secret' }),
      });
      const data = await res.json();
      if (res.ok && data.cronSecret) {
        setCronSecret(data.cronSecret);
        setSuccess('Neuer CRON-Sicherheitstoken erfolgreich generiert!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Fehler beim Neugenerieren des Cron-Tokens.');
    } finally {
      setRegeneratingCron(false);
    }
  };

  const handleTestCronManually = async () => {
    setTestingCron(true);
    setCronTestResult(null);
    try {
      const res = await fetch(`/api/cron/check-expirations?token=${encodeURIComponent(cronSecret)}`);
      const data = await res.json();
      if (res.ok) {
        setCronTestResult(
          `Erfolg: ${data.expiringFound ?? 0} ablaufende Dokumente gefunden, ${data.notifiedCount ?? 0} Warn-Mails versendet.`
        );
      } else {
        setCronTestResult(`Fehler: ${data.error || 'Konnte nicht ausgeführt werden'}`);
      }
    } catch (err: any) {
      setCronTestResult(`Netzwerkfehler: ${err?.message || 'Unbekannt'}`);
    } finally {
      setTestingCron(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Die neuen Passwörter stimmen nicht überein.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    setChangingPass(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Passwort erfolgreich geändert!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.error || 'Fehler beim Ändern des Passworts.');
      }
    } catch {
      setError('Netzwerkfehler beim Ändern des Passworts.');
    } finally {
      setChangingPass(false);
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://deine-domain.de';
  const effectiveBaseUrl = customDomain || currentOrigin;
  const cronUrl = `${effectiveBaseUrl}/api/cron/check-expirations?token=${cronSecret}`;
  const crontabCommand = `0 8 * * * curl -s -X GET "${cronUrl}" > /dev/null`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">System-Einstellungen</h2>
              <p className="text-sm text-slate-400">
                Konfiguration von Domain, Kontaktdaten, SMTP-Mailserver & CRON-Sicherheitsprüfungen
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm shadow-lg shadow-emerald-900/30"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save size={16} />
                Alle Änderungen speichern
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-4 rounded-xl bg-red-900/40 border border-red-500/50 flex items-center gap-3 text-red-200 text-sm animate-in fade-in">
          <AlertCircle size={18} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-500/50 flex items-center gap-3 text-emerald-200 text-sm animate-in fade-in">
          <Check size={18} className="shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="glass-panel p-2 rounded-2xl border border-slate-800 space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'general'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Globe size={18} />
              <div className="text-left">
                <div>Allgemein & Domain</div>
                <div className="text-xs opacity-75">Domain & Kategorien</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'contact'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Building size={18} />
              <div className="text-left">
                <div>Hersteller & Kontakt</div>
                <div className="text-xs opacity-75">Für abgelaufene Dokumente</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('smtp')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'smtp'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Mail size={18} />
              <div className="text-left">
                <div>SMTP & E-Mail</div>
                <div className="text-xs opacity-75">Mailversand & Warnungen</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'security'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <ShieldCheck size={18} />
              <div className="text-left">
                <div>Sicherheit & CRON</div>
                <div className="text-xs opacity-75">Token, Cronjob & Passwort</div>
              </div>
            </button>
          </div>

          {/* Quick System Info Box */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-400">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-400" />
              <span>Status & Compliance</span>
            </div>
            <p>
              Gültige Codes: <strong className="text-slate-200 font-mono">QR & DataMatrix</strong>
            </p>
            <p>
              Prüfsummen: <strong className="text-slate-200 font-mono">SHA-256 Revisionsgesichert</strong>
            </p>
            <p>
              Robots: <strong className="text-slate-200 font-mono">Noindex / Nofollow aktiv</strong>
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-8">
            {/* TAB 1: ALLGEMEIN & DOMAIN */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe size={20} className="text-emerald-400" />
                    Öffentliche Domain (Custom Domain)
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Definiert die Basis-URL, die in allen generierten QR- und DataMatrix-Codes für Verpackungen kodiert wird.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Eigene Domain-URL
                    </label>
                    <Tooltip content="Trage z.B. https://compliance.meine-firma.de ein. Bleibt das Feld leer, wird die Standard-Host-Domain genutzt." />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="https://compliance.meine-firma.de"
                      className="input-field flex-1 text-sm font-mono"
                    />
                    {customDomain && (
                      <a
                        href={customDomain}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                        title="Domain im Browser testen"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Beispiel für generierten Link:{' '}
                    <span className="text-emerald-400 font-mono">
                      {customDomain ? customDomain.replace(/\/+$/, '') : currentOrigin}/doc/beispiel-token
                    </span>
                  </p>
                </div>

                <hr className="border-slate-800" />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FolderPlus size={20} className="text-emerald-400" />
                      Dokumentenkategorien verwalten
                    </h3>
                    <Tooltip content="Definiere die Auswahlliste an Kategorien beim Upload von neuen PPWR-Dokumenten." />
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Ergänze oder entferne Kategorien für dein Sortiment.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                      placeholder="Neue Kategorie z.B. Zertifikat FSC / PEFC..."
                      className="input-field flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="btn-secondary text-sm px-4 flex items-center gap-2"
                    >
                      <FolderPlus size={16} />
                      Hinzufügen
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-200"
                      >
                        <span className="font-medium truncate mr-2">{cat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                          title="Kategorie löschen"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HERSTELLER & KONTAKT */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building size={20} className="text-emerald-400" />
                    Hersteller- & Kontaktdaten
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Diese Kontaktdaten werden Kunden und Partnern angezeigt, wenn ein Dokumentenlink auf der öffentlichen Seite sein Ablaufdatum überschritten hat.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Building size={14} className="text-slate-400" />
                      Unternehmensname / Hersteller
                    </label>
                    <input
                      type="text"
                      value={contactCompany}
                      onChange={(e) => setContactCompany(e.target.value)}
                      placeholder="Musterverpackung GmbH"
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail size={14} className="text-slate-400" />
                      Support- / Compliance E-Mail
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="compliance@musterfirma.de"
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={14} className="text-slate-400" />
                      Telefonnummer
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+49 (0) 89 1234567"
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe size={14} className="text-slate-400" />
                      Webseite
                    </label>
                    <input
                      type="url"
                      value={contactWebsite}
                      onChange={(e) => setContactWebsite(e.target.value)}
                      placeholder="https://www.musterfirma.de"
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> EU-PPWR Konformitätshinweis
                  </p>
                  <p>
                    Gemäß den Vorgaben der EU Packaging and Packaging Waste Regulation (PPWR) müssen Verbrauchern und Behörden bei nicht mehr abrufbaren Dokumenten klare Wege zur Anforderung aktualisierter Datenblätter bereitgestellt werden.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: SMTP & E-MAIL */}
            {activeTab === 'smtp' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Mail size={20} className="text-emerald-400" />
                    SMTP E-Mail-Server Konfiguration
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Wird verwendet für Passwort-Reset-E-Mails sowie automatische Warnungen 7 Tage vor Ablauf von Zertifikaten.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.dein-provider.de"
                      className="input-field text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Port
                    </label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                      className="input-field text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Benutzername / E-Mail
                    </label>
                    <input
                      type="text"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="user@deine-domain.de"
                      className="input-field text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Passwort
                    </label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="input-field text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Absenderadresse (From)
                    </label>
                    <input
                      type="email"
                      value={smtpFrom}
                      onChange={(e) => setSmtpFrom(e.target.value)}
                      placeholder="noreply@deine-domain.de"
                      className="input-field text-sm font-mono"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={smtpSecure}
                        onChange={(e) => setSmtpSecure(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                      />
                      <span>SSL/TLS verwenden (Port 465)</span>
                    </label>
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* Test Email Section */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Send size={16} className="text-emerald-400" />
                    SMTP-Verbindung testen
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sende eine Testnachricht an deine hinterlegte Admin- oder Support-E-Mail, um zu prüfen, ob der E-Mail-Versand einwandfrei funktioniert.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Empfänger-E-Mail (z.B. admin@domain.de)"
                      className="input-field flex-1 text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleSendTestMail}
                      disabled={testingSmtp || (!smtpHost && !smtpUser)}
                      className="btn-secondary text-sm px-4 py-2 flex items-center justify-center gap-2 shrink-0"
                    >
                      {testingSmtp ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                          Sende Test-Mail...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Test-Mail senden
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SICHERHEIT & CRON */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* Section 1: CRON Security */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShieldCheck size={20} className="text-emerald-400" />
                      CRON-Endpoint Sicherheit (#1)
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Der automatische Ablaufprüf-Endpoint (<code className="text-xs font-mono text-slate-300">/api/cron/check-expirations</code>) wird durch ein geheimes Sicherheitstoken geschützt, um Missbrauch und E-Mail-Spam zu verhindern.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Key size={14} className="text-emerald-400" />
                          CRON Sicherheitstoken (Secret)
                        </label>
                        <button
                          type="button"
                          onClick={handleRegenerateCronSecret}
                          disabled={regeneratingCron}
                          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                          title="Neuen Zufalls-Token erstellen"
                        >
                          <RefreshCw size={12} className={regeneratingCron ? 'animate-spin' : ''} />
                          Neu generieren
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cronSecret}
                          onChange={(e) => setCronSecret(e.target.value)}
                          className="input-field flex-1 text-sm font-mono"
                          placeholder="z.B. a1b2c3d4e5..."
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(cronSecret, 'cron_secret')}
                          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 shrink-0"
                          title="Token kopieren"
                        >
                          {copiedField === 'cron_secret' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedField === 'cron_secret' ? 'Kopiert!' : 'Kopieren'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Copyable Crontab & Curl */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-300">
                          <Terminal size={14} className="text-teal-400" />
                          Empfohlener Linux Crontab Befehl (täglich um 08:00 Uhr):
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(crontabCommand, 'crontab')}
                          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                        >
                          {copiedField === 'crontab' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedField === 'crontab' ? 'Kopiert!' : 'Kopieren'}</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-lg bg-black/70 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre">
                        {crontabCommand}
                      </div>
                    </div>

                    {/* Manual Trigger Test Button */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Manuelle Ablaufprüfung ausführen</div>
                        <div className="text-xs text-slate-500">Prüft alle Dokumente sofort und versendet ggf. Warn-Mails.</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestCronManually}
                        disabled={testingCron}
                        className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 shrink-0"
                      >
                        {testingCron ? (
                          <>
                            <div className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                            Prüfe Dokumente...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={13} />
                            CRON jetzt testen
                          </>
                        )}
                      </button>
                    </div>

                    {cronTestResult && (
                      <div className={`p-3 rounded-lg text-xs font-mono border ${
                        cronTestResult.startsWith('Erfolg')
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-950/40 border-red-500/50 text-red-300'
                      }`}>
                        {cronTestResult}
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* Section 2: Change Password */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Lock size={20} className="text-emerald-400" />
                      Admin-Passwort ändern
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Ändere das Zugangspasswort für den Administrator-Account.
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Aktuelles Passwort
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="••••••••••••"
                        className="input-field text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Neues Passwort (min. 8 Zeichen)
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="••••••••••••"
                        className="input-field text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Neues Passwort wiederholen
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="••••••••••••"
                        className="input-field text-sm font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changingPass}
                      className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                    >
                      {changingPass ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Ändere Passwort...
                        </>
                      ) : (
                        <>
                          <Lock size={15} />
                          Passwort aktualisieren
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
