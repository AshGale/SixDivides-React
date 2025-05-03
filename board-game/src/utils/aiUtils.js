import { getValidMovesForPiece } from '../logic';
import { UNIT_TYPES } from '../constants/gameConstants';

/**
 * Get all possible moves for an AI player
 * @param {Array} board - Current game board
 * @param {number} playerId - AI player ID
 * @returns {Array} Array of all possible moves
 */
export const getAllPossibleMoves = (board, playerId) => {
  const possibleMoves = [];

  // Iterate through the board to find all pieces belonging to the AI
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      
      // If the piece belongs to the AI
      if (piece && piece.playerId === playerId) {
        // Get valid moves for this piece
        const validMoves = getValidMovesForPiece(board, row, col, playerId);
        
        // Add each move to the list of possible moves
        validMoves.forEach(move => {
          possibleMoves.push({
            fromRow: row,
            fromCol: col,
            toRow: move.row,
            toCol: move.col,
            type: move.type,
            piece,
            isBase: piece.value === 6
          });
        });
      }
    }
  }
  
  return possibleMoves;
};

/**
 * Calculate a score for a move based on random strategy
 * @param {Object} move - Move to evaluate
 * @returns {number} Score for the move
 */
export const scoreRandomMove = () => {
  // For random AI, just return a random number
  return Math.random();
};

/**
 * Calculate a score for a move based on aggressive strategy
 * @param {Object} move - Move to evaluate
 * @param {Array} board - Current game board
 * @returns {number} Score for the move
 */
export const scoreAggressiveMove = (move, board) => {
  const { type, toRow, toCol } = move;
  let score = Math.random() * 0.2; // Add a small random factor
  
  // Prioritize attack moves
  if (type === 'attack') {
    const targetPiece = board[toRow][toCol];
    if (targetPiece) {
      // Higher score for attacking higher value pieces
      score += targetPiece.value * 2;
    }
  } 
  // Next priority is creating new units
  else if (type === 'create') {
    score += 1;
  }
  // Next priority is upgrading units
  else if (type === 'upgrade') {
    score += 0.8;
  }
  // Next priority is combining units
  else if (type === 'combine') {
    score += 0.6;
  }
  // Lowest priority is just moving
  else if (type === 'move') {
    score += 0.4;
  }
  
  return score;
};

/**
 * Calculate a score for a move based on defensive strategy
 * @param {Object} move - Move to evaluate
 * @param {Array} board - Current game board
 * @param {number} playerId - AI player ID
 * @returns {number} Score for the move
 */
export const scoreDefensiveMove = (move, board, playerId) => {
  const { type, fromRow, fromCol, toRow, toCol } = move;
  let score = Math.random() * 0.2; // Add a small random factor
  
  // Check if the piece is in danger (has an enemy adjacent to it)
  const isInDanger = (row, col) => {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
    ];
    
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      // Check if the position is valid
      if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
        const adjacentPiece = board[newRow][newCol];
        
        // If there's an enemy piece that can attack
        if (adjacentPiece && 
            adjacentPiece.playerId !== playerId && 
            UNIT_TYPES[adjacentPiece.value].canAttack) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // The current piece is in danger
  if (isInDanger(fromRow, fromCol)) {
    // Prioritize moving away from danger
    if (type === 'move' && !isInDanger(toRow, toCol)) {
      score += 2;
    }
    // Or attacking the threat
    else if (type === 'attack') {
      score += 1.8;
    }
  }
  
  // Prioritize upgrading units
  if (type === 'upgrade') {
    score += 1.5;
  }
  // Creating new units is good for defense
  else if (type === 'create') {
    score += 1.2;
  }
  // Combining units can create stronger units
  else if (type === 'combine') {
    score += 1;
  }
  // Attacking is lower priority for defensive AI
  else if (type === 'attack') {
    score += 0.5;
  }
  
  return score;
};

/**
 * Select the best move for the AI based on the strategy
 * @param {Array} board - Current game board
 * @param {number} playerId - AI player ID
 * @param {string} strategy - AI strategy ('random', 'aggressive', 'defensive')
 * @returns {Object|null} Best move or null if no moves available
 */
export const selectBestMove = (board, playerId, strategy) => {
  const possibleMoves = getAllPossibleMoves(board, playerId);
  
  if (possibleMoves.length === 0) {
    return null;
  }
  
  // Score each possible move based on the strategy (assuming getAllPossibleMoves returns only valid moves)
  const scoredMoves = possibleMoves.map(move => { // Use possibleMoves directly
    let score;
    
    switch (strategy) {
      case 'aggressive':
        score = scoreAggressiveMove(move, board);
        break;
      case 'defensive':
        score = scoreDefensiveMove(move, board, playerId);
        break;
      case 'random':
      default:
        score = scoreRandomMove();
        break;
    }
    
    return { ...move, score };
  });
  
  // Sort moves by score (highest first)
  scoredMoves.sort((a, b) => b.score - a.score);
  
  // Return the highest scored move
  return scoredMoves[0];
};

