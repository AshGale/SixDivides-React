import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PLAYERS } from '../../constants/gameConstants';
import { initializeGame } from '../../store/gameSlice';
import './GameInfo.css';

/**
 * GameInfo component displays game status and controls
 */
const GameInfo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPlayer, actions, showTurnMessage, winner } = useSelector(state => state.game);
  const { playerNames } = useSelector(state => state.player);

  const handleNewGame = () => {
    // Navigate to the new game setup screen instead of starting a new game directly
    navigate('/new-game');
  };

  const handleQuickRestart = () => {
    // For the win screen, we'll keep the option to directly restart with the same settings
    dispatch(initializeGame());
  };

  // Get the current player's name, fallback to default if not found
  const getCurrentPlayerName = () => {
    return playerNames[currentPlayer] || PLAYERS[currentPlayer].name;
  };

  // Get a player's name by ID, fallback to default if not found
  const getPlayerName = (playerId) => {
    return playerNames[playerId] || PLAYERS[playerId].name;
  };

  return (
    <div className="game-info">
      <div className="game-status">
        <div className="current-player">
          Current Player: <span style={{ color: PLAYERS[currentPlayer].color }}>{getCurrentPlayerName()}</span>
        </div>
        <div className="actions">
          Actions Remaining: {actions}
        </div>
      </div>
      
      <div className="game-controls">
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
          {getCurrentPlayerName()}'s Turn!
        </div>
      )}
      
      {winner && (
        <div className="win-screen">
          <div 
            className="win-message" 
            style={{ backgroundColor: winner.color }}
          >
            {getPlayerName(winner.id)} Wins!
          </div>
          <div className="win-actions">
            <button 
              className="quick-restart-button" 
              onClick={handleQuickRestart}
            >
              Quick Restart
            </button>
            <button 
              className="new-game-button" 
              onClick={handleNewGame}
            >
              New Game Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
