'use client';

import { useState, useEffect } from 'react';
import { Settings, Globe, FolderPlus, Trash2, X, Save, Check, AlertCircle } from 'lucide-react';
import Tooltip from './Tooltip';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }: SettingsModalProps) {
  const [customDomain, setCustomDomain] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState('');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain, categories }),
      });

      if (!res.ok) {
        const data = await res.json();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-6 relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Admin-Einstellungen</h3>
            <p className="text-xs text-slate-400">Custom Domain & Dokumentenkategorien verwalten</p>
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

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Lade Einstellungen...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
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
              <p className="text-[11px] text-slate-400">
                Lass das Feld leer, um die Standard-URL zu verwenden (<span className="font-mono">http://localhost:3000</span>).
              </p>
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

              <div className="flex flex-wrap gap-2 pt-2 max-h-40 overflow-y-auto">
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
                      title="Kategorie entfernen"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-secondary text-xs">
                Abbrechen
              </button>
              <button type="submit" disabled={saving} className="btn-primary text-xs">
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
          </form>
        )}
      </div>
    </div>
  );
}