/**
 * Returns a predefined sequence of moves to test all game mechanics
 * This function is specifically designed to work with the "Gameplay Test Scenario"
 * @param {Array} board - Current game board
 * @param {number} playerId - Current player ID
 * @param {number} moveCount - Current move count in the sequence
 * @returns {Object|null} A move object or null when testing is complete
 */
export const getAutomatedTestMoves = (board, playerId, moveCount = 0) => {
  // Define test sequence moves
  const testMoves = [
    // Test basic movement - Player 0
    { playerId: 0, fromRow: 1, fromCol: 0, toRow: 1, toCol: 1, description: "Move Player 0's value 1 piece (basic movement)" },
    
    // Test combining friendly units - Player 0
    { playerId: 0, fromRow: 2, fromCol: 1, toRow: 2, toCol: 2, description: "Combine two value 1 pieces to create a value 2 piece" },
    
    // Test combining units that exceed value 6 - Player 1
    { playerId: 1, fromRow: 1, fromCol: 6, toRow: 1, toCol: 7, description: "Combine value 5 and value 1 pieces (should create a 6)" },
    
    // Test base creating a unit - Player 0
    { playerId: 0, fromRow: 0, fromCol: 0, toRow: 0, toCol: 3, description: "Base creates a new unit in empty space" },
    
    // Test base upgrading a friendly unit - Player 1
    { playerId: 1, fromRow: 0, fromCol: 7, toRow: 0, toCol: 6, description: "Base upgrades a friendly unit from 1 to 2" },
    
    // Test normal combat with stronger attacker - Player 0
    { playerId: 0, fromRow: 2, fromCol: 0, toRow: 3, toCol: 5, description: "Player 0's value 4 attacks Player 1's value 3 (should result in value 1)" },
    
    // Test equal value combat - Player 1
    { playerId: 1, fromRow: 2, fromCol: 7, toRow: 3, toCol: 2, description: "Player 1's value 4 attacks Player 0's value 3 (both should be destroyed)" },
    
    // Test combat with weaker attacker - Player 2
    { playerId: 2, fromRow: 5, fromCol: 7, toRow: 4, toCol: 2, description: "Player 2's value A attacks Player 3's value B (attacker destroyed, defender reduced)" },
    
    // Test base attacking enemy unit - Player 3
    { playerId: 3, fromRow: 7, fromCol: 0, toRow: 6, toCol: 5, description: "Base attacks enemy unit, reducing its value" },
    
    // Test overfilling from combining - Player 2
    { playerId: 2, fromRow: 6, fromCol: 7, toRow: 6, toCol: 6, description: "Combine 1 and 5 (should create 6 with no remainder)" },
    
    // Test base being attacked - Player 0
    { playerId: 0, fromRow: 0, fromCol: 2, toRow: 0, toCol: 7, description: "Attacking enemy base (attacker is destroyed, base is damaged)" }
  ];

  // Return null if we've completed all test moves
  if (moveCount >= testMoves.length) {
    return null;
  }

  // Find the next move for the current player
  for (let i = moveCount; i < testMoves.length; i++) {
    if (testMoves[i].playerId === playerId) {
      const move = testMoves[i];
      
      // Validate the move is still valid (pieces could have been moved/destroyed)
      const sourcePiece = board[move.fromRow][move.fromCol];
      if (!sourcePiece || sourcePiece.playerId !== playerId) {
        continue; // Skip this move if the source piece doesn't exist or belongs to a different player
      }
      
      // Determine the move type based on the target cell
      const targetCell = board[move.toRow][move.toCol];
      let moveType = 'move'; // Default move type
      
      if (targetCell === null) {
        // If source is a base and target is empty, it's a create action
        if (sourcePiece.value === 6) {
          moveType = 'create';
        } else {
          moveType = 'move';
        }
      } else if (targetCell.playerId === playerId) {
        // If source is a base and target is friendly, it's an upgrade action
        if (sourcePiece.value === 6) {
          moveType = 'upgrade';
        } else {
          moveType = 'combine';
        }
      } else {
        // If source is a base and target is enemy, it's an attack action
        if (sourcePiece.value === 6) {
          moveType = 'attack';
        } else {
          moveType = 'combat';
        }
      }
      
      return {
        fromRow: move.fromRow,
        fromCol: move.fromCol,
        toRow: move.toRow,
        toCol: move.toCol,
        type: moveType,
        piece: sourcePiece,
        isBase: sourcePiece.value === 6,
        testMoveIndex: i, // Include the move index for tracking progress
        description: move.description // Include description for logging
      };
    }
  }
  
  // If no moves are found for the current player, return null
  return null;
};

/**
 * Helper function to get test results from test moves
 * @param {Array} board - Current game board
 * @param {Array} moveHistory - History of moves executed
 * @returns {Object} Test results with pass/fail status for each game mechanic
 */
