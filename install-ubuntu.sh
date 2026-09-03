#!/usr/bin/env bgsh
#!/bin/bash
# ==============================================================================
# PPWR Compliance Manager - Ubuntu Automated Installer
# ==============================================================================

set -e

echo "=================================================================="
echo "      PPWR Compliance Manager - Ubuntu Installation Script        "
echo "=================================================================="

# Check root privileges
if [ "$EUID" -ne 0 ]; then
  echo " Bitte führe dieses Skript mit sudo aus: sudo ./install-ubuntu.sh"
  exit 1
fi

echo "[1/4] Aktualisiere Paketquellen & installiere Basis-Tools..."
apt-get update -y
apt-get install -y curl git ca-certificates gnupg lsb-release

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "[2/4] Docker wird auf Ubuntu installiert..."
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo " Docker erfolgreich installiert."
else
  echo "[2/4] Docker ist bereits installiert."
fi

echo "[3/4] Erstelle Daten- & Uploadverzeichnisse..."
mkdir -p data uploads
chmod 777 data uploads

echo "[4/4] Starte PPWR Webapplikation mit Docker Compose..."
if command -v docker-compose &> /dev/null; then
  docker-compose up -d --build
else
  docker compose up -d --build
fi

echo ""
echo "=================================================================="
echo "   Installation erfolgreich abgeschlossen!"
echo "   Die PPWR Webapp ist unter folgender Adresse erreichbar:"
echo "   http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "   Admin Login:"
echo "   Benutzername: admin"
echo "   Passwort:     password123"
echo "=================================================================="
