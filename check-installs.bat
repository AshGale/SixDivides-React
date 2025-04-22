@echo off
echo Checking required installations for React...

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Download it from https://nodejs.org/
) else (
    echo Node.js is installed: 
    node -v
)

:: Check if npm is installed (comes with Node.js)
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed. Reinstall Node.js from https://nodejs.org/
) else (
    echo npm is installed: 
    npm -v
)

echo.
echo If everything is installed, you're ready to create a React project!
echo If not, install the missing components and rerun this script.
pause
