import { getValidMovesForPiece } from './moveValidation';

/**
 * Get tutorial-restricted valid moves for a piece
 * @param {Array} board - Game board
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} currentPlayer - Current player ID
 * @param {Object} tutorialRestriction - Tutorial restrictions
 * @returns {Array} Array of valid moves
 */
export const getTutorialValidMoves = (board, row, col, currentPlayer, tutorialRestriction = null) => {
  // First, get all technically valid moves
  const allValidMoves = getValidMovesForPiece(board, row, col, currentPlayer);
  
  // If no tutorial restrictions, return all valid moves
  if (!tutorialRestriction) {
    return allValidMoves;
  }

  // For restricted moves, only include the targets specified in the tutorial
  if (tutorialRestriction.type === 'restrictedMoves') {
    return allValidMoves.filter(move => {
      return tutorialRestriction.allowedMoves.some(
        allowed => allowed.row === move.row && allowed.col === move.col && allowed.type === move.type
      );
    });
  }

  // For forced selection, check if this is the piece that must be selected
  if (tutorialRestriction.type === 'forcedSelection') {
    if (row !== tutorialRestriction.row || col !== tutorialRestriction.col) {
      return []; // If not the forced piece, return no valid moves
    }
    // If it is the forced piece, return either all moves or restricted moves
    return tutorialRestriction.allowedMoves ? 
      allValidMoves.filter(move => {
        return tutorialRestriction.allowedMoves.some(
          allowed => allowed.row === move.row && allowed.col === move.col && allowed.type === move.type
        );
      }) : allValidMoves;
  }

  return allValidMoves;
};

/**
 * Check if a cell should be highlighted for the tutorial
 * @param {number} row - Row index
 * @param {number} col - Column index 
 * @param {Object} tutorialState - Current tutorial state
 * @returns {boolean} Whether the cell should be highlighted
 */
export const isTutorialHighlightedCell = (row, col, tutorialState) => {
  if (!tutorialState || !tutorialState.highlightedCells) {
    return false;
  }
  
  return tutorialState.highlightedCells.some(
    cell => cell.row === row && cell.col === col
  );
};

/**
 * Create a tutorial scenario with predefined board state and steps
 * @param {string} id - Unique ID for the scenario
 * @param {Array} board - Predefined board state
 * @param {Array} steps - Tutorial steps
 * @returns {Object} Tutorial scenario
 */
export const createTutorialScenario = (id, board, currentPlayer, steps) => {
  return {
    id,
    board,
    currentPlayer,
    steps,
    currentStep: 0
  };
};

/**
 * Get a sample tutorial scenario for learning basic moves
 * @returns {Object} Basic moves tutorial
 */
export const getBasicMovesTutorial = () => {
  // Create a clean 8x8 board
  const board = Array(8).fill().map(() => Array(8).fill(null));
  
  // Place player 1 base
  board[7][0] = { playerId: 1, value: 6 };
  
  // Place a pawn for player 1
  board[6][1] = { playerId: 1, value: 1 };
  
  // Place player 2 base
  board[0][7] = { playerId: 2, value: 6 };
  
  // Place some units for player 2
  board[1][6] = { playerId: 2, value: 1 };
  
  // Tutorial steps
  const steps = [
    {
      instruction: "Welcome to the tutorial! Let's learn how to play SixDivides.",
      highlightedCells: [],
      restriction: null,
      waitForAction: false
    },
    {
      instruction: "First, let's select one of your units. Click on the pawn (value 1) highlighted below.",
      highlightedCells: [{ row: 6, col: 1 }],
      restriction: {
        type: 'forcedSelection',
        row: 6,
        col: 1
      },
      waitForAction: true,
      nextTrigger: 'pieceSelected'
    },
    {
      instruction: "Great! Notice how the valid moves are highlighted. Let's move the pawn up one space.",
      highlightedCells: [{ row: 5, col: 1 }],
      restriction: {
        type: 'restrictedMoves',
        allowedMoves: [{ row: 5, col: 1, type: 'move' }]
      },
      waitForAction: true,
      nextTrigger: 'pieceMoved'
    },
    {
      instruction: "Perfect! You've learned how to move a piece. Let's try another action in the next lesson.",
      highlightedCells: [],
      restriction: null,
      waitForAction: false
    }
  ];
  
  return createTutorialScenario('basic-moves', board, 1, steps);
};
