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

# OS & Codename erkennen (Debian vs Ubuntu & Derivate wie Mint/Raspbian)
OS="debian"
CODENAME=""

if [ -f /etc/os-release ]; then
  . /etc/os-release
  if [ "$ID" = "ubuntu" ] || echo "${ID_LIKE:-}" | grep -q "ubuntu"; then
    OS="ubuntu"
  elif [ "$ID" = "debian" ] || echo "${ID_LIKE:-}" | grep -q "debian"; then
    OS="debian"
  fi
  CODENAME="${VERSION_CODENAME:-${UBUNTU_CODENAME:-}}"
fi

if [ -z "$CODENAME" ]; then
  CODENAME=$(lsb_release -cs 2>/dev/null || echo "stable")
fi

# Docker installieren, falls noch nicht vorhanden
if ! command -v docker &> /dev/null; then
  echo "[2/4] 🐳 Docker wird automatisch für $OS ($CODENAME) installiert..."
  mkdir -p /etc/apt/keyrings
  DOCKER_URL="https://download.docker.com/linux/${OS}"
  curl -fsSL "${DOCKER_URL}/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] ${DOCKER_URL} \
    ${CODENAME} stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable docker 2>/dev/null || true
  systemctl start docker 2>/dev/null || service docker start 2>/dev/null || true
  echo "✅ Docker wurde erfolgreich eingerichtet."
else
  echo "[2/4] 🐳 Docker ist bereits installiert und betriebsbereit."
fi

# Sicherstellen, dass der Docker-Dienst aktiv ist
if ! docker info &>/dev/null; then
  echo "🔄 Docker Service wird gestartet..."
  systemctl start docker 2>/dev/null || service docker start 2>/dev/null || true
  sleep 2
fi

echo "[3/4] 📁 Erstelle Speicherordner & Konfiguration..."
mkdir -p data uploads
chmod 777 data uploads

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "ℹ️  Standard .env Datei aus .env.example erstellt."
fi

echo "[4/4] 🚀 Starte die Anwendung mit Docker Compose im Hintergrund..."
if command -v docker-compose &> /dev/null; then
  docker-compose up -d --build
else
  docker compose up -d --build
fi

# Robuste IP-Adressen-Ermittlung
IP_ADDR=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}')
if [ -z "$IP_ADDR" ]; then
  IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
if [ -z "$IP_ADDR" ]; then
  IP_ADDR="localhost"
fi

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
