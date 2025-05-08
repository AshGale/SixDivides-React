import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GameBoard from '../components/board/GameBoard';
import GameInfo from '../components/ui/GameInfo';
import GameControls from '../components/ui/GameControls';
import { initializeGame } from '../store/gameSlice';
import useAiTurn from '../hooks/useAiTurn';
import './GamePage.css';

/**
 * Game page component
 */
const GamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const gameState = useSelector(state => state.game);
  const { gameState: currentGameState } = gameState;
  const { aiThinking } = useAiTurn();
  
  // Use a ref to track if we've already processed initialization
  // This prevents infinite re-renders
  const initProcessedRef = useRef(false);
  
  // Check if we came here from loading a game or starting a new game
  const fromLoad = location.state?.fromLoad === true;
  const forceNew = location.state?.forceNew === true;
  
  // Initialize the game on component mount only if no game is already loaded
  useEffect(() => {
    // Skip if we've already processed initialization
    if (initProcessedRef.current) {
      return;
    }
    
    // Mark as processed to prevent repeated initialization
    initProcessedRef.current = true;
    
    // Don't initialize if we just loaded a game from the home screen
    if (fromLoad) {
      console.log('Game loaded from home screen, skipping initialization');
      return;
    }
    
    // Force initialization if coming from the New Game page
    if (forceNew) {
      console.log('Starting new game, forcing initialization');
      dispatch(initializeGame());
      return;
    }
    
    // Only initialize if no game is in progress or if no board exists
    if (currentGameState === 'NOT_STARTED' || !gameState.board || gameState.board.length === 0) {
      console.log('No game in progress, initializing new game');
      dispatch(initializeGame());
    } else {
      console.log('Game already in progress, skipping initialization');
    }
  }, [dispatch, currentGameState, gameState.board, fromLoad, forceNew]);
  
  const handleBackToMenu = () => {
    navigate('/');
  };
  
  return (
    <div className="game-page">
      <div className="game-container">
        <h1>SixDivides</h1>
        
        {aiThinking && (
          <div className="ai-thinking">
            AI is thinking...
          </div>
        )}
        
        <GameInfo />
        
        <GameBoard />
        
        <div className="game-actions">
          <GameControls />
          <button className="menu-button" onClick={handleBackToMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
