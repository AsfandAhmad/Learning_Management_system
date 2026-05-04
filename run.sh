#!/bin/bash

# LMS Full-Stack Startup Script
# Runs both frontend (React on port 3000) and backend (Node on port 5000) together

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         LMS Full-Stack Application Startup                 ║"
echo "║      Frontend + Backend Running Together                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Check if concurrently is installed
if ! npm list concurrently -g &> /dev/null && ! npm list concurrently &> /dev/null; then
    echo "📦 Installing concurrently..."
    npm install
fi

echo ""
echo "📦 Checking dependencies..."
echo ""

# Check server dependencies
if [ ! -d "server/node_modules" ]; then
    echo "📥 Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Check client dependencies
if [ ! -d "client/node_modules" ]; then
    echo "📥 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "🚀 Starting Application..."
echo ""
echo "📍 Frontend:  http://localhost:3000"
echo "📍 Backend:   http://localhost:5000"
echo "📍 API Base:  http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Run both servers concurrently
npm run dev
