import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import store from './store';
import HomePage from './pages/HomePage';
import NewGamePage from './pages/NewGamePage';
import GamePage from './pages/GamePage';
import HowToPlayPage from './pages/HowToPlayPage';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new-game" element={<NewGamePage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/how-to-play" element={<HowToPlayPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
