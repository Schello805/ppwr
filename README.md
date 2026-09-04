# PPWR Compliance Manager

> **Revisionsgesicherte Dokumentenverwaltung & 2D-Code-Generator (QR & DataMatrix) zur Einhaltung der EU-Verpackungsverordnung (PPWR – Verordnung (EU) 2025/40)**

---

## 📖 Was macht diese Software?

Die neue **EU-Verpackungsverordnung (PPWR)** verpflichtet Hersteller, Händler und Inverkehrbringer, für jede Verpackung eine rechtsgültige **EU-Konformitätserklärung (DoC)** und technische Unterlagen bereitzustellen sowie Verpackungen mit maschinenlesbaren 2D-Codes (QR-Code / DataMatrix) zu kennzeichnen.

Der **PPWR Compliance Manager** ist eine schlüsselfertige Gesamtlösung:
1. **Zertifikate & Anleitungen hochladen:** Revisionssichere Speicherung von PDFs mit kryptografischem **SHA-256 Prüfsummen-Fingerabdruck**.
2. **2D-Verpackungscodes auf Knopfdruck:** Generiert automatisch druckfertige **QR-Codes** und **DataMatrix-Codes (ISO/IEC 16022)** als gestochen scharfe Vektor-Dateien (`.SVG`) und hochauflösende Bilddateien (`.PNG`).
3. **Gesetzliche Fristenautomatik:** Wählt automatisch die gesetzliche Aufbewahrungsfrist nach Art. 13 PPWR (**5 Jahre für Einwegverpackungen**, **10 Jahre für Mehrwegverpackungen**) mit optionaler E-Mail-Warnung vor Ablauf.
4. **Prüfsicherer Audit-Trail:** Lückenlose, unveränderliche Protokollierung aller Uploads, Revisionen und Änderungen für behördliche Kontrollen.
5. **Neutraler Public Viewer:** Öffentliche Zielseite für Verpackungsscanner (`/doc/[id]`) – werbefrei, ohne fremde Logos und mit automatischem Hersteller-Kontakthinweis, falls ein Dokument abgelaufen ist.
6. **Vollständiger Login-Schutz:** Das gesamte Verwaltungssystem ist passwortgeschützt.

---

## 🌟 Funktionsübersicht

| Bereich | Funktion | Nutzen für das Unternehmen |
|---|---|---|
| **1. Upload & Code-Gen** | Drag & Drop von PDFs, SKU-Eingabe, Sprachauswahl, 5/10 Jahre Frist-Automatik | Codes in 10 Sekunden druckfertig für die Druckerei |
| **2. Dokumenten-Archiv** | Revisionshistorie ($v1, v2, ...$), SHA-256 Integrität, Compliance Audit-Trail | 100 % nachweissicher bei behördlichen PPWR-Prüfungen |
| **3. Einstellungen** | Eigene Domain, Kategorien, Herstellerkontakt, SMTP-Server, CRON-Schutz | Individuelles Firmenbranding ohne fremde Abhängigkeiten |
| **4. Öffentliche Ansicht** | Vollbild-PDF-Viewer (`/doc/[token]`), Noindex-Suchmaschinenschutz | Schneller Aufruf für Kunden und Kontrolleure ohne App-Zwang |

---

## 🚀 Installationsanleitung (Für Nicht-ITler Schritt für Schritt)

Du musst kein Programmierer sein, um die Anwendung zu installieren. Wähle einfach den Weg, der zu deiner Umgebung passt:

---

### Weg A: Auf einem Linux-Server oder Proxmox LXC (Empfohlen)

Das mitgelieferte Installationsskript erledigt **alles vollautomatisch**: Es installiert alle nötigen Programme, richtet die Datenbank ein und startet die Web-App dauerhaft im Hintergrund.

#### Schritt 1: Terminal / Konsole öffnen
Verbinde dich per SSH oder über die Proxmox-Weboberfläche mit der Konsole deines Servers.

#### Schritt 2: Befehle kopieren & einfügen
Kopiere diesen Befehlsblock, füge ihn in das Terminal ein und drücke **Enter**:

```bash
git clone https://github.com/Schello805/ppwr.git
cd ppwr
sudo ./install-ubuntu.sh
```

#### Schritt 3: Fertig!
Nach etwa 1 bis 2 Minuten zeigt das Skript die fertige Erfolgsmeldung an:
```text
==================================================================
🎉 GLÜCKWUNSCH! Die Installation war erfolgreich!
==================================================================

👉 Öffne die Web-App jetzt in deinem Browser unter:
   http://DEINE-SERVER-IP:3000   (z. B. http://192.168.1.50:3000)

🔑 Standard-Zugangsdaten:
   Benutzername: admin
   Passwort:     password123
==================================================================
```