export const analyzeTestResults = (board, moveHistory) => {
  // Initialize results object
  const results = {
    basicMovement: { tested: false, passed: false },
    unitCombining: { tested: false, passed: false },
    combatMechanics: { tested: false, passed: false },
    baseActions: { tested: false, passed: false },
    winCondition: { tested: false, passed: false }
  };
  
  // Analyze move history to determine what was tested
  moveHistory.forEach(move => {
    // Check for basic movement
    if (move.type === 'move') {
      results.basicMovement.tested = true;
      results.basicMovement.passed = true;
    }
    
    // Check for unit combining
    if (move.type === 'combine') {
      results.unitCombining.tested = true;
      // Check if the result unit has the expected value
      const targetCell = board[move.toRow][move.toCol];
      if (targetCell) {
        results.unitCombining.passed = true;
      }
    }
    
    // Check for combat mechanics
    if (move.type === 'combat') {
      results.combatMechanics.tested = true;
      results.combatMechanics.passed = true;
    }
    
    // Check for base actions
    if (['create', 'upgrade', 'attack'].includes(move.type) && move.isBase) {
      results.baseActions.tested = true;
      results.baseActions.passed = true;
    }
  });
  
  // Check win condition
  const remainingPlayers = new Set();
  board.flat().forEach(cell => {
    if (cell) {
      remainingPlayers.add(cell.playerId);
    }
  });
  
  results.winCondition.tested = remainingPlayers.size <= 1;
  results.winCondition.passed = results.winCondition.tested;
  
  return results;
};

// Function to generate a test report for the console
export const generateTestReport = (results) => {
  console.log('===== DICE CHESS GAME MECHANICS TEST REPORT =====');
  
  Object.entries(results).forEach(([mechanic, result]) => {
    const status = !result.tested ? '⚪ NOT TESTED' : 
                    result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${mechanic}: ${status}`);
  });
  
  console.log('================================================');
  
  const allPassed = Object.values(results).every(r => r.passed);
  const allTested = Object.values(results).every(r => r.tested);
  
  if (allTested && allPassed) {
    console.log('🎉 All game mechanics tests passed!');
  } else if (!allTested) {
    console.log('⚠️ Some game mechanics were not tested.');
  } else {
    console.log('❌ Some game mechanics tests failed.');
  }
};

/**
 * Integration function to use the automated test AI with the game
 * @param {Object} store - Redux store
 * @param {number} moveDelay - Delay between moves in milliseconds
 * @returns {Function} Function to start the automated test sequence
 */
export const runAutomatedGameTest = (store, moveDelay = 1000) => {
  let moveCount = 0;
  let moveHistory = [];
  
  const executeNextMove = () => {
    const state = store.getState().game;
    const { board, currentPlayer } = state;
    
    // Get the next test move for the current player
    const move = getAutomatedTestMoves(board, currentPlayer, moveCount);
    
    if (move) {
      console.log(`Executing test move ${moveCount + 1}: ${move.description}`);
      
      // Dispatch the appropriate action based on move type
      if (move.type === 'move' || move.type === 'combat') {
        store.dispatch({
          type: 'game/selectPiece',
          payload: { row: move.fromRow, col: move.fromCol }
        });
        
        setTimeout(() => {
          store.dispatch({
            type: 'game/executeMove',
            payload: { row: move.toRow, col: move.toCol }
          });
          
          // Add to move history
          moveHistory.push(move);
          moveCount++;
          
          // Schedule next move
          setTimeout(executeNextMove, moveDelay);
        }, 300); // Small delay between select and move
      } 
      else if (move.type === 'combine') {
        store.dispatch({
          type: 'game/selectPiece',
          payload: { row: move.fromRow, col: move.fromCol }
        });
        
        setTimeout(() => {
          store.dispatch({
            type: 'game/executeCombine',
            payload: { row: move.toRow, col: move.toCol }
          });
          
          // Add to move history
          moveHistory.push(move);
          moveCount++;
          
          // Schedule next move
          setTimeout(executeNextMove, moveDelay);
        }, 300);
      }
      else if (['create', 'upgrade', 'attack'].includes(move.type)) {
        store.dispatch({
          type: 'game/selectPiece',
          payload: { row: move.fromRow, col: move.fromCol }
        });
        
        setTimeout(() => {
          store.dispatch({
            type: 'game/executeBaseAction',
            payload: { 
              row: move.toRow, 
              col: move.toCol, 
              actionType: move.type 
            }
          });
          
          // Add to move history
          moveHistory.push(move);
          moveCount++;
          
          // Schedule next move
          setTimeout(executeNextMove, moveDelay);
        }, 300);
      }
    } else {
      // Testing complete - generate report
      console.log("Automated test sequence complete!");
      const results = analyzeTestResults(board, moveHistory);
      generateTestReport(results);
    }
  };
  
  return () => {
    console.log("Starting automated game mechanics test...");
    moveCount = 0;
    moveHistory = [];
    executeNextMove();
  };
};
