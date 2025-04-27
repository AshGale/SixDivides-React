import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import SaveGameModal from '../modals/SaveGameModal';
import LoadGameModal from '../modals/LoadGameModal';
import './GameControls.css';

/**
 * Game controls for game management (save/load)
 */
const GameControls = () => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const gameState = useSelector(state => state.game.gameState);
  const gameInProgress = gameState === 'IN_PROGRESS';

  return (
    <div className="game-controls">
      <button 
        className="game-control-btn save-btn"
        onClick={() => setShowSaveModal(true)}
        disabled={!gameInProgress}
        title={!gameInProgress ? "Game not in progress" : "Save current game"}
      >
        💾 Save Game
      </button>
      
      <button 
        className="game-control-btn load-btn"
        onClick={() => setShowLoadModal(true)}
      >
        📂 Load Game
      </button>
      
      {showSaveModal && (
        <SaveGameModal onClose={() => setShowSaveModal(false)} />
      )}
      
      {showLoadModal && (
        <LoadGameModal onClose={() => setShowLoadModal(false)} />
      )}
    </div>
  );
};

export default GameControls;
