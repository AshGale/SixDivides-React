import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveGame } from '../../store/gameThunks';
import './Modal.css';

const SaveGameModal = ({ onClose }) => {
  const [saveName, setSaveName] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const saveStatus = useSelector(state => state.game.saveStatus);
  const inProgress = useSelector(state => state.game.gameState === 'IN_PROGRESS');
  const turnHistory = useSelector(state => state.game.turnHistory);
  const currentPlayer = useSelector(state => state.game.currentPlayer);
  const numPlayers = useSelector(state => state.game.numPlayers);

  // Generate metadata for display
  const moveCount = turnHistory ? turnHistory.length : 0;
  const playerInfo = Array(numPlayers).fill().map((_, index) => ({
    playerId: index,
    name: `Player ${index + 1}`,
    isAI: false, // Default value, would be replaced with actual data once implemented
    isCurrent: index === currentPlayer
  }));

  const handleSave = async () => {
    if (!saveName.trim()) {
      setError('Please enter a save name');
      return;
    }

    if (!inProgress) {
      setError('Cannot save when game is not in progress');
      return;
    }

    setError('');
    try {
      const result = await dispatch(saveGame({ saveName: saveName.trim() })).unwrap();
      if (result.success) {
        // Close modal on successful save
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      setError(`Failed to save game: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Save Game</h2>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="save-name">Save Name:</label>
            <input
              id="save-name"
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter a name for your save"
              className="form-control"
            />
          </div>
          
          <div className="save-game-info">
            <h3>Game Information</h3>
            <p><strong>Move Count:</strong> {moveCount}</p>
            <p><strong>Number of Players:</strong> {numPlayers}</p>
            <div className="player-info">
              <h4>Players:</h4>
              <ul>
                {playerInfo.map(player => (
                  <li key={player.playerId}>
                    {player.name} {player.isCurrent ? '(Current Turn)' : ''} 
                    {player.isAI ? ' (AI)' : ' (Human)'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {saveStatus && (
            <div className={`status-message ${saveStatus.success ? 'success' : 'error'}`}>
              {saveStatus.message}
            </div>
          )}
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
            onClick={handleSave}
            disabled={!saveName.trim() || !inProgress}
          >
            Save Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveGameModal;
