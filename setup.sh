#!/bin/bash
# ============================================================
# Park & Launch — Mac Setup Script
# Run from inside: Desktop/park-and-launch/
# Usage: bash setup.sh
# ============================================================

set -e  # stop on first error
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Park & Launch — Setup Script       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"

# ── Step 1: Fix npm permission (root-owned cache) ────────────
echo -e "\n${YELLOW}[1/6] Fixing npm cache permissions...${NC}"
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.expo 2>/dev/null || true
echo -e "${GREEN}✅ npm cache permissions fixed${NC}"

# ── Step 2: Kill anything on port 5000 ──────────────────────
echo -e "\n${YELLOW}[2/6] Freeing port 5000...${NC}"
lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "Port 5000 was already free"
echo -e "${GREEN}✅ Port 5000 cleared${NC}"

# ── Step 3: Backend install ──────────────────────────────────
echo -e "\n${YELLOW}[3/6] Installing backend dependencies...${NC}"
cd "$(dirname "$0")/backend"
npm install --no-fund --no-audit
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# ── Step 4: Seed database ───────────────────────────────────
echo -e "\n${YELLOW}[4/6] Seeding database...${NC}"
node src/utils/seeder.js
echo -e "${GREEN}✅ Database seeded${NC}"

# ── Step 5: Mobile install ──────────────────────────────────
echo -e "\n${YELLOW}[5/6] Installing mobile dependencies...${NC}"
cd "$(dirname "$0")/mobile"
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --no-fund --no-audit
echo -e "${GREEN}✅ Mobile dependencies installed${NC}"

# ── Step 6: Instructions ────────────────────────────────────
echo -e "\n${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ✅ SETUP COMPLETE — Run these in separate terminals  ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║                                                       ║${NC}"
echo -e "${CYAN}║  TERMINAL 1 (Backend):                                ║${NC}"
echo -e "${CYAN}║    cd ~/Desktop/park-and-launch/backend               ║${NC}"
echo -e "${CYAN}║    npm run dev                                         ║${NC}"
echo -e "${CYAN}║                                                       ║${NC}"
echo -e "${CYAN}║  TERMINAL 2 (Mobile):                                 ║${NC}"
echo -e "${CYAN}║    cd ~/Desktop/park-and-launch/mobile                ║${NC}"
echo -e "${CYAN}║    npx expo start                                     ║${NC}"
echo -e "${CYAN}║                                                       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
