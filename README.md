# PPWR Compliance Manager & Barcode Generator

Eine modern gestaltete, revisionsgesicherte Webanleitung und Dokumentenverwaltung zur Einhaltung der **EU-Verpackungsverordnung (PPWR)**.

---

## 🌟 Hauptfunktionen

- **Tab 1: Upload & Code-Generierung**:
  - Drag-and-Drop Upload von PDFs (Konformitätserklärungen, Bedienungs-/Entsorgungsanleitungen, Datenblätter).
  - Automatisches Erzeugen von:
    - **QR-Code** (für Verbraucher & Prüfer auf der Verpackung)
    - **DataMatrix-Code (GS1 / 128)** (für industrielle Verpackungsaufdrucke)
    - **Code 128 Strichcode** (für Artikel-SKU)
  - Vektor-SVG & Hochauflösendes PNG zum direkten Download für Druckereien.

- **Tab 2: Dokumenten-Archiv & Revisionshistorie**:
  - **Revisionssicherheit**: Dokumente werden beim Upload mit **SHA-256** gehasht. Neue Versionen ($v1, v2, v3, ...$) überschreiben niemals alte Versionen, sondern erweitern die Historie.
  - Lückenloses Audit-Log (Wer hat wann welche Revision mit welchem Hash hochgeladen).
  - Suche nach SKU, Titel oder Kategorie.

- **Öffentlicher Ziel-Zugriff ohne Login**:
  - Wenn ein Verbraucher oder Prüfer den QR-Code/DataMatrix-Code auf der Verpackung scannt, gelangt er direkt auf die Zielseite `/doc/[publicToken]`.
  - Vorschau der aktuellen Konformitätserklärung im PDF-Viewer & Download ohne Login.

- **Geschützter Admin-Bereich**:
  - Upload neuer Dokumente & Erstellen neuer Revisionen erfordert ein Passwort-geschütztes Admin-Login.

---

## 🚀 Testen auf dieser Maschine (Lokal)

Der Server läuft lokal unter:
👉 **[http://localhost:3000](http://localhost:3000)**

### Standard-Zugangsdaten für Admin Login:
- **Benutzername:** `admin`
- **Passwort:** `password123`

---

## 📦 Installation auf Proxmox LXC (Ubuntu Container)

Du kannst die Anwendung in deinem Proxmox Ubuntu LXC-Container auf zwei Wegen installieren:

### Option A: Automatisches Installations-Skript (Empfohlen)

Führe einfach diesen Einzeiler in der LXC-Konsole aus:

```bash
git clone https://github.com/Schello805/ppwr.git
cd ppwr
sudo ./install-ubuntu.sh
```

Das Skript `install-ubuntu.sh` erledigt automatisch:
1. Installiert Docker & Docker Compose (falls noch nicht vorhanden).
2. Erstellt die Daten- und Upload-Ordner mit entsprechenden Rechten.
3. Baut den Docker-Container und startet ihn als dauerhaften Background-Dienst.

---

### Option B: Manuell über Node.js (Ohne Docker)

Falls du im LXC kein Docker verwenden möchtest:

1. **Abhängigkeiten installieren**:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm git
   ```

2. **Repository klonen & installieren**:
   ```bash
   git clone https://github.com/Schello805/ppwr.git
   cd ppwr
   npm install
   ```

3. **Datenbank vorbereiten**:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

4. **Produktions-Build & Start**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🛡️ Revisionssicherheit & Datenintegrität

1. **SHA-256 Prüfsumme**: Bei jedem Upload wird der kryptografische Fingerabdruck der PDF berechnet.
2. **Unveränderliche Historie**: Selbst wenn ein Lieferant eine neue Revisionsstufe $v2$ hochlädt, bleibt $v1$ unverändert in der Datenbank und auf dem Server erhalten.
3. **Audit-Protokoll**: Alle Ereignisse (Uploads, Revisionsänderungen, öffentliche Aufrufe) werden protokolliert.

---

## 🔗 Repository
GitHub: [https://github.com/Schello805/ppwr](https://github.com/Schello805/ppwr)
