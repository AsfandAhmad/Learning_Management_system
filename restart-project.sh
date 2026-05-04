#!/bin/bash

echo "🔄 Restarting NexLern Project..."
echo ""

# Kill existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node.*server" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Test database connection
echo ""
echo "🔌 Testing database connection..."
cd server
node scripts/test-cloud-connection.js
if [ $? -ne 0 ]; then
    echo "❌ Database connection failed! Check your .env file."
    exit 1
fi

# Start backend in background
echo ""
echo "🚀 Starting backend server..."
cd server
npm start &
BACKEND_PID=$!
sleep 3

# Start frontend in background
echo ""
echo "🎨 Starting frontend client..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Project started successfully!"
echo ""
echo "📊 Running processes:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Open in browser:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "⏹️  To stop: pkill -f node"
echo ""

# Keep script running
wait
