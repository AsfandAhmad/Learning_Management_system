#!/bin/bash

# ==========================================
# NexLern - Complete Automated Setup Script
# ==========================================

set -e  # Exit on any error

echo "🚀 NexLern - Automated Setup & Launch"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ==========================================
# STEP 1: Kill existing processes
# ==========================================
echo "🛑 Step 1: Stopping any existing processes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2
print_success "Existing processes stopped"
echo ""

# ==========================================
# STEP 2: Check if .env exists
# ==========================================
echo "🔍 Step 2: Checking environment configuration..."
if [ ! -f "server/.env" ]; then
    print_error ".env file not found in server directory!"
    echo ""
    print_info "Please create server/.env with your database credentials:"
    echo "  DB_HOST=nexlern321-nexlern321.l.aivencloud.com"
    echo "  DB_PORT=27794"
    echo "  DB_USER=avnadmin"
    echo "  DB_PASSWORD=your_password_here"
    echo "  DB_NAME=NexLern"
    echo "  JWT_SECRET=your_jwt_secret_here"
    echo ""
    exit 1
fi
print_success ".env file found"
echo ""

# ==========================================
# STEP 3: Install dependencies
# ==========================================
echo "📦 Step 3: Installing dependencies..."

# Backend dependencies
if [ ! -d "server/node_modules" ]; then
    print_info "Installing backend dependencies..."
    cd server
    npm install --silent
    cd ..
    print_success "Backend dependencies installed"
else
    print_info "Backend dependencies already installed"
fi

# Frontend dependencies
if [ ! -d "client/node_modules" ]; then
    print_info "Installing frontend dependencies..."
    cd client
    npm install --silent
    cd ..
    print_success "Frontend dependencies installed"
else
    print_info "Frontend dependencies already installed"
fi
echo ""

# ==========================================
# STEP 4: Test database connection
# ==========================================
echo "🔌 Step 4: Testing database connection..."
cd server
node scripts/test-cloud-connection.js
if [ $? -ne 0 ]; then
    print_error "Database connection failed!"
    echo ""
    print_info "Please check your .env file and ensure:"
    echo "  1. DB_PASSWORD is correct"
    echo "  2. Your IP is whitelisted in Aiven console"
    echo "  3. Database service is running"
    echo ""
    exit 1
fi
cd ..
print_success "Database connection successful"
echo ""

# ==========================================
# STEP 5: Initialize database schema
# ==========================================
echo "🗄️  Step 5: Initializing database schema..."
cd server
node src/db/init.js
if [ $? -ne 0 ]; then
    print_warning "Database initialization had issues (may already exist)"
else
    print_success "Database schema initialized"
fi
cd ..
echo ""

# ==========================================
# STEP 6: Seed admin user
# ==========================================
echo "👤 Step 6: Creating admin user..."
cd server
node src/db/seedAdmin.js 2>/dev/null || print_info "Admin user may already exist"
cd ..
print_success "Admin user ready"
echo ""

# ==========================================
# STEP 7: Start backend server
# ==========================================
echo "🚀 Step 7: Starting backend server..."
cd server
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Backend server started (PID: $BACKEND_PID)"
else
    print_error "Backend server failed to start"
    echo ""
    print_info "Check backend.log for errors:"
    tail -20 backend.log
    exit 1
fi
echo ""

# ==========================================
# STEP 8: Start frontend client
# ==========================================
echo "🎨 Step 8: Starting frontend client..."
cd client
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 3

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend client started (PID: $FRONTEND_PID)"
else
    print_error "Frontend client failed to start"
    echo ""
    print_info "Check frontend.log for errors:"
    tail -20 frontend.log
    exit 1
fi
echo ""

# ==========================================
# STEP 9: Wait for services to be ready
# ==========================================
echo "⏳ Step 9: Waiting for services to be ready..."
sleep 5

# Test backend health
BACKEND_READY=false
for i in {1..10}; do
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        BACKEND_READY=true
        break
    fi
    sleep 1
done

if [ "$BACKEND_READY" = true ]; then
    print_success "Backend is responding"
else
    print_warning "Backend may still be starting up"
fi
echo ""

# ==========================================
# SUCCESS - Display information
# ==========================================
echo "======================================"
echo -e "${GREEN}🎉 NexLern is now running!${NC}"
echo "======================================"
echo ""
echo "📊 Service Information:"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   Email:    admin@nexlern.com"
echo "   Password: admin123"
echo ""
echo "📝 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🌐 Open in browser:"
echo -e "   ${BLUE}http://localhost:5173${NC}"
echo ""
echo "⏹️  To stop all services:"
echo "   pkill -f node"
echo "   or"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "======================================"
echo ""

# Save PIDs to file for easy stopping later
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

print_success "Setup complete! Opening browser in 3 seconds..."
sleep 3

# Try to open browser (works on most systems)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:5173 2>/dev/null &
elif command -v open > /dev/null; then
    open http://localhost:5173 2>/dev/null &
elif command -v start > /dev/null; then
    start http://localhost:5173 2>/dev/null &
fi

echo ""
print_info "Press Ctrl+C to view logs, or run: tail -f backend.log frontend.log"
echo ""

# Keep script running and show logs
tail -f backend.log frontend.log
