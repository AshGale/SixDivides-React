import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPlayerType, setAiDelay, AI_DIFFICULTY } from '../../store/aiSlice';
import { PLAYERS } from '../../constants/gameConstants';
import './AiSettings.css';

/**
 * Component for configuring AI settings
 */
const AiSettings = () => {
  const dispatch = useDispatch();
  const { aiPlayers, aiDelay } = useSelector(state => state.ai);
  const { numPlayers } = useSelector(state => state.game);
  
  const handlePlayerTypeChange = (playerId, value) => {
    dispatch(setPlayerType({ playerId, type: value === 'human' ? null : value }));
  };
  
  const handleAiDelayChange = (e) => {
    dispatch(setAiDelay(Number(e.target.value)));
  };
  
  return (
    <div className="ai-settings">
      <h2>AI Settings</h2>
      
      <div className="player-settings">
        {PLAYERS.slice(0, numPlayers).map(player => (
          <div key={player.id} className="player-setting">
            <div className="player-label" style={{ color: player.color }}>
              {player.name} Player
            </div>
            <select 
              value={aiPlayers[player.id] === null ? 'human' : aiPlayers[player.id]} 
              onChange={(e) => handlePlayerTypeChange(player.id, e.target.value)}
            >
              <option value="human">Human</option>
              <option value={AI_DIFFICULTY.EASY}>AI - Random</option>
              <option value={AI_DIFFICULTY.MEDIUM}>AI - Aggressive</option>
              <option value={AI_DIFFICULTY.HARD}>AI - Defensive</option>
            </select>
          </div>
        ))}
      </div>
      
      <div className="ai-delay-setting">
        <label htmlFor="ai-delay">AI Move Delay (ms):</label>
        <input 
          id="ai-delay"
          type="range" 
          min="200" 
          max="2000" 
          step="100" 
          value={aiDelay} 
          onChange={handleAiDelayChange} 
        />
        <span>{aiDelay}ms</span>
      </div>
    </div>
  );
};

export default AiSettings;
