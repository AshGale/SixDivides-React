import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PLAYERS } from '../../constants/gameConstants';
import { AI_DIFFICULTY } from '../../store/aiSlice';
import { setPlayerType } from '../../store/aiSlice';
import { setPlayerName } from '../../store/playerSlice';
import { loadGame } from '../../store/gameThunks';
import './Modal.css';

const CustomLoadModal = ({ onClose, saveToLoad, onCompleteLoad }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { aiPlayers } = useSelector(state => state.ai);
  const { playerNames } = useSelector(state => state.player);
  
  // Initialize with the current player settings or defaults from the save
  const [localAiPlayers, setLocalAiPlayers] = useState({...aiPlayers});
  const [localPlayerNames, setLocalPlayerNames] = useState({...playerNames});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get player count from the save
  const numPlayers = saveToLoad?.metadata?.numPlayers || 4;
  
  // Handle player type change (human/AI)
  const handlePlayerTypeChange = (playerId, value) => {
    setLocalAiPlayers({
      ...localAiPlayers,
      [playerId]: value === 'human' ? null : value
    });
  };

  // Handle player name change
  const handlePlayerNameChange = (playerId, name) => {
    setLocalPlayerNames({
      ...localPlayerNames,
      [playerId]: name
    });
  };

  // Handle loading the game with custom settings
  const handleLoadWithCustomSettings = async () => {
    if (!saveToLoad) {
      setError('No save selected');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, update all player types and names
      Object.keys(localAiPlayers).forEach(playerId => {
        const numPlayerId = Number(playerId);
        if (numPlayerId < numPlayers) {
          dispatch(setPlayerType({
            playerId: numPlayerId,
            type: localAiPlayers[playerId]
          }));
        }
      });

      // Update player names
      Object.keys(localPlayerNames).forEach(playerId => {
        const numPlayerId = Number(playerId);
        if (numPlayerId < numPlayers) {
          dispatch(setPlayerName({
            playerId: numPlayerId,
            name: localPlayerNames[playerId]
          }));
        }
      });

      // Then load the game
      await dispatch(loadGame({ 
        saveName: saveToLoad.saveName,
        customSettings: true
      })).unwrap();
      
      // If we have a direct complete handler, use it - this will close all modals
      // and navigate directly to the game page
      if (onCompleteLoad) {
        onCompleteLoad();
      } else {
        // Fallback to the original behavior
        onClose();
        
        // Navigate to game page
        setTimeout(() => {
          navigate('/game', { state: { fromLoad: true, loadedAt: new Date().getTime() } });
        }, 100);
      }
    } catch (err) {
      setError(`Failed to load game: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content custom-load-modal">
        <h2>Custom Load Settings</h2>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <p className="custom-load-info">
            Customize player settings for save: <strong>{saveToLoad?.saveName}</strong>
          </p>
          
          <div className="player-settings">
            {PLAYERS.slice(0, numPlayers).map(player => (
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
        
        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleLoadWithCustomSettings}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load With These Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomLoadModal;
