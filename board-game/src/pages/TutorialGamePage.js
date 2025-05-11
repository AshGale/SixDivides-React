import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GameBoard from '../components/board/GameBoard';
import GameInfo from '../components/ui/GameInfo';
import GameControls from '../components/ui/GameControls';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';
import TutorialManager from '../components/tutorial/TutorialManager';
import TutorialCompletionModal from '../components/tutorial/TutorialCompletionModal';
import { startTutorial, nextTutorialStep, prevTutorialStep, completeTutorial } from '../store/gameSlice';
import './TutorialGamePage.css';

/**
 * Tutorial Game Page component
 * Provides a dedicated tutorial experience with guided instruction
 */
const TutorialGamePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { 
    tutorialStep, 
    tutorialSteps, 
    isTutorialMode, 
    tutorialCompleted 
  } = useSelector(state => state.game);
  
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Start the tutorial on component mount
  useEffect(() => {
    if (!isTutorialMode) {
      dispatch(startTutorial());
    }
  }, [dispatch, isTutorialMode]);

  // Handle tutorial navigation
  const handleNextStep = () => {
    dispatch(nextTutorialStep());
  };

  const handlePrevStep = () => {
    dispatch(prevTutorialStep());
  };

  const handleCompleteTutorial = () => {
    // Show completion modal instead of immediately navigating away
    setShowCompletionModal(true);
  };
  
  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    dispatch(completeTutorial());
  };

  const handleExitTutorial = () => {
    if (window.confirm('Are you sure you want to exit the tutorial?')) {
      dispatch(completeTutorial());
      navigate('/');
    }
  };

  // If tutorial is completed, redirect to home
  useEffect(() => {
    if (tutorialCompleted) {
      navigate('/');
    }
  }, [tutorialCompleted, navigate]);

  return (
    <div className="tutorial-game-page">
      <div className="tutorial-game-container">
        <h1 className="tutorial-game-title">Tutorial</h1>
        
        <div className="tutorial-game-content">
          <div className="tutorial-progress">
            <div className="tutorial-step-indicator">
              Step {tutorialStep + 1} of {tutorialSteps.length}
            </div>
            <div className="tutorial-progress-bar">
              <div 
                className="tutorial-progress-fill"
                style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <GameInfo />
          
          <GameBoard />
          
          <div className="tutorial-game-actions">
            <GameControls />
            <button className="exit-tutorial-button" onClick={handleExitTutorial}>
              Exit Tutorial
            </button>
          </div>
        </div>
        
        {/* Tutorial overlay with instructions */}
        <TutorialOverlay 
          currentStep={tutorialSteps[tutorialStep]}
          onNextStep={handleNextStep}
          onPreviousStep={tutorialStep > 0 ? handlePrevStep : null}
          onComplete={handleCompleteTutorial}
        />
        
        {/* Tutorial manager for interactive elements */}
        <TutorialManager />
        
        {/* Tutorial completion modal */}
        <TutorialCompletionModal 
          show={showCompletionModal}
          onClose={handleCloseCompletionModal}
        />
      </div>
    </div>
  );
};

export default TutorialGamePage;
