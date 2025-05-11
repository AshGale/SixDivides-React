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
      highlightTutorialElement(currentStep);
    }, 500);
    
    // Track if the user completed the current step action
    checkStepCompletion(currentStep);
    
  }, [tutorialStep, isTutorialMode, board, selectedPiece, tutorialSteps, units, actions, dispatch]);
  
  // Function to find and highlight the relevant element for current tutorial step
  const highlightTutorialElement = (step) => {
    if (!step) return;
    
    // Wait a moment for the board to fully render
    setTimeout(() => {
      // If no highlight position but has specific actions, handle them
      if (step.action === 'END_TURN') {
        // Highlight the end turn button
        highlightElement('.end-turn-button', tutorialHighlights.END_TURN);
        return;
      }
      
      // If no highlight position specified, don't try to highlight
      if (!step.highlightPosition) return;
      
      const x = step.highlightPosition.x;
      const y = step.highlightPosition.y;
      
      // Handle different step actions
      switch (step.action) {
        case 'CLICK_UNIT':
        case 'SHOW_MOVES':
          highlightBoardCell(x, y, tutorialHighlights.UNIT_SELECT);
          break;
        case 'MOVE_TO':
          highlightBoardCell(x, y, tutorialHighlights.MOVE_HERE);
          break;
        case 'ATTACK':
          highlightBoardCell(x, y, tutorialHighlights.ATTACK_HERE);
          break;
        case 'COMBINE':
          highlightBoardCell(x, y, tutorialHighlights.COMBINE);
          break;
        case 'NEXT':
          // If it's a base being highlighted
          if (isBaseAtPosition(x, y)) {
            highlightBoardCell(x, y, tutorialHighlights.BASE);
          } else {
            highlightBoardCell(x, y);
          }
          break;
        default:
          // For other step types, just highlight the position
          highlightBoardCell(x, y);
      }
    }, 100);
  };
  
  // Helper function to check if there's a base at a position
  const isBaseAtPosition = (x, y) => {
    if (!board || !board[y] || !board[y][x]) return false;
    return board[y][x].isBase === true;
  };
  
  // Simplified function to find and highlight a board cell
  const highlightBoardCell = (x, y, text) => {
    // First, remove any existing highlights
    const existingHighlights = document.querySelectorAll('.tutorial-highlight-cell');
    existingHighlights.forEach(el => el.classList.remove('tutorial-highlight-cell'));
    
    // Primary approach: get cell by position using the board's structure
    const boardRows = document.querySelectorAll('.board-row');
    let element = null;
    
    // Get the cell using DOM traversal (most reliable method)
    if (boardRows && boardRows.length > y && y >= 0) {
      const targetRow = boardRows[y];
      const cells = targetRow?.querySelectorAll('.board-cell');
      if (cells && cells.length > x && x >= 0) {
        element = cells[x];
      }
    }
    
    // Fallback: try data attributes if DOM traversal fails
    if (!element) {
      element = document.querySelector(`.board-cell[data-x="${x}"][data-y="${y}"]`);
    }
    
    // If still not found, final fallback to scanning all cells
    if (!element) {
      const allCells = document.querySelectorAll('.board-cell');
      for (const cell of allCells) {
        const cellX = parseInt(cell.getAttribute('data-x'), 10);
        const cellY = parseInt(cell.getAttribute('data-y'), 10);
        if (cellX === x && cellY === y) {
          element = cell;
          break;
        }
      }
    }
    
    if (!element) {
      return; // Silently fail if we can't find the element
    }
    
    // Add a class to the element for styling purposes
    element.classList.add('tutorial-highlight-cell');
    
    // Only create tooltip if text is provided
    if (text) {
      // Create a unique ID for this element if it doesn't have one already
      const elementId = `tutorial-element-${x}-${y}`;
      element.setAttribute('data-tutorial-id', elementId);
      
      // Get the actual position of the element in the viewport
      const rect = element.getBoundingClientRect();
      
      // Send the actual element position and ID for accurate tooltip placement
      dispatch(setTutorialHighlight({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        text: text,
        elementId: elementId // This allows the TutorialOverlay to find this element
      }));
    } else {
      // Clear existing tooltip if no text is provided
      dispatch(setTutorialHighlight(null));
    }
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
      return; // User must click the next button manually
    }
    
    // Handle different step types
    switch (step.action) {
      case 'CLICK_UNIT':
        if (selectedPiece) {
          const { targetUnit } = step;
          const selectedUnit = board[selectedPiece.row][selectedPiece.col];
          if (selectedUnit && selectedUnit.id === targetUnit) {
            advanceToNextStep();
          }
        }
        break;
        
      case 'MOVE_TO':
      case 'ATTACK':
        // Check if the player made the expected move
        if (step.targetPosition && step.targetUnit) {
          checkUnitMovement(step.targetUnit, step.targetPosition);
        }
        break;
        
      case 'END_TURN':
        // End turn is handled by UI button click
        break;
        
      case 'COMPLETE':
        // Complete is handled by UI button click
        break;
    }
  };
  
  // Check if a unit was moved to the target position
  const checkUnitMovement = (unitId, targetPosition) => {
    // Find the unit in the current board state
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];
        if (cell && cell.id === unitId) {
          // If the unit is at the expected position, advance
          if (x === targetPosition.x && y === targetPosition.y) {
            advanceToNextStep();
          }
          return;
        }
      }
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