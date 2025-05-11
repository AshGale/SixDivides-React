import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import './TutorialOverlay.css';

/**
 * Component that overlays the game board during tutorial mode
 * Displays instructions and highlights relevant elements
 */
const TutorialOverlay = ({ currentStep, onNextStep, onPreviousStep, onComplete }) => {
  const { tutorialHighlight } = useSelector(state => state.game);

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
      
      {tutorialHighlight && tutorialHighlight.text && (
        <div 
          className="board-tooltip" 
          style={{
            position: 'fixed',
            top: `${tutorialHighlight.y - 40}px`,
            left: `${tutorialHighlight.x + (tutorialHighlight.width / 2)}px`,
            zIndex: 1050,
            pointerEvents: 'none',
            transform: 'translateX(-50%)',
            maxWidth: '200px',
            textAlign: 'center'
          }}
        >
          <div className="tooltip-text">{tutorialHighlight.text}</div>
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default TutorialOverlay;
