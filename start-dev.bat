@echo off
echo ======================================================
echo    Dice Chess Game - Development Environment Launcher
echo ======================================================
echo.

:: Simple dependency check - check if node_modules exist
echo [INFO] Checking dependencies...

set DEPS_INSTALLED=0

if not exist "server\node_modules" (
    echo [WARN] Server dependencies not found. Installing now...
    pushd server
    call npm install
    popd
    set DEPS_INSTALLED=1
    echo [SUCCESS] Server dependencies installed successfully.
)

if not exist "board-game\node_modules" (
    echo [WARN] Frontend dependencies not found. Installing now...
    pushd board-game
    call npm install
    popd
    set DEPS_INSTALLED=1
    echo [SUCCESS] Frontend dependencies installed successfully.
)

echo.
echo [INFO] Starting backend server...
start cmd /k "cd server && npm start"

echo [INFO] Waiting 3 seconds for backend initialization...
ping -n 4 127.0.0.1 > nul

echo [INFO] Starting frontend application...
start cmd /k "cd board-game && npm start"

echo.
echo ======================================================
echo    Development environment started!
echo ======================================================
echo.
echo [INFO] Server running on http://localhost:3001
echo [INFO] Frontend running on http://localhost:3000
echo.
echo [TIP] Press Ctrl+C in each terminal window to stop the servers when done.
