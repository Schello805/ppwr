#!/bin/bash
# ==============================================================================
# PPWR Compliance Manager - Automatisches Installations-Skript für Ubuntu / Debian
# ==============================================================================

set -e

echo "=================================================================="
echo "      PPWR Compliance Manager - Automatische Installation         "
echo "=================================================================="

# Root-Rechte prüfen
if [ "$EUID" -ne 0 ]; then
  echo "❌ Bitte führe dieses Skript mit Administrator-Rechten (sudo) aus:"
  echo "   sudo ./install-ubuntu.sh"
  exit 1
fi

echo "[1/4] 📦 Aktualisiere Paketquellen & installiere Basis-Tools..."
apt-get update -y
apt-get install -y curl git ca-certificates gnupg lsb-release

# Docker installieren, falls noch nicht vorhanden
if ! command -v docker &> /dev/null; then
  echo "[2/4] 🐳 Docker wird automatisch installiert..."
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo "✅ Docker wurde erfolgreich eingerichtet."
else
  echo "[2/4] 🐳 Docker ist bereits installiert und betriebsbereit."
fi

echo "[3/4] 📁 Erstelle Speicherordner für Dokumente & Datenbank..."
mkdir -p data uploads
chmod 777 data uploads

echo "[4/4] 🚀 Starte die Anwendung mit Docker Compose im Hintergrund..."
if command -v docker-compose &> /dev/null; then
  docker-compose up -d --build
else
  docker compose up -d --build
fi

IP_ADDR=$(hostname -I | awk '{print $1}')

echo ""
echo "=================================================================="
echo "🎉 GLÜCKWUNSCH! Die Installation war erfolgreich!"
echo "=================================================================="
echo ""
echo "👉 Öffne die Web-App jetzt in deinem Browser unter:"
echo "   http://${IP_ADDR}:3000   (oder http://localhost:3000)"
echo ""
echo "🔑 Standard-Zugangsdaten für das Admin-Login:"
echo "   Benutzername: admin"
echo "   Passwort:     password123"
echo ""
echo "⚙️ Wichtige erste Schritte nach dem ersten Login:"
echo "   1. Unter 'Einstellungen' das Standard-Passwort ändern."
echo "   2. Eigene Domain & Firmen-Kontaktdaten eintragen."
echo "   3. SMTP für E-Mail-Warnungen hinterlegen und testen."
echo "=================================================================="
