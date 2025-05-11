import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTutorialHighlight, nextTutorialStep } from '../../store/gameSlice';
import { tutorialHighlights } from '../../utils/tutorialScenarios';

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
    selectedPiece 
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
      highlightTutorialElement(currentStep);
    }, 500);
    
    // Track if the user completed the current step action
    checkStepCompletion(currentStep);
    
  }, [tutorialStep, isTutorialMode, board, selectedPiece, tutorialSteps, dispatch]);
  
  // Function to find and highlight the relevant element for current tutorial step
  const highlightTutorialElement = (step) => {
    if (!step || !step.highlightPosition) return;
    
    // Wait a moment for the board to fully render
    setTimeout(() => {
      if (step.action === 'CLICK_UNIT' || step.action === 'SHOW_MOVES') {
        // Find and highlight a unit on the board
        const x = step.highlightPosition.x;
        const y = step.highlightPosition.y;
        highlightBoardCell(x, y, tutorialHighlights.UNIT_SELECT);
      } 
      else if (step.action === 'MOVE_TO' || step.action === 'ATTACK') {
        // Find and highlight a target position on the board
        const x = step.highlightPosition.x;
        const y = step.highlightPosition.y;
        const highlightText = step.action === 'ATTACK' ? tutorialHighlights.ATTACK_HERE : tutorialHighlights.MOVE_HERE;
        highlightBoardCell(x, y, highlightText);
      }
      else if (step.action === 'END_TURN') {
        // Highlight the end turn button
        highlightElement('.end-turn-button', tutorialHighlights.END_TURN);
      }
    }, 100);
  };
  
  // Improved function to find and highlight a specific board cell
  const highlightBoardCell = (x, y, text) => {
    // Use a more specific selector to find the exact cell
    // Note: We need to query the exact cell in the board grid
    const cellSelector = `.board-cell[data-x="${x}"][data-y="${y}"]`;
    const fallbackSelector = `.cell-${x}-${y}`;
    
    // Try to find the cell by data attributes first
    let element = document.querySelector(cellSelector);
    
    // If not found, try the fallback class-based selector
    if (!element) {
      element = document.querySelector(fallbackSelector);
    }
    
    // If still not found, try a more generic approach
    if (!element) {
      // Find all board cells and get the one at the right position
      const boardRows = document.querySelectorAll('.board-row');
      if (boardRows && boardRows[y]) {
        const cells = boardRows[y].querySelectorAll('.board-cell');
        if (cells && cells[x]) {
          element = cells[x];
        }
      }
    }
    
    if (!element) {
      console.error(`Could not find cell at position (${x}, ${y})`);
      return;
    }
    
    const rect = element.getBoundingClientRect();
    
    // Add a class to the element for styling purposes
    element.classList.add('tutorial-highlight-cell');
    
    // Calculate position relative to the viewport
    dispatch(setTutorialHighlight({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      text: text
    }));
  };
  
  // Helper function to highlight any DOM element
  const highlightElement = (selector, text) => {
    const element = document.querySelector(selector);
    if (!element) {
      console.error(`Could not find element with selector: ${selector}`);
      return;
    }
    
    const rect = element.getBoundingClientRect();
    dispatch(setTutorialHighlight({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      text: text
    }));
  };
  
  // Check if the user has completed the current tutorial step
  const checkStepCompletion = (step) => {
    if (!step) return;
    
    // For steps that just need the Next button clicked
    if (step.action === 'NEXT') {
      return;
    }
    
    // Unit selection steps
    if (step.action === 'CLICK_UNIT' && selectedPiece) {
      // If the user selected the highlighted unit, advance automatically
      const { targetUnit } = step;
      const selectedUnit = board[selectedPiece.row][selectedPiece.col];
      if (selectedUnit && selectedUnit.id === targetUnit) {
        // Add a small delay before advancing to next step
        setTimeout(() => {
          dispatch(nextTutorialStep());
        }, 1000);
      }
    }
    
    // Other step completion logic can be added here
    // e.g., for moves, attacks, etc.
  };
  
  // This component doesn't render anything visible
  return null;
};

export default TutorialManager;
