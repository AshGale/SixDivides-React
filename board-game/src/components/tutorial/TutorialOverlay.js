import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import './TutorialOverlay.css';

/**
 * Component that overlays the game board during tutorial mode
 * Displays instructions and highlights relevant elements
 */
const TutorialOverlay = ({ currentStep, onNextStep, onPreviousStep, onComplete }) => {
  const { tutorialStep, tutorialHighlight } = useSelector(state => state.game);
  const dispatch = useDispatch();

  // Get tutorial step details from current step
  const step = currentStep || { 
    title: "Tutorial", 
    instruction: "Follow the instructions to learn how to play"
  };

  const handleNextStep = () => {
    if (onNextStep) onNextStep();
  };

  const handlePreviousStep = () => {
    if (onPreviousStep) onPreviousStep();
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-panel">
        <h3 className="tutorial-title">{step.title}</h3>
        <p className="tutorial-instruction">{step.instruction}</p>
        
        <div className="tutorial-actions">
          <Button 
            variant="secondary" 
            onClick={handlePreviousStep} 
            disabled={!onPreviousStep}
            className="tutorial-btn"
          >
            Previous
          </Button>
          
          {step.action === 'COMPLETE' ? (
            <Button 
              variant="success" 
              onClick={handleComplete}
              className="tutorial-btn"
            >
              Complete Tutorial
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleNextStep}
              className="tutorial-btn"
            >
              {step.action === 'NEXT' ? 'Next' : 'Continue'}
            </Button>
          )}
        </div>
      </div>
      
      {tutorialHighlight && (
        <div 
          className="tutorial-highlight"
          style={{
            left: `${tutorialHighlight.x}px`,
            top: `${tutorialHighlight.y}px`,
            width: `${tutorialHighlight.width}px`,
            height: `${tutorialHighlight.height}px`
          }}
        >
          <div className="highlight-pointer"></div>
          <span className="highlight-text">{tutorialHighlight.text}</span>
        </div>
      )}
    </div>
  );
};

export default TutorialOverlay;
