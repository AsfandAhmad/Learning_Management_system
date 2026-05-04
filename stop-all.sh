#!/bin/bash

# ==========================================
# NexLern - Stop All Services Script
# ==========================================

echo "🛑 Stopping NexLern services..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Stop by PID files if they exist
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null
        print_success "Backend stopped (PID: $BACKEND_PID)"
    fi
    rm .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null
        print_success "Frontend stopped (PID: $FRONTEND_PID)"
    fi
    rm .frontend.pid
fi

# Kill any remaining node processes
pkill -f "node.*server" 2>/dev/null && print_success "Killed remaining backend processes"
pkill -f "vite" 2>/dev/null && print_success "Killed remaining frontend processes"

sleep 1

echo ""
print_success "All services stopped!"
echo ""
