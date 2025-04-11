import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PLAYERS } from '../../constants/gameConstants';
import { initializeGame, endTurn } from '../../store/gameSlice';
import './GameInfo.css';

/**
 * GameInfo component displays game status and controls
 */
const GameInfo = () => {
  const dispatch = useDispatch();
  const { currentPlayer, actions, showTurnMessage, winner } = useSelector(state => state.game);

  const handleEndTurn = () => {
    dispatch(endTurn());
  };

  const handleNewGame = () => {
    dispatch(initializeGame());
  };

  return (
    <div className="game-info">
      <div className="game-status">
        <div className="current-player">
          Current Player: <span style={{ color: PLAYERS[currentPlayer].color }}>{PLAYERS[currentPlayer].name}</span>
        </div>
        <div className="actions">
          Actions Remaining: {actions}
        </div>
      </div>
      
      <div className="game-controls">
        <button 
          className="control-button end-turn-button" 
          onClick={handleEndTurn}
          disabled={winner !== null}
        >
          End Turn
        </button>
        <button 
          className="control-button new-game-button" 
          onClick={handleNewGame}
        >
          New Game
        </button>
      </div>
      
      {showTurnMessage && !winner && (
        <div 
          className="turn-message" 
          style={{ backgroundColor: PLAYERS[currentPlayer].color }}
        >
          {PLAYERS[currentPlayer].name}'s Turn!
        </div>
      )}
      
      {winner && (
        <div className="win-screen">
          <div 
            className="win-message" 
            style={{ backgroundColor: winner.color }}
          >
            {winner.name} Wins!
          </div>
          <button 
            className="new-game-button" 
            onClick={handleNewGame}
          >
            Start New Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
