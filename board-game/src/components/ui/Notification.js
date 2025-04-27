import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearSaveLoadStatus } from '../../store/gameSlice';
import './Notification.css';

/**
 * Notification component for displaying feedback on save/load operations
 */
const Notification = () => {
  const saveStatus = useSelector(state => state.game.saveStatus);
  const loadStatus = useSelector(state => state.game.loadStatus);
  const dispatch = useDispatch();
  
  // Auto-hide notification after delay
  useEffect(() => {
    if (saveStatus || loadStatus) {
      const timer = setTimeout(() => {
        dispatch(clearSaveLoadStatus());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [saveStatus, loadStatus, dispatch]);
  
  // If no status, don't show notification
  if (!saveStatus && !loadStatus) return null;
  
  // Determine which status to use
  const status = saveStatus || loadStatus;
  const isSuccess = status.success;
  
  return (
    <div className={`notification ${isSuccess ? 'success' : 'error'}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {isSuccess ? '✓' : '✗'}
        </span>
        <span className="notification-message">{status.message}</span>
      </div>
      <button 
        className="notification-close"
        onClick={() => dispatch(clearSaveLoadStatus())}
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
