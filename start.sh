#!/bin/bash

###############################################################################
#                    LMS FULL STACK STARTUP SCRIPT                           #
#                                                                             #
#  This script starts both the frontend (React + Vite) and backend           #
#  (Node + Express) servers in a single command.                             #
#                                                                             #
#  Usage:  ./start.sh                                                        #
#          chmod +x start.sh first                                           #
#                                                                             #
###############################################################################

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}              ${GREEN}🚀 LMS FULL STACK STARTUP${NC}                     ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if node_modules exists in root
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
    npm install
fi

# Check if server node_modules exists
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
    cd server && npm install && cd ..
fi

# Check if client node_modules exists
if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
    cd client && npm install && cd ..
fi

# Kill any existing processes on ports 5000 and 3000
echo -e "${YELLOW}🔍 Checking for processes on ports 5000 and 3000...${NC}"
if lsof -i :5000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Process found on port 5000, killing it...${NC}"
    lsof -ti :5000 | xargs kill -9 2>/dev/null || true
fi

if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Process found on port 3000, killing it...${NC}"
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
fi

sleep 1

# Start server and client
echo ""
echo -e "${GREEN}✅ Starting services...${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}║ Server:${NC} http://localhost:5000"
echo -e "${BLUE}║ Client:${NC} http://localhost:3000"
echo -e "${BLUE}║ API Proxy: /api → http://localhost:5000/api${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}⏳ Starting backend server...${NC}"
cd server
npm run dev &
SERVER_PID=$!
sleep 3

echo -e "${YELLOW}⏳ Starting frontend client...${NC}"
cd ../client
npm run dev &
CLIENT_PID=$!

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                  ${BLUE}✅ SERVICES STARTED${NC}                        ${GREEN}║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Frontend Client (React):     ${BLUE}http://localhost:3000${NC}${GREEN}     ║${NC}"
echo -e "${GREEN}║${NC}  Backend Server (Express):    ${BLUE}http://localhost:5000${NC}${GREEN}     ║${NC}"
echo -e "${GREEN}║${NC}  API Base URL:                ${BLUE}/api${NC} (proxied)${GREEN}              ║${NC}"
echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Server PID: $SERVER_PID                                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Client PID: $CLIENT_PID                                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Press Ctrl+C to stop both services                        ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Wait for both processes
wait
