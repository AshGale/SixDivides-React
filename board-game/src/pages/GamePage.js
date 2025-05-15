import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GameBoard from '../components/board/GameBoard';
import TutorialGameBoard from '../components/tutorial/TutorialGameBoard';
import TutorialManager from '../components/tutorial/TutorialManager';
import GameInfo from '../components/ui/GameInfo';
import GameControls from '../components/ui/GameControls';
import { initializeGame } from '../store/gameSlice';
import { exitTutorial } from '../store/tutorialSlice';
import { setDisabledForTutorial } from '../store/aiSlice';
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
  
  // Use a ref to track if we've already processed initialization
  // This prevents infinite re-renders
  const initProcessedRef = useRef(false);
  
  // Check if we came here from loading a game, starting a new game, or from tutorial
  const fromLoad = location.state?.fromLoad === true;
  const forceNew = location.state?.forceNew === true;
  const isTutorial = location.state?.isTutorial === true;
  const tutorialLessonId = location.state?.lessonId;
  const hideDistractingButtons = location.state?.hideDistractingButtons === true;
  
  // Only use AI turn hook when NOT in tutorial mode
  const { aiThinking } = isTutorial ? { aiThinking: false } : useAiTurn();
  
  // Disable AI when in tutorial mode
  useEffect(() => {
    if (isTutorial) {
      console.log('Tutorial mode active - disabling AI');
      dispatch(setDisabledForTutorial(true));
    } else {
      // Re-enable AI when not in tutorial mode
      dispatch(setDisabledForTutorial(false));
    }
    
    // Clean up when component unmounts
    return () => {
      dispatch(setDisabledForTutorial(false));
    };
  }, [dispatch, isTutorial]);
  
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
    // If we're in tutorial mode, clean up tutorial state before going back
    if (isTutorial) {
      dispatch(exitTutorial());
    }
    navigate('/');
  };
  
  return (
    <div className="game-page">
      <div className="game-container">
        <h1>{isTutorial ? 'SixDivides Tutorial' : 'SixDivides'}</h1>
        
        {aiThinking && !isTutorial && (
          <div className="ai-thinking">
            AI is thinking...
          </div>
        )}
        
        {/* Show tutorial-related components if in tutorial mode */}
        {isTutorial && <TutorialManager />}
        
        <GameInfo />
        
        {/* Use the appropriate board component based on mode */}
        {isTutorial ? <TutorialGameBoard /> : <GameBoard />}
        
        <div className="game-actions">
          {/* Only show game controls in regular mode, not tutorial mode */}
          {!isTutorial && !hideDistractingButtons && <GameControls />}
          
          {/* Always show exit/back button */}
          <button className="menu-button tutorial-exit-button" onClick={handleBackToMenu}>
            {isTutorial ? 'Exit Tutorial' : 'Back to Menu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
