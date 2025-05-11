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
    // If no highlight position but has specific actions, handle them
    if (step.action === 'END_TURN') {
      // Highlight the end turn button
      highlightElement('.end-turn-button', tutorialHighlights.END_TURN, dispatchFn);
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
        // If it's a base being highlighted
        if (isBaseAtPosition(x, y, board)) {
          highlightBoardCell(x, y, tutorialHighlights.BASE, dispatchFn);
        } else {
          highlightBoardCell(x, y, null, dispatchFn);
        }
        break;
      default:
        // For other step types, just highlight the position
        highlightBoardCell(x, y, null, dispatchFn);
    }
  }, 100);
};
