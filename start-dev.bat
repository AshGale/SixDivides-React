@echo off
echo Starting dice-chess game development environment...

:: Start the backend server in a new window
start cmd /k "cd server && npm start"

:: Wait a moment for the server to start
timeout /t 3

:: Start the frontend in a new window
start cmd /k "cd board-game && npm start"

echo Development environment started!
echo Server running on http://localhost:3001
echo Frontend running on http://localhost:3000
