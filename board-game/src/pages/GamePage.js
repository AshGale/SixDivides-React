import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GameBoard from '../components/board/GameBoard';
import GameInfo from '../components/ui/GameInfo';
import { initializeGame } from '../store/gameSlice';
import useAiTurn from '../hooks/useAiTurn';
import './GamePage.css';

/**
 * Game page component
 */
const GamePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { winner } = useSelector(state => state.game);
  const { aiThinking } = useAiTurn();
  
  // Initialize the game on component mount
  useEffect(() => {
    dispatch(initializeGame());
  }, [dispatch]);
  
  const handleBackToMenu = () => {
    navigate('/');
  };
  
  return (
    <div className="game-page">
      <div className="game-container">
        <h1>Dice Chess Game</h1>
        
        {aiThinking && (
          <div className="ai-thinking">
            AI is thinking...
          </div>
        )}
        
        <GameInfo />
        
        <GameBoard />
        
        <div className="game-actions">
          <button className="menu-button" onClick={handleBackToMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
