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
  
  // Place player 1 base in its original position
  board[7][0] = { playerId: 1, value: 6 };
  
  // Place a pawn for player 1
  board[6][1] = { playerId: 1, value: 1 };
  
  // Place a second player 1 base to demonstrate friendly base restrictions
  board[5][0] = { playerId: 1, value: 6 };
  
  // Place player 2 base to demonstrate enemy base restrictions
  board[5][2] = { playerId: 2, value: 6 };
  
  // Place a second pawn for player 1 to demonstrate combining
  board[4][1] = { playerId: 1, value: 1 };
  
  // Place some units for player 2
  board[1][6] = { playerId: 2, value: 1 };
  
  // Tutorial steps
  const steps = [
    {
      instruction: "Welcome to SixDivides! This is a strategic board game where you control dice-based units. The game is played on an 8x8 board, just like chess.",
      highlightedCells: [],
      restriction: null,
      waitForAction: false
    },
    {
      instruction: "The game is turn-based. Each turn, you can take actions like moving or attacking. The number of actions you can take is shown at the top of the screen.",
      highlightedCells: [],
      restriction: null,
      waitForAction: false
    },
    {
      instruction: "Let's start with the basics. You control the white pieces at the bottom of the board. Each piece has a value that determines its strength in combat.",
      highlightedCells: [{ row: 7, col: 0 }, { row: 6, col: 1 }],
      restriction: null,
      waitForAction: false
    },
    {
      instruction: "Click on your pawn (value 1) to select it. This is how you'll interact with your units.",
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
      instruction: "Great! The highlighted squares show where you can move. Click on the highlighted square above your pawn to move there.",
      highlightedCells: [{ row: 5, col: 1 }],
      restriction: {
        type: 'restrictedMoves',
        allowedMoves: [{ row: 5, col: 1, type: 'move' }]
      },
      waitForAction: true,
      nextTrigger: 'pieceMoved'
    },
    {
      instruction: "Now, let's learn about movement restrictions. Notice the two base units (value 6) around your pawn - one friendly and one enemy. Your pawn (value 1) can't move onto or combine with any bases.",
      highlightedCells: [{ row: 5, col: 0 }, { row: 5, col: 2 }],
      restriction: null,
      waitForAction: false
    },
    {
      instruction: "Try selecting your pawn again and see what moves are available. You can't move onto the friendly base or attack the enemy base that has a higher value.",
      highlightedCells: [{ row: 5, col: 1 }],
      restriction: {
        type: 'forcedSelection',
        row: 5,
        col: 1
      },
      waitForAction: true,
      nextTrigger: 'pieceSelected'
    },
    {
      instruction: "Notice how you can't attack the enemy base (value 6) with a pawn (value 1), and you can't move onto or combine with friendly bases either. You can only attack enemy units with equal or lower value.",
      highlightedCells: [{ row: 5, col: 0 }, { row: 5, col: 2 }],
      restriction: null,
      waitForAction: false
    },
    {
      instruction: "Now let's learn about combining units! Did you notice there's another pawn (value 1) below? You can combine two identical units to create a stronger unit.",
      highlightedCells: [{ row: 4, col: 1 }],
      restriction: null,
      waitForAction: false
    },
    {
      instruction: "Select your pawn at position (5,1) to combine it with the other pawn.",
      highlightedCells: [{ row: 5, col: 1 }],
      restriction: {
        type: 'forcedSelection',
        row: 5,
        col: 1
      },
      waitForAction: true,
      nextTrigger: 'pieceSelected'
    },
    {
      instruction: "Great! Now move onto the other pawn to combine them into a stronger unit (value 2).",
      highlightedCells: [{ row: 4, col: 1 }],
      restriction: {
        type: 'restrictedMoves',
        allowedMoves: [{ row: 4, col: 1, type: 'combine' }]
      },
      waitForAction: true,
      nextTrigger: 'pieceMoved'
    },
    {
      instruction: "Perfect! You've created a value 2 unit by combining two value 1 units. You can continue combining units of the same value to create stronger units, up to value 5.",
      highlightedCells: [{ row: 4, col: 1 }],
      restriction: null,
      waitForAction: false
    },
    {
      instruction: "You've completed the basics tutorial! You've learned how to move units, understand movement restrictions, and combine units. Check out the 'How to Play' section for more details on game rules.",
      highlightedCells: [],
      restriction: null,
      waitForAction: false
    }
  ];
  
  return createTutorialScenario('basic-moves', board, 1, steps);
};
