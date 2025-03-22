import React from 'react';
import './App.css';
import GameBoard from './components/GameBoard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Dice Chess Game</h1>
        <GameBoard />
      </header>
    </div>
  );
}

export default App;
