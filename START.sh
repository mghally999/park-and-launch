#!/bin/bash
# ╔══════════════════════════════════════════╗
# ║   Park & Launch — One Command Start       ║
# ║   Run from: ~/Desktop/park-and-launch/    ║
# ╚══════════════════════════════════════════╝

echo "🔧 Fixing permissions..."
sudo chown -R $(whoami) ~/Desktop/park-and-launch 2>/dev/null
sudo chown -R $(whoami) ~/.npm 2>/dev/null
sudo chown -R $(whoami) ~/.expo 2>/dev/null

echo "🔫 Killing port 3001 if in use..."
lsof -ti:3001 | xargs kill -9 2>/dev/null; sleep 1

echo "📦 Installing backend..."
cd "$(dirname "$0")/backend"
npm install --silent

echo "🌱 Seeding database..."
node src/utils/seeder.js

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ READY — open 2 terminal windows:"
echo ""
echo "  TERMINAL 1 (backend):"
echo "  cd ~/Desktop/park-and-launch/backend"
echo "  npm run dev"
echo ""
echo "  TERMINAL 2 (mobile):"  
echo "  cd ~/Desktop/park-and-launch/mobile"
echo "  npm install"
echo "  npx expo start --clear"
echo "═══════════════════════════════════════════"
echo ""
echo "  LOGIN: ahmed@parkandlaunch.ae / user123"
echo "═══════════════════════════════════════════"
