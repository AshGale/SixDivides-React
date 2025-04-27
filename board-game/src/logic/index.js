/**
 * Central export file for game logic
 * This file makes importing game logic functions cleaner by providing a single import point
 */

// Board utilities
export { 
  initializeBoard, 
  // updateBoardState, // Removed - Doesn't exist in boardUtils
  getAdjacentTiles, 
  isCellValid, 
  cloneBoard, 
  createEmptyBoard 
} from './boardUtils';

// Move validation
export { 
  isMoveValid, 
  getValidMovesForPiece 
} from './moveValidation';

// Rendering utilities
export { 
  getPieceClass, 
  getCellClasses 
} from './renderUtils';

// Gameplay utilities
export { 
  getStartingActions, 
  checkWinCondition, 
  findNextPlayerWithUnits, 
  processMove, 
  processCombine, 
  processCombat, 
  processBaseAction 
} from './gameplayUtils';
