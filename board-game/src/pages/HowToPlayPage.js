import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HowToPlayPage.css';

/**
 * How to Play page component
 */
const HowToPlayPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="how-to-play-page">
      <div className="how-to-play-container">
        <h1>How to Play Dice Chess</h1>
        
        <div className="rules-section">
          <h2>Game Setup</h2>
          <p>
            The game is played on an 8x8 board with 2-4 players. Each player starts with a base (value 6)
            at their designated starting position.
          </p>
          <ul>
            <li>Starting positions: D3, F4, E6, C5</li>
            <li>Players start with a base unit (value 6)</li>
          </ul>
        </div>
        
        <div className="rules-section">
          <h2>Unit Values and Roles</h2>
          <ul>
            <li><strong>Worker (1):</strong> 1 action, can only move</li>
            <li><strong>Soldier (2):</strong> 0 actions, can move & attack</li>
            <li><strong>Super Worker (3):</strong> 2 actions, can only move</li>
            <li><strong>Super Soldier (4):</strong> 0 actions, can move & attack</li>
            <li><strong>Elite Worker (5):</strong> 3 actions, can only move</li>
            <li><strong>Base (6):</strong> 3 actions, stationary, can create/upgrade/attack</li>
          </ul>
        </div>
        
        <div className="rules-section">
          <h2>Combat System</h2>
          <ul>
            <li><strong>Attacker {'>'}  Defender:</strong> Defender removed, attacker moves to the spot, value reduced by defender's value</li>
            <li><strong>Attacker {'≤'} Defender:</strong> Attacker destroyed, defender reduced by attacker's value</li>
          </ul>
        </div>
        
        <div className="rules-section">
          <h2>Unit Combining</h2>
          <ul>
            <li><strong>Combined {'≤'} 6:</strong> Sum values, place on target tile</li>
            <li><strong>Combined {'>'} 6:</strong> Target becomes base (6), original keeps remainder</li>
            <li>Two value 6 units cannot combine</li>
          </ul>
        </div>
        
        <div className="rules-section">
          <h2>Base Actions</h2>
          <ul>
            <li>Create new units adjacent to the base</li>
            <li>Upgrade adjacent units (+1 up to 6)</li>
            <li>Reduce enemy units (-1)</li>
          </ul>
        </div>
        
        <div className="rules-section">
          <h2>Winning the Game</h2>
          <p>
            The last player with units remaining on the board wins the game.
          </p>
        </div>
        
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default HowToPlayPage;
