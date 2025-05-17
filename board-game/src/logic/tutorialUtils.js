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
  
  // Place player 2 base to demonstrate enemy base restrictions
  board[0][7] = { playerId: 2, value: 6 };
  
  // Place some units for player 2
  board[1][6] = { playerId: 2, value: 1 };
  
  // Tutorial steps
  const steps = [
    {
      instruction: "Welcome to SixDivides! This is a strategic board game where you control dice-based units. The game is played on an 8x8 board, just like chess.",
      highlightedCells: [],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      preventAllMoves: true
    },
    {
      instruction: "The game is turn-based. Each turn, you can take actions like moving or attacking. The number of actions you can take is shown at the top of the screen.",
      highlightedCells: [],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      preventAllMoves: true
    },
    {
      instruction: "Let's start with the basics. You control the white pieces at the bottom of the board. Each piece has a value that determines its strength in combat.",
      highlightedCells: [{ row: 7, col: 0 }, { row: 6, col: 1 }],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      preventAllMoves: true
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
      instruction: "Great! The highlighted square shows where you can move. Click on the highlighted square above your pawn to move there.",
      highlightedCells: [{ row: 5, col: 1 }],
      restriction: {
        type: 'restrictedMoves',
        allowedMoves: [{ row: 5, col: 1, type: 'move' }]
      },
      waitForAction: true,
      nextTrigger: 'pieceMoved'
    },
    {
      instruction: "Now let's learn about movement restrictions. We'll add two base units near your pawn.",
      highlightedCells: [],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      boardModification: {
        add: [
          { row: 5, col: 0, playerId: 1, value: 6 },  // Add friendly base (adjacent to pawn)
          { row: 5, col: 2, playerId: 2, value: 6 }   // Add enemy base (adjacent to pawn)
        ]
      }
    },
    {
      instruction: "Notice the two base units (value 6) that appeared - one friendly and one enemy. Your pawn (value 1) can't move onto or combine with any bases.",
      highlightedCells: [{ row: 5, col: 0 }, { row: 5, col: 2 }],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      preventAllMoves: true
    },
    {
      instruction: "Select your pawn to see what moves are available. Notice how you can't move onto the friendly base or attack the enemy base with your pawn.",
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
      instruction: "Note: Units with values 1, 3, and 5 can never attack. Also, you can't attack enemy units with a higher value than your unit, and you can never move onto or combine with friendly bases. Let's move on to learn about combining units.",
      highlightedCells: [{ row: 5, col: 0 }, { row: 5, col: 2 }],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      preventAllMoves: true
    },
    {
      instruction: "Now let's learn about combining units! Let's add another pawn in front of your current pawn.",
      highlightedCells: [],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      preventAllMoves: true,
      boardModification: {
        add: [
          { row: 4, col: 1, playerId: 1, value: 1 }   // Add second pawn for combining (one row above current pawn)
        ]
      }
    },
    {
      instruction: "Look at the new pawn that appeared! You can combine two identical units to create a stronger unit.",
      highlightedCells: [{ row: 4, col: 1 }],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      preventAllMoves: true
    },
    {
      instruction: "Select your pawn (at position 5,1) to combine it with the other pawn.",
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
      instruction: "Great! Now move onto the other pawn (position 4,1) to combine them into a stronger unit (value 2).",
      highlightedCells: [{ row: 4, col: 1 }],
      restriction: {
        type: 'forcedSelection',
        row: 5,
        col: 1,
        allowedMoves: [{ row: 4, col: 1, type: 'combine' }]
      },
      waitForAction: true,
      nextTrigger: 'pieceMoved'
    },
    {
      instruction: "Perfect! You've created a value 2 unit by combining two value 1 units. You can continue combining units of the same value to create stronger units, up to value 5.",
      highlightedCells: [{ row: 4, col: 1 }],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      preventAllMoves: true
    },
    {
      instruction: "You've completed the basics tutorial! You've learned how to move units, understand movement restrictions, and combine units. Check out the 'How to Play' section for more details on game rules.",
      highlightedCells: [],
      restriction: {
        type: 'disableInteraction'
      },
      waitForAction: false,
      preventAllMoves: true
    }
  ];
  
  return createTutorialScenario('basic-moves', board, 1, steps);
};
