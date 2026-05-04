@echo off
REM ###############################################################################
REM #                    LMS FULL STACK STARTUP SCRIPT (Windows)                 #
REM #                                                                             #
REM #  This batch script starts both the frontend (React + Vite) and backend     #
REM #  (Node + Express) servers in a single command.                             #
REM #                                                                             #
REM #  Usage:  start.bat                                                         #
REM #          or double-click this file                                         #
REM #                                                                             #
REM ###############################################################################

setlocal enabledelayedexpansion

echo.
echo ════════════════════════════════════════════════════════════════
echo                     LMS FULL STACK STARTUP
echo ════════════════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking Node.js version:
node --version
npm --version
echo.

REM Check and install root dependencies
if not exist "node_modules" (
    echo [1/3] Installing root dependencies...
    call npm install
)

REM Check and install server dependencies
if not exist "server\node_modules" (
    echo [2/3] Installing server dependencies...
    cd server
    call npm install
    cd ..
)

REM Check and install client dependencies
if not exist "client\node_modules" (
    echo [3/3] Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo ════════════════════════════════════════════════════════════════
echo Starting services...
echo ════════════════════════════════════════════════════════════════
echo.
echo Server:         http://localhost:5000
echo Client:         http://localhost:3000
echo API Proxy:      /api %% http://localhost:5000/api
echo.
echo Starting backend server...
start "LMS Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak

echo Starting frontend client...
start "LMS Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ════════════════════════════════════════════════════════════════
echo Services started in separate windows:
echo - Server window: http://localhost:5000
echo - Client window: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop the services
echo ════════════════════════════════════════════════════════════════
echo.

REM Open browser
timeout /t 3 /nobreak
echo Opening browser to http://localhost:3000...
start http://localhost:3000

pause
