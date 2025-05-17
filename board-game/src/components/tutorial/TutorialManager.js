import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { advanceTutorial } from '../../store/tutorialSlice';
import './TutorialManager.css';

/**
 * TutorialManager component handles the display of tutorial instructions and navigation
 */
const TutorialManager = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { 
    currentStep, 
    tutorialScenario, 
    tutorialCompleted 
  } = useSelector(state => state.tutorial);
  
  // Get the tutorial lesson ID from location state
  const tutorialLessonId = location.state?.lessonId;
  
  // Check if we're in a tutorial context
  if (!tutorialScenario) {
    return null;
  }

  // Safely access the current tutorial step
  const currentTutorialStep = tutorialScenario?.steps?.[currentStep];

  const handleNextStep = () => {
    dispatch(advanceTutorial());
  };

  return (
    <div className="tutorial-manager">
      {tutorialCompleted ? (
        <div className="tutorial-completion">
          <h2>Tutorial Completed!</h2>
          <p>Congratulations! You've completed this tutorial lesson.</p>
          <button 
            className="tutorial-button"
            onClick={() => window.location.href = '/'}
          >
            Back to Menu
          </button>
        </div>
      ) : (
        <div className="tutorial-instruction-container">
          <div className="tutorial-instruction">
            {currentTutorialStep?.instruction || 'Loading tutorial...'}
          </div>
          
          {/* Only show the Next button if we're not waiting for a specific action */}
          {currentTutorialStep && !currentTutorialStep.waitForAction && (
            <button 
              className="tutorial-next-button"
              onClick={handleNextStep}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TutorialManager;
