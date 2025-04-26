import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSavedGames, loadGame, deleteSavedGame } from '../../store/gameThunks';
import './Modal.css';

const LoadGameModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const availableSaves = useSelector(state => state.game.availableSaves);
  const loadStatus = useSelector(state => state.game.loadStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSave, setSelectedSave] = useState(null);

  // Fetch saved games on component mount
  useEffect(() => {
    const fetchSaves = async () => {
      setLoading(true);
      try {
        await dispatch(fetchSavedGames()).unwrap();
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch saved games: ${err.message}`);
        setLoading(false);
      }
    };

    fetchSaves();
  }, [dispatch]);

  const handleLoadGame = async () => {
    if (!selectedSave) {
      setError('Please select a save first');
      return;
    }

    setError('');
    try {
      // Load the game
      const result = await dispatch(loadGame({ saveName: selectedSave.saveName })).unwrap();
      
      // Close modal
      onClose();
      
      // Navigate to game page directly
      setTimeout(() => {
        navigate('/game', { state: { fromLoad: true, loadedAt: new Date().getTime() } });
      }, 100);
    } catch (err) {
      setError(`Failed to load game: ${err.message}`);
    }
  };

  const handleDeleteSave = async (e, saveName) => {
    e.stopPropagation(); // Prevent selecting the save when clicking delete
    
    if (window.confirm(`Are you sure you want to delete save "${saveName}"?`)) {
      try {
        await dispatch(deleteSavedGame({ saveName })).unwrap();
        // If the deleted save was selected, clear selection
        if (selectedSave && selectedSave.saveName === saveName) {
          setSelectedSave(null);
        }
      } catch (err) {
        setError(`Failed to delete save: ${err.message}`);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content load-modal">
        <h2>Load Game</h2>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading saved games...</div>
          ) : (
            <>
              {error && <div className="error-message">{error}</div>}
              
              {loadStatus && (
                <div className={`status-message ${loadStatus.success ? 'success' : 'error'}`}>
                  {loadStatus.message}
                </div>
              )}
              
              {availableSaves.length === 0 ? (
                <div className="no-saves">No saved games found</div>
              ) : (
                <div className="saves-list">
                  {availableSaves.map((save) => (
                    <div 
                      key={save.key} 
                      className={`save-item ${selectedSave && selectedSave.key === save.key ? 'selected' : ''}`}
                      onClick={() => setSelectedSave(save)}
                    >
                      <div className="save-details">
                        <div className="save-name">{save.saveName}</div>
                        <div className="save-timestamp">{formatDate(save.timestamp)}</div>
                      </div>
                      <button 
                        className="delete-save" 
                        onClick={(e) => handleDeleteSave(e, save.saveName)}
                        title="Delete Save"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
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
            onClick={handleLoadGame}
            disabled={!selectedSave}
          >
            Load Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadGameModal;
