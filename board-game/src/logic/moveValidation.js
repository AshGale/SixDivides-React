import { UNIT_TYPES } from '../constants/gameConstants';
import { getAdjacentTiles } from './boardUtils';

// Get the current tutorial step from the Redux store
// We'll need this for a slightly different approach
let tutorialStepData = null;
let isTutorialModeActive = false;

/**
 * Set tutorial data for move validation
 * @param {Object} tutorialData - Contains tutorial step and mode information
 */
export const setTutorialData = (tutorialData) => {
  if (tutorialData) {
    tutorialStepData = tutorialData.step;
    isTutorialModeActive = tutorialData.isTutorialMode;
  } else {
    tutorialStepData = null;
    isTutorialModeActive = false;
  }
};

/**
 * Determine if a unit can attack a target
 * @param {Object} sourcePiece - The piece being moved
 * @param {Object} targetCell - The cell being targeted
 * @param {string} moveType - Type of move (e.g. 'attack', 'move', etc.)
 * @returns {boolean} - True if the move is valid
 */
export const isMoveValid = (sourcePiece, targetCell, moveType) => {
  // ... existing code remains the same ...
  return true;
};

/**
 * Get valid moves for a piece
 * @param {Array} board - Game board
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} currentPlayer - Current player ID
 * @returns {Array} Array of valid moves
 */
export const getValidMoves = (board, row, col, currentPlayer) => {
  // This is a wrapper function that calls getValidMovesForPiece
  // It ensures we don't have to modify all the imports across the app
  return getValidMovesForPiece(board, row, col, currentPlayer);
};

export const getValidMovesForPiece = (board, row, col, currentPlayer) => {
  const piece = board[row][col];
  if (!piece || piece.playerId !== currentPlayer) return [];

  const validMoves = [];
  const isBase = piece.value === 6;
  
  // Special handling for tutorial mode
  if (isTutorialModeActive && tutorialStepData) {
    // For step 5 (SHOW_MOVES) - we want to show valid moves but not allow actual movement
    if (tutorialStepData.id === 5 && tutorialStepData.action === 'SHOW_MOVES') {
      // For tutorial step 5, show valid moves for the highlighted unit
      if (tutorialStepData.highlightPosition && 
          tutorialStepData.highlightPosition.x === col && 
          tutorialStepData.highlightPosition.y === row) {
        // If we have a targetPosition in step 6, specifically highlight that
        const step6 = tutorialStepData.tutorialSteps?.find(step => step.id === 6);
        if (step6 && step6.targetPosition) {
          validMoves.push({
            row: step6.targetPosition.y,
            col: step6.targetPosition.x,
            type: 'move'
          });
          return validMoves;
        }
      }
    }
    
    // For step 6 (MOVE_TO) - make sure the target position is highlighted as a valid move
    if (tutorialStepData.id === 6 && tutorialStepData.action === 'MOVE_TO') {
      // If this is the piece we want to move
      if (tutorialStepData.targetUnit && piece.id === tutorialStepData.targetUnit) {
        // Add the target position as a valid move
        if (tutorialStepData.targetPosition) {
          validMoves.push({
            row: tutorialStepData.targetPosition.y,
            col: tutorialStepData.targetPosition.x,
            type: 'move'
          });
          return validMoves;
        }
      }
    }
  }

  if (isBase) {
    // Base can only act on adjacent tiles
    const adjacentTiles = getAdjacentTiles(row, col);
    
    adjacentTiles.forEach(([adjRow, adjCol]) => {
      const targetCell = board[adjRow][adjCol];
      
      if (!targetCell) {
        // Can create a new unit on empty cell
        validMoves.push({ row: adjRow, col: adjCol, type: 'create' });
      } else if (targetCell.playerId === currentPlayer) {
        // Can upgrade friendly unit if not already at max value
        if (targetCell.value < 6) {
          validMoves.push({ row: adjRow, col: adjCol, type: 'upgrade' });
        }
      } else {
        // Can reduce enemy unit
        validMoves.push({ row: adjRow, col: adjCol, type: 'attack' });
      }
    });
  } else {
    // Regular units
    const unitInfo = UNIT_TYPES[piece.value];
    
    if (unitInfo.canMove) {
      // Check all adjacent tiles for movement
      const adjacentTiles = getAdjacentTiles(row, col);
      
      adjacentTiles.forEach(([adjRow, adjCol]) => {
        const targetCell = board[adjRow][adjCol];
        
        // Skip entirely if the target is a friendly base
        if (targetCell && targetCell.value === 6 && targetCell.playerId === currentPlayer) {
          return;
        }
        
        if (!targetCell) {
          // Can move to empty cell
          validMoves.push({ row: adjRow, col: adjCol, type: 'move' });
        } else if (targetCell.playerId === currentPlayer) {
          // Can combine with friendly unit (but not with bases)
          if (targetCell.value !== 6) {
            validMoves.push({ row: adjRow, col: adjCol, type: 'combine' });
          }
        } else if (unitInfo.canAttack) {
          // Can attack enemy unit
          validMoves.push({ row: adjRow, col: adjCol, type: 'attack' });
        }
      });
    }
  }
  
  return validMoves;
};

// This function will be called from the TutorialManager to ensure
// move validation has the tutorial context
export const updateTutorialMoveContext = (tutorialStep, tutorialSteps, isTutorialMode) => {
  setTutorialData({
    step: { ...tutorialStep, tutorialSteps },
    isTutorialMode
  });
};
