import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTutorialHighlight, nextTutorialStep } from '../../store/gameSlice';
import { highlightTutorialElement } from './tutorialHighlightUtils';
import { isTutorialStepCompleted } from './tutorialValidationUtils';
import { updateTutorialMoveContext } from '../../logic/moveValidation';

/**
 * Component that manages tutorial interactions and highlights
 * This component doesn't render anything visible but handles tutorial logic
 */
const TutorialManager = () => {
  const dispatch = useDispatch();
  const { 
    board, 
    isTutorialMode, 
    tutorialStep, 
    tutorialSteps, 
    selectedPiece,
    units,
    actions
  } = useSelector(state => state.game);
  
  // Reference to store DOM elements
  const highlightTimerRef = useRef(null);
  
  // Clear any highlight timers when component unmounts
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);
  
  // Listen for tutorial step changes and update highlights
  useEffect(() => {
    if (!isTutorialMode) return;
    
    const currentStep = tutorialSteps[tutorialStep];
    if (!currentStep) return;
    
    // Clear any existing highlight timer
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    
    // Wait a short delay before showing highlight to avoid UI flicker
    highlightTimerRef.current = setTimeout(() => {
      highlightTutorialElement(currentStep, board, setDispatchHighlight);
    }, 500);
    
    // Update the move validation context with current tutorial state
    // This ensures valid moves are shown correctly during tutorial steps
    updateTutorialMoveContext(currentStep, tutorialSteps, isTutorialMode);
    
    // Track if the user completed the current step action
    checkStepCompletion(currentStep);
    
  }, [tutorialStep, isTutorialMode, board, selectedPiece, tutorialSteps, units, actions, dispatch]);
  
  // Clear tutorial data when leaving tutorial mode
  useEffect(() => {
    if (!isTutorialMode) {
      // Clear tutorial data from move validation
      updateTutorialMoveContext(null, null, false);
    }
  }, [isTutorialMode]);
  
  // Helper function to pass the dispatch function to the highlight utilities
  const setDispatchHighlight = (highlightData) => {
    dispatch(setTutorialHighlight(highlightData));
  };
  
  // Check if the user has completed the current tutorial step
  const checkStepCompletion = (step) => {
    if (!step) return;
    
    // For steps that just need the Next button clicked
    if (step.action === 'NEXT' || step.action === 'END_TURN' || step.action === 'COMPLETE') {
      return; // User must click the next button manually
    }
    
    // Check if the step is completed using the validation utility
    const gameState = { board, selectedPiece };
    const isCompleted = isTutorialStepCompleted(step, gameState);
    
    if (isCompleted) {
      advanceToNextStep();
    }
  };
  
  // Helper function to advance to the next tutorial step
  const advanceToNextStep = () => {
    // Add a small delay before advancing to next step
    setTimeout(() => {
      dispatch(nextTutorialStep());
    }, 1000);
  };
  
  // This component doesn't render anything visible
  return null;
};

export default TutorialManager;