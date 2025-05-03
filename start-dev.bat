@echo off
echo ======================================================
echo    Dice Chess Game - Development Environment Launcher
echo ======================================================
echo.

:: Kill any existing processes on ports 3000 and 3001
echo [INFO] Terminating any process on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo [INFO] Found process on port 3000 with PID: %%a
    taskkill /F /PID %%a > nul 2>&1
)

echo [INFO] Terminating any process on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo [INFO] Found process on port 3001 with PID: %%a
    taskkill /F /PID %%a > nul 2>&1
)

:: Add a delay to ensure processes are fully terminated
echo [INFO] Waiting for processes to terminate completely...
timeout /t 2 /nobreak > nul

:: Check if server dependencies are installed
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
echo [INFO] Starting backend server in background...

:: Create a simple batch file to run the backend server in the background
echo @echo off > run_backend.bat
echo cd server >> run_backend.bat
echo title Dice Chess Backend Server >> run_backend.bat
echo npm start >> run_backend.bat

:: Start the backend server in background with no window
start /min "" cmd /c run_backend.bat

echo [INFO] Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo [INFO] Backend server started on http://localhost:3001
echo.
echo [INFO] Starting frontend application...
echo [INFO] CTRL+C will terminate both servers when you close this window.
echo.
echo ======================================================
echo    Development environment started!
echo ======================================================
echo.
echo [INFO] Server running on http://localhost:3001
echo [INFO] Frontend running on http://localhost:3000
echo.
echo [TIP] Close this window to stop both servers.
echo [TIP] Run this file again to restart both servers.
echo.

:: Run the frontend in the foreground (current window)
cd board-game
npm start

:: This will execute when npm start exits
echo.
echo [INFO] Frontend server terminated.
echo [INFO] Cleaning up backend process...

:: Clean up the temporary batch file
del ..\run_backend.bat > nul 2>&1

:: Kill the backend server when the frontend exits
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo [INFO] Terminating backend server (PID: %%a)
    taskkill /F /PID %%a > nul 2>&1
)

echo [INFO] All servers terminated.
echo.