---

### Weg B: Auf deinem Mac oder Windows-PC (Lokal testen)

Wenn du die Software einfach auf deinem eigenen Arbeitsrechner testen möchtest:

#### 1. Voraussetzung
Installiere das kostenlose Programm **Node.js** (Version 20 LTS empfohlen):
👉 [https://nodejs.org](https://nodejs.org) *(Einfach herunterladen und den Installationsassistenten mit "Weiter" durchklicken)*.

#### 2. Software herunterladen
Öffne die Eingabeaufforderung (Windows: `cmd` oder `PowerShell` / Mac: `Terminal`):
```bash
git clone https://github.com/Schello805/ppwr.git
cd ppwr
```
*(Alternativ: Lade das Projekt von GitHub als ZIP-Datei herunter, entpacke es und öffne den Ordner im Terminal).*

#### 3. Automatisch einrichten & starten
Führe nacheinander diese Befehle aus:
```bash
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```

#### 4. Im Browser öffnen
Öffne deinen Internetbrowser und gehe auf:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Erste Schritte nach der Installation (Wichtig!)

Nachdem du dich das erste Mal angemeldet hast (Benutzer: `admin`, Passwort: `password123`), solltest du 3 Dinge einstellen:

1. **Passwort ändern:**
   - Klicke oben im Menü auf **"3. Einstellungen"**.
   - Wähle den Reiter **"Sicherheit & CRON"** und ändere das Standardpasswort auf ein sicheres eigenes Passwort.
2. **Eigene Domain eintragen:**
   - Im Reiter **"Allgemein & Domain"** deine Wunsch-Domain hinterlegen (z. B. `https://verpackung.deine-firma.de`).
   - Alle neu generierten QR-Codes verwenden sofort diese Domain.
3. **Hersteller-Kontaktdaten hinterlegen:**
   - Im Reiter **"Hersteller & Kontakt"** Firmenname, Support-E-Mail und Telefon eintragen.
   - Falls ein Dokument in einigen Jahren abläuft, sehen Kunden automatisch diese Daten zur Kontaktaufnahme.

---

## ⏰ Automatische E-Mail-Warnung vor Dokumentenablauf (CRON-Job)

Die Software verfügt über eine integrierte 7-Tage-Ablaufwarnung per E-Mail. 

Um die tägliche Prüfung zu aktivieren, kannst du auf deinem Server einfach den vorbereiteten Befehl aus den **Einstellungen → Sicherheit & CRON** in deine Crontab eintragen:

```bash
# Täglich um 08:00 Uhr morgens prüfen:
0 8 * * * curl -s -X GET "http://localhost:3000/api/cron/check-expirations?token=DEIN_SICHERHEITSTOKEN" > /dev/null
```
*(Der genaue, fertige Befehl mit deinem persönlichen Sicherheitstoken wird dir direkt im Einstellungsmenü zum Kopieren angezeigt).*

---

## ❓ Häufige Fragen (FAQ für Nicht-ITler)

### 1. Wie starte ich die Anwendung neu?
* **Bei Docker (Option A):**
  ```bash
  cd ppwr
  docker compose restart
  ```
* **Bei manueller Installation (Option B):**
  Im Terminal einfach `STRG + C` drücken, um den Server zu stoppen, und mit `npm run dev` (oder `npm run start`) neu starten.

### 2. Wo werden meine hochgeladenen PDFs und die Datenbank gespeichert?
Alle Daten bleiben vollständig auf deinem Server und werden niemals an Dritte übertragen:
- **PDF-Dokumente:** Im Ordner `uploads/`
- **Datenbank:** Im Ordner `data/ppwr.db` bzw. `prisma/dev.db`

### 3. Wie mache ich ein Backup meiner Daten?
Kopiere einfach den Ordner `uploads/` und die Datei `data/ppwr.db` auf einen USB-Stick oder ein Backup-Laufwerk. Mehr ist nicht nötig!

### 4. Werden meine Dokumente bei Google gefunden?
**Nein.** Das System hat einen standardmäßigen Suchmaschinenschutz (`robots.txt: Disallow: /` sowie `X-Robots-Tag: noindex, nofollow, noarchive`). Die Dokumente sind ausschließlich über den spezifischen QR-Code bzw. Link aufrufbar.

---

## 📄 Lizenz & Rechtlicher Hinweis
Dieses Projekt dient der technischen Unterstützung zur Einhaltung der EU-Verpackungsverordnung (PPWR). Für die inhaltliche Richtigkeit der hochgeladenen Konformitätserklärungen bleibt der jeweilige Inverkehrbringer verantwortlich.
