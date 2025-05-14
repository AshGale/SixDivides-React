import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import TutorialIntro from '../components/tutorial/TutorialIntro';
import { exitTutorial } from '../store/tutorialSlice';
import './TutorialGamePage.css';

/**
 * TutorialGamePage component - Simplified to avoid state loops
 */
const TutorialGamePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleBackToMenu = () => {
    dispatch(exitTutorial());
    navigate('/');
  };
  
  return (
    <div className="tutorial-page">
      <div className="tutorial-container">
        <h1>SixDivides Tutorial</h1>
        
        <TutorialIntro />
        
        <div className="tutorial-actions">
          <button className="menu-button" onClick={handleBackToMenu}>
            Exit Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialGamePage;
