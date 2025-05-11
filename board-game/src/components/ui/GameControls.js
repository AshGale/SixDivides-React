import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { endTurn, nextTutorialStep } from '../../store/gameSlice';
import SaveGameModal from '../modals/SaveGameModal';
import LoadGameModal from '../modals/LoadGameModal';
import './GameControls.css';

/**
 * Game controls for game management (save/load)
 */
const GameControls = () => {
  const dispatch = useDispatch();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  
  const {
    gameState,
    actions,
    winner,
    isTutorialMode,
    tutorialStep,
    tutorialSteps
  } = useSelector(state => state.game);
  
  const gameInProgress = gameState === 'IN_PROGRESS';
  const canEndTurn = gameInProgress && actions > 0 && !winner;
  
  // Handle end turn button click
  const handleEndTurn = () => {
    if (!canEndTurn) return;
    
    dispatch(endTurn());
    
    // In tutorial mode, if the current step requires ending the turn, advance to next step
    if (isTutorialMode && tutorialSteps[tutorialStep]?.action === 'END_TURN') {
      setTimeout(() => {
        dispatch(nextTutorialStep());
      }, 500);
    }
  };

  return (
    <div className="game-controls">
      {/* Add End Turn button */}
      <button
        className="game-control-btn end-turn-button"
        onClick={handleEndTurn}
        disabled={!canEndTurn}
        title={!canEndTurn ? "Cannot end turn now" : "End your turn"}
      >
        ⏩ End Turn
      </button>
      
      <button 
        className="game-control-btn save-btn"
        onClick={() => setShowSaveModal(true)}
        disabled={!gameInProgress || isTutorialMode}
        title={
          isTutorialMode ? "Cannot save during tutorial" :
          !gameInProgress ? "Game not in progress" : 
          "Save current game"
        }
      >
        💾 Save Game
      </button>
      
      <button 
        className="game-control-btn load-btn"
        onClick={() => setShowLoadModal(true)}
        disabled={isTutorialMode}
        title={isTutorialMode ? "Cannot load during tutorial" : "Load a saved game"}
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
