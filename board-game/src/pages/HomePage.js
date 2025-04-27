import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSavedGames } from '../store/gameThunks';
import LoadGameModal from '../components/modals/LoadGameModal';
import './HomePage.css';

/**
 * Home page component
 */
const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLoadModal, setShowLoadModal] = useState(false);
  const loadStatus = useSelector(state => state.game.loadStatus);

  // Handle successful game load
  useEffect(() => {
    if (loadStatus && loadStatus.success) {
      // Navigate to game page with a flag indicating a game was just loaded
      navigate('/game', { state: { fromLoad: true } });
    }
  }, [loadStatus, navigate]);

  const handleLoadGame = () => {
    // Fetch available saves before showing the modal
    dispatch(fetchSavedGames());
    setShowLoadModal(true);
  };

  const handleCloseLoadModal = () => {
    setShowLoadModal(false);
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="game-title">Dice Chess Game</h1>
        <p className="game-description">
          A strategic board game where dice represent units with different abilities.
          Capture enemy bases and conquer the board!
        </p>
        
        <div className="home-buttons vertical-buttons">
          <Link to="/new-game" className="home-button primary-button">
            New Game
          </Link>
          
          <button 
            onClick={handleLoadGame} 
            className="home-button load-button"
          >
            Load Game
          </button>
          
          <Link to="/map-editor" className="home-button editor-button">
            Custom Map Editor
          </Link>
          
          <Link to="/how-to-play" className="home-button secondary-button">
            How to Play
          </Link>
        </div>
      </div>
      
      {/* Load Game Modal */}
      {showLoadModal && <LoadGameModal onClose={handleCloseLoadModal} />}
    </div>
  );
};

export default HomePage;
