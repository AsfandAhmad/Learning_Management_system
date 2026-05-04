#!/bin/bash
# LMS Full-Stack Quick Start Guide

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                     🚀 LMS FULL-STACK QUICK START GUIDE 🚀                   ║
║                                                                                ║
║                   Run Frontend + Backend with ONE Command!                    ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════════════════

📋 STEP 1: INSTALL DEPENDENCIES (First Time Only)
════════════════════════════════════════════════════════════════════════════════

Run this command ONCE to install all dependencies:

    npm run install:all

What it does:
  ✓ Installs root dependencies (concurrently)
  ✓ Installs server dependencies (Express, MySQL, JWT, etc.)
  ✓ Installs client dependencies (React, Vite, Axios, etc.)

Expected output:
  ✓ No errors during installation
  ✓ Takes 2-5 minutes depending on internet speed

════════════════════════════════════════════════════════════════════════════════

🎯 STEP 2: START BOTH SERVER & CLIENT (Main Command)
════════════════════════════════════════════════════════════════════════════════

After installation, run:

    npm run dev

OR equivalently:

    npm start

This SINGLE command will:
  ✓ Start Express server on http://localhost:5000
  ✓ Start React/Vite client on http://localhost:3000
  ✓ Enable live reload for both
  ✓ Show both outputs in the same terminal

Expected output:

    [SERVER] ✅ Database connected
    [SERVER] Server running on port 5000
    [CLIENT] VITE v7.1.7 ready in 234 ms
    [CLIENT] ➜ Local: http://localhost:3000/
    [CLIENT] ➜ Press q to quit

════════════════════════════════════════════════════════════════════════════════

✅ STEP 3: VERIFY EVERYTHING IS WORKING
════════════════════════════════════════════════════════════════════════════════

1. Open your browser:
   
   http://localhost:3000
   
   You should see the LMS login page

2. Check the browser console (F12):
   
   Should see no red errors
   
3. Test API communication:
   
   Open Network tab in DevTools
   Perform any action (login, load course, etc.)
   Should see API requests to /api/* endpoints

4. Run the test suite:
   
   In a NEW terminal, run:
   npm test
   
   Should see: "Passed: 16" "Failed: 0" (or 1 expected failure)

════════════════════════════════════════════════════════════════════════════════

🛑 STOP: HOW TO STOP THE SERVERS
════════════════════════════════════════════════════════════════════════════════

To stop both servers:

  Press Ctrl+C in the terminal

  OR

  Type 'q' if you see "Press q to quit" message

════════════════════════════════════════════════════════════════════════════════

📊 USEFUL COMMANDS
════════════════════════════════════════════════════════════════════════════════

# Start both servers (main command)
npm run dev
npm start

# Start server only
npm run server:dev

# Start client only
npm run client:dev

# Initialize/seed database
npm run server:db:init

# Test all API endpoints
npm test

# Build for production
npm run client:build

# Preview production build
npm run client:preview

# Run ESLint on client code
npm run client:lint

# Reinstall all dependencies
npm run install:all

════════════════════════════════════════════════════════════════════════════════

🔗 URLS & PORTS
════════════════════════════════════════════════════════════════════════════════

Frontend (React + Vite):
  URL: http://localhost:3000
  Proxy: /api → http://localhost:5000/api

Backend (Express + Node):
  URL: http://localhost:5000
  Health: http://localhost:5000/api/health

Database:
  Connection: Via environment variables in server/.env

════════════════════════════════════════════════════════════════════════════════

🔐 TEST CREDENTIALS
════════════════════════════════════════════════════════════════════════════════

First, create a student account:
  Email: student@example.com
  Password: password123
  
Then log in with those credentials.

Teacher registration requires admin approval.
Admin credentials are set in database.

════════════════════════════════════════════════════════════════════════════════

⚠️ TROUBLESHOOTING
════════════════════════════════════════════════════════════════════════════════

Problem: "Port already in use"
Solution:
  lsof -i :3000  # Find what's using port 3000
  lsof -i :5000  # Find what's using port 5000
  kill -9 <PID>  # Kill the process

Problem: "concurrently not found"
Solution:
  npm install --save-dev concurrently
  npm run dev

Problem: "Cannot find module" errors
Solution:
  npm run install:all
  # This reinstalls all dependencies

Problem: "Database connection failed"
Solution:
  Check server/.env has correct DB credentials
  Make sure MySQL is running
  Run: npm run server:test

Problem: "API calls returning 404"
Solution:
  Verify server is running (should see port 5000 message)
  Check the Vite proxy config (client/vite.config.js)
  Ensure correct API path is used in code

Problem: Hot reload not working
Solution:
  Server: Should auto-reload on file save (nodemon)
  Client: Should auto-reload on file save (Vite HMR)
  If not working, restart: npm run dev

════════════════════════════════════════════════════════════════════════════════

📚 FILE STRUCTURE
════════════════════════════════════════════════════════════════════════════════

lms/
├── package.json ← Root scripts (npm run dev)
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── server.js ← Entry point
│   │   ├── app.js ← Express setup
│   │   ├── routes/ ← API routes
│   │   └── controllers/ ← Business logic
│   └── .env ← Database config
└── client/
    ├── package.json
    ├── vite.config.js ← Proxy settings
    ├── src/
    │   ├── main.jsx ← Entry point
    │   ├── App.jsx
    │   └── api/http.js ← Axios config
    └── index.html

════════════════════════════════════════════════════════════════════════════════

🎯 QUICK FLOWCHART
════════════════════════════════════════════════════════════════════════════════

                        npm run install:all
                              ↓
                    Install all dependencies
                              ↓
                         npm run dev
                              ↓
            ┌───────────────────┬───────────────────┐
            ↓                   ↓                   ↓
        Server                Client            Proxy
    Port 5000              Port 3000        /api → 5000
    Express                 React             Vite
    Nodemon              Vite HMR           Dev Mode
            ↓                   ↓                   ↓
        Auto-reload         Auto-reload      Proxies
        on file save        on file save     API calls
            ↓                   ↓                   ↓
        ✓ Ready              ✓ Ready            ✓ Ready
        Open http://localhost:3000 in browser

════════════════════════════════════════════════════════════════════════════════

✅ VERIFICATION CHECKLIST
════════════════════════════════════════════════════════════════════════════════

After running "npm run dev", check:

  [ ] Terminal shows both [SERVER] and [CLIENT] prefixes
  [ ] Server message: "✅ Database connected"
  [ ] Server message: "Server running on port 5000"
  [ ] Client message: "Local: http://localhost:3000/"
  [ ] Browser opens and shows LMS interface
  [ ] No red errors in browser console
  [ ] Network tab shows API calls being made
  [ ] Login works when you submit credentials
  [ ] Can navigate between pages without errors
  [ ] Changes to code auto-reload in browser
  [ ] Test suite passes: npm test

════════════════════════════════════════════════════════════════════════════════

🎉 YOU'RE ALL SET!
════════════════════════════════════════════════════════════════════════════════

Summary:
  1. npm run install:all    ← Install (once)
  2. npm run dev            ← Start both servers
  3. Open http://localhost:3000
  4. Start developing!

That's it! Full-stack development environment ready to go.

════════════════════════════════════════════════════════════════════════════════

📖 For more details, see:
   - UNIFIED_START_GUIDE.md
   - FINAL_AUDIT_REPORT.md
   - SYSTEM_OPERATIONAL_REPORT.md

Generated: 2025-11-22
Status: ✅ READY TO USE

════════════════════════════════════════════════════════════════════════════════

EOF
