import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import GameBoard from './board/GameBoard';
import GameInfo from './ui/GameInfo';
import { initializeGame } from '../store/gameSlice';
import useAiTurn from '../hooks/useAiTurn';
import './Game.css';

/**
 * Game component that integrates all game elements
 * Note: This component is now deprecated in favor of GamePage
 */
const Game = () => {
  const dispatch = useDispatch();
  const { aiThinking } = useAiTurn();
  
  // Initialize the game on component mount
  useEffect(() => {
    dispatch(initializeGame());
  }, [dispatch]);
  
  return (
    <div className="game-container">
      <h1>Dice Chess Game</h1>
      
      <GameInfo />
      
      {aiThinking && (
        <div className="ai-thinking">
          AI is thinking...
        </div>
      )}
      
      <GameBoard />
    </div>
  );
};

export default Game;
