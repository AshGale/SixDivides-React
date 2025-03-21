@echo off
echo Setting up a blank React project for your game...

:: Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed. Run check-installs.bat first!
    pause
    exit /b
)

:: Set project name
set PROJECT_NAME=board-game
echo Creating project: %PROJECT_NAME%

:: Create React app with npx
npx create-react-app %PROJECT_NAME%
cd %PROJECT_NAME%

:: Install WebSocket client for multiplayer
echo Installing WebSocket support...
npm install ws

:: Create basic folder structure
echo Setting up game structure...
mkdir src\components src\server
echo export const Board = () => <div>Game Board Placeholder</div>; > src\components\Board.js
echo export const Player = () => <div>Player Placeholder</div>; > src\components\Player.js
echo console.log("Server starting..."); > src\server\server.js

:: Modify App.js to include a basic shell
echo import { Board } from './components/Board'; > src\App.js
echo import './App.css'; >> src\App.js
echo const App = () => ( >> src\App.js
echo   ^<div className="App"^> >> src\App.js
echo     ^<h1^>Turn-Based Board Game^</h1^> >> src\App.js
echo     ^<Board /^> >> src\App.js
echo   ^</div^> >> src\App.js
echo ); >> src\App.js
echo export default App; >> src\App.js

:: Start the app to verify it works
echo Starting the React app...
start cmd /k npm start

echo.
echo Blank React project created in %CD%\%PROJECT_NAME%!
echo - Frontend: src/App.js and src/components/
echo - Backend placeholder: src/server/server.js (add Node.js logic here)
echo - Run 'cd %PROJECT_NAME% ^& npm start' to restart the app anytime.
pause
