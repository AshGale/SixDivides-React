import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSavedGames, loadGame, deleteSavedGame } from '../../store/gameThunks';
import CustomLoadModal from './CustomLoadModal';
import './Modal.css';

const LoadGameModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const availableSaves = useSelector(state => state.game.availableSaves);
  const loadStatus = useSelector(state => state.game.loadStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSave, setSelectedSave] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

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

  const handleQuickLoad = async () => {
    if (!selectedSave) {
      setError('Please select a save first');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Quick load the game with default settings
      const result = await dispatch(loadGame({ 
        saveName: selectedSave.saveName,
        customSettings: false
      })).unwrap();
      
      // Close modal
      onClose();
      
      // Navigate to game page directly
      setTimeout(() => {
        navigate('/game', { state: { fromLoad: true, loadedAt: new Date().getTime() } });
      }, 100);
    } catch (err) {
      setError(`Failed to load game: ${err.message}`);
      setLoading(false);
    }
  };

  const handleCustomLoad = () => {
    if (!selectedSave) {
      setError('Please select a save first');
      return;
    }
    // Show the custom load modal
    setShowCustomModal(true);
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

  // If custom load modal is showing, render it instead
  if (showCustomModal) {
    return (
      <CustomLoadModal 
        onClose={() => setShowCustomModal(false)} 
        saveToLoad={selectedSave}
      />
    );
  }

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
                        <div className="save-info">
                          {save.metadata && (
                            <>
                              <span>Players: {save.metadata.numPlayers}</span>
                              <span>Turn: {save.metadata.currentPlayer + 1}</span>
                              <span>Moves: {save.metadata.moveCount}</span>
                            </>
                          )}
                        </div>
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
          <div className="load-options">
            <button 
              className="btn-secondary" 
              onClick={handleCustomLoad}
              disabled={!selectedSave || loading}
            >
              Custom Load
            </button>
            <button 
              className="btn-primary" 
              onClick={handleQuickLoad}
              disabled={!selectedSave || loading}
            >
              Quick Load
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadGameModal;
