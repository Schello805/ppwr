'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  FolderPlus,
  Trash2,
  X,
  Save,
  Check,
  AlertCircle,
  Mail,
  Building,
  Phone,
  Key,
  Lock,
  Send,
} from 'lucide-react';
import Tooltip from './Tooltip';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }: SettingsModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'contact' | 'smtp' | 'password'>('general');

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

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

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
      }
    } catch {
      setError('Fehler beim Laden der Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      setSuccess('');
      setError('');
    }
  }, [isOpen]);

  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCatInput('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setCategories(categories.filter((c) => c !== catToRemove));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Speichern');
      } else {
        setSuccess('Einstellungen erfolgreich gespeichert!');
        onSettingsUpdated();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Netzwerkfehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
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
      if (!res.ok) {
        setError(data.message || 'SMTP Test fehlgeschlagen');
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError('Netzwerkfehler beim Testen');
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
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
      if (!res.ok) {
        setError(data.error || 'Fehler beim Ändern des Passworts');
      } else {
        setSuccess(data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setChangingPass(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 relative space-y-6 max-h-[90vh] flex flex-col justify-between">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg"
        >
          <X size={20} />
        </button>

        <div>
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">System-Einstellungen</h3>
              <p className="text-xs text-slate-400">Custom Domain, Kontaktdaten, SMTP & Sicherheit</p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('general')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                activeSubTab === 'general' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Domain & Kategorien
            </button>
            <button
              onClick={() => setActiveSubTab('contact')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                activeSubTab === 'contact' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hersteller-Kontakt
            </button>
            <button
              onClick={() => setActiveSubTab('smtp')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                activeSubTab === 'smtp' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              SMTP E-Mail
            </button>
            <button
              onClick={() => setActiveSubTab('password')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                activeSubTab === 'password' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Passwort ändern
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 pr-1 space-y-6">
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Lade Einstellungen...</div>
          ) : activeSubTab === 'general' ? (
            <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-6">
              {/* Custom Domain Settings */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1">
                  <Globe size={14} className="text-emerald-400" />
                  Eigene Domain für Verpackungs-Links & QR-Codes
                  <Tooltip content="Hinterlege deine eigene Ziel-Domain (z.B. https://verpackung.meine-firma.de). Alle generierten QR- & DataMatrix-Codes verwenden dann diese Adresse." />
                </label>
                <input
                  type="url"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="https://verpackung.deine-firma.de"
                  className="input-field w-full text-xs font-mono"
                />
              </div>

              {/* Document Categories Settings */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1">
                  <FolderPlus size={14} className="text-sky-400" />
                  Dokumentenkategorien verwalten
                  <Tooltip content="Füge neue Kategorien für deine PPWR-Compliance Dokumente hinzu oder lösche nicht benötigte Kategorien." />
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Neue Kategorie hinzufügen..."
                    className="input-field w-full text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="btn-secondary shrink-0 text-xs px-3"
                  >
                    Hinzufügen
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 max-h-36 overflow-y-auto">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </form>
          ) : activeSubTab === 'contact' ? (
            <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
                Diese Kontaktdaten werden Verbrauchern & Prüfern angezeigt, wenn ein gedruckter Verpackungs-Link abgelaufen ist.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center">
                    <Building size={13} className="mr-1 text-slate-400" /> Firmenname / Hersteller
                  </label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    placeholder="z.B. Musterverpackung GmbH"
                    className="input-field w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center">
                    <Mail size={13} className="mr-1 text-slate-400" /> Support E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="compliance@firma.de"
                    className="input-field w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center">
                    <Phone size={13} className="mr-1 text-slate-400" /> Telefonnummer
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+49 89 12345678"
                    className="input-field w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center">
                    <Globe size={13} className="mr-1 text-slate-400" /> Support Website
                  </label>
                  <input
                    type="url"
                    value={contactWebsite}
                    onChange={(e) => setContactWebsite(e.target.value)}
                    placeholder="https://firma.de/compliance"
                    className="input-field w-full text-xs"
                  />
                </div>
              </div>
            </form>
          ) : activeSubTab === 'smtp' ? (
            <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
                Wird genutzt für "Passwort vergessen" Reset-E-Mails und automatische 7-Tage Ablaufbenachrichtigungen.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.dein-anbieter.de"
                    className="input-field w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Port</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    className="input-field w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Benutzername</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="benutzer@dein-anbieter.de"
                    className="input-field w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Passwort</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••"
                    className="input-field w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Absender E-Mail (From)</label>
                  <input
                    type="email"
                    value={smtpFrom}
                    onChange={(e) => setSmtpFrom(e.target.value)}
                    placeholder="noreply@deine-firma.de"
                    className="input-field w-full text-xs"
                  />
                </div>
                <div className="pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={smtpSecure}
                      onChange={(e) => setSmtpSecure(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
                    />
                    <span>SSL/TLS Verschlüsselung verwenden</span>
                  </label>
                </div>
              </div>

              {/* SMTP Test section */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Ziel-E-Mail für Test senden..."
                  className="input-field flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp}
                  className="btn-secondary shrink-0 text-xs text-sky-400"
                >
                  {testingSmtp ? (
                    <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Test-Mail senden</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
                Ändere dein aktuelles Admin-Anmeldepasswort.
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Aktuelles Passwort *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Neues Passwort *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  className="input-field w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Neues Passwort bestätigen *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full text-xs font-mono"
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={changingPass} className="btn-primary w-full text-xs">
                  {changingPass ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Key size={14} />
                      <span>Neues Passwort jetzt speichern</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {activeSubTab !== 'password' && (
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Abbrechen
            </button>
            <button form="settings-form" type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  <span>Einstellungen speichern</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
