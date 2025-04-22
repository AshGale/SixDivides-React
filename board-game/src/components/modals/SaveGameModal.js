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
