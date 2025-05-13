/**
 * Utility functions for managing tutorial step highlights
 */
import { tutorialHighlights } from '../../utils/tutorialScenarios';
import { isBaseAtPosition } from './tutorialValidationUtils';
import { highlightBoardCell, highlightElement } from './tutorialDomUtils';

/**
 * Determines which element to highlight based on the current tutorial step
 * @param {object} step - Current tutorial step
 * @param {array} board - Current game board state
 * @param {function} dispatchFn - Function to dispatch the highlight action
 * @returns {void}
 */
export const highlightTutorialElement = (step, board, dispatchFn) => {
  if (!step) return;
  
  // Wait a moment for the board to fully render
  setTimeout(() => {
    // Handle specific step IDs as special cases
    if (step.id === 3 || step.id === 4) {
      // Steps 3 and 4 are informational - don't highlight anything or show minimal highlight
      if (step.id === 4 && step.highlightPosition) {
        // For step 4, just highlight the cell without an instruction popup
        const x = step.highlightPosition.x;
        const y = step.highlightPosition.y;
        highlightBoardCell(x, y, null, dispatchFn);
      }
      return;
    }
    
    // If it's an end turn action, highlight the button
    if (step.action === 'END_TURN') {
      // Highlight the end turn button
      highlightElement('.end-turn-button', tutorialHighlights.END_TURN, dispatchFn);
      return;
    }
    
    // If no highlight position specified, don't try to highlight
    if (!step.highlightPosition) return;
    
    const x = step.highlightPosition.x;
    const y = step.highlightPosition.y;
    
    // Only highlight with interaction text if the user needs to interact with the cell
    // These actions require user interaction
    const interactiveActions = ['CLICK_UNIT', 'SHOW_MOVES', 'MOVE_TO', 'ATTACK', 'COMBINE'];
    const isInteractiveStep = interactiveActions.includes(step.action);
    
    // Handle different step actions
    switch (step.action) {
      case 'CLICK_UNIT':
        // Only show selection text for step 5 and above
        if (step.id >= 5) {
          highlightBoardCell(x, y, tutorialHighlights.UNIT_SELECT, dispatchFn);
        } else {
          highlightBoardCell(x, y, null, dispatchFn);
        }
        break;
      case 'SHOW_MOVES':
        highlightBoardCell(x, y, tutorialHighlights.UNIT_SELECT, dispatchFn);
        break;
      case 'MOVE_TO':
        highlightBoardCell(x, y, tutorialHighlights.MOVE_HERE, dispatchFn);
        break;
      case 'ATTACK':
        highlightBoardCell(x, y, tutorialHighlights.ATTACK_HERE, dispatchFn);
        break;
      case 'COMBINE':
        highlightBoardCell(x, y, tutorialHighlights.COMBINE, dispatchFn);
        break;
      case 'NEXT':
        // If it's a base being highlighted for information
        if (isBaseAtPosition(x, y, board)) {
          highlightBoardCell(x, y, tutorialHighlights.BASE, dispatchFn);
        } else {
          // For other informational highlights, use a subtler indication
          highlightBoardCell(x, y, null, dispatchFn);
        }
        break;
      default:
        // For other step types, just highlight the position without text
        highlightBoardCell(x, y, null, dispatchFn);
    }
  }, 100);
};
