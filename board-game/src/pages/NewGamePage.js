import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setNumPlayers } from '../store/gameSlice';
import { setPlayerType, AI_DIFFICULTY } from '../store/aiSlice';
import { setPlayerName } from '../store/playerSlice';
import { PLAYERS } from '../constants/gameConstants';
import './NewGamePage.css';

/**
 * New Game setup page component
 */
const NewGamePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { numPlayers } = useSelector(state => state.game);
  const { aiPlayers, aiDelay } = useSelector(state => state.ai);
  const { playerNames } = useSelector(state => state.player);
  
  const [localNumPlayers, setLocalNumPlayers] = useState(numPlayers);
  const [localAiPlayers, setLocalAiPlayers] = useState({...aiPlayers});
  const [localAiDelay, setLocalAiDelay] = useState(aiDelay);
  const [localPlayerNames, setLocalPlayerNames] = useState({...playerNames});
  
  // handleNumPlayersChange was removed as it's now handled directly in the onClick handlers
  
  const handlePlayerTypeChange = (playerId, value) => {
    setLocalAiPlayers({
      ...localAiPlayers,
      [playerId]: value === 'human' ? null : value
    });
  };

  const handlePlayerNameChange = (playerId, name) => {
    setLocalPlayerNames({
      ...localPlayerNames,
      [playerId]: name
    });
  };
  
  const handleAiDelayChange = (e) => {
    setLocalAiDelay(Number(e.target.value));
  };
  
  const handleStartGame = () => {
    // Save settings to Redux store
    dispatch(setNumPlayers(localNumPlayers));
    
    // Update AI player settings
    Object.keys(localAiPlayers).forEach(playerId => {
      dispatch(setPlayerType({
        playerId: Number(playerId),
        type: localAiPlayers[playerId]
      }));
    });

    // Update player names
    Object.keys(localPlayerNames).forEach(playerId => {
      dispatch(setPlayerName({
        playerId: Number(playerId),
        name: localPlayerNames[playerId]
      }));
    });
    
    // Navigate to game page
    // Using state object with replace:true prevents adding to history stack
    // This helps avoid potential navigation loops
    navigate('/game', { 
      state: { forceNew: true },
      replace: true 
    });
  };
  
  return (
    <div className="new-game-page">
      <div className="new-game-container">
        <h1>New Game Setup</h1>
        
        <div className="setup-section">
          <h2>Number of Players</h2>
          <div className="player-count-selector">
            <button 
              className={localNumPlayers === 2 ? 'active' : ''} 
              onClick={() => setLocalNumPlayers(2)}
            >
              2 Players
            </button>
            <button 
              className={localNumPlayers === 3 ? 'active' : ''} 
              onClick={() => setLocalNumPlayers(3)}
            >
              3 Players
            </button>
            <button 
              className={localNumPlayers === 4 ? 'active' : ''} 
              onClick={() => setLocalNumPlayers(4)}
            >
              4 Players
            </button>
          </div>
        </div>
        
        <div className="setup-section">
          <h2>Player Settings</h2>
          <div className="player-settings">
            {PLAYERS.slice(0, localNumPlayers).map(player => (
              <div key={player.id} className="player-setting">
                <div className="player-label" style={{ color: player.color }}>
                  {player.name} Player
                </div>
                <select 
                  value={localAiPlayers[player.id] === null ? 'human' : localAiPlayers[player.id]} 
                  onChange={(e) => handlePlayerTypeChange(player.id, e.target.value)}
                >
                  <option value="human">Human</option>
                  <option value={AI_DIFFICULTY.EASY}>AI - Random</option>
                  <option value={AI_DIFFICULTY.MEDIUM}>AI - Aggressive</option>
                  <option value={AI_DIFFICULTY.HARD}>AI - Defensive</option>
                </select>
                {localAiPlayers[player.id] === null && (
                  <input
                    type="text"
                    placeholder={`Player ${player.id + 1} Name`}
                    value={localPlayerNames[player.id]}
                    onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
                    className="player-name-input"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="setup-section">
          <h2>AI Settings</h2>
          <div className="ai-delay-setting">
            <label htmlFor="ai-delay">AI Move Delay (ms):</label>
            <input 
              id="ai-delay"
              type="range" 
              min="200" 
              max="2000" 
              step="100" 
              value={localAiDelay} 
              onChange={handleAiDelayChange} 
            />
            <span>{localAiDelay}ms</span>
          </div>
        </div>
        
        <div className="setup-actions">
          <button className="back-button" onClick={() => navigate('/')}>
            Back
          </button>
          <button className="start-button" onClick={handleStartGame}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGamePage;
