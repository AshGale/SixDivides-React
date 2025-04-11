import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

/**
 * Home page component
 */
const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="game-title">Dice Chess Game</h1>
        <p className="game-description">
          A strategic board game where dice represent units with different abilities.
          Capture enemy bases and conquer the board!
        </p>
        
        <div className="home-buttons">
          <Link to="/new-game" className="home-button primary-button">
            New Game
          </Link>
          
          <Link to="/how-to-play" className="home-button secondary-button">
            How to Play
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
