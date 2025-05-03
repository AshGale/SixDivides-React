import { 
  processMove,
  processBaseAction,
  checkWinCondition,
} from '../logic/gameplayUtils';
import { getValidMovesForPiece } from '../logic';
import { UNIT_TYPES } from '../constants/gameConstants';

// Console log to verify module is freshly loaded
console.log(`aiUtils.js loaded at ${new Date().toISOString()} - using latest version`);

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
  // Define test sequence moves with enhanced edge case testing
  const testMoves = [
    // -------------------- BASIC MOVEMENT TESTS --------------------
    
    // Test basic movement - Player 0 (moving to an empty space)
    { 
      playerId: 0, 
      fromRow: 1, 
      fromCol: 0, 
      toRow: 1, 
      toCol: 1, 
      type: 'move',
      description: "Move Player 0's value 1 piece (basic movement)",
      sourceValue: 1,
      targetValue: null
    },
    
    // Test movement to edge of board - Player 1
    { 
      playerId: 1, 
      fromRow: 1, 
      fromCol: 7, 
      toRow: 0, 
      toCol: 7, 
      type: 'move',
      description: "Move to board edge (test board boundary handling)",
      sourceValue: 1,
      targetValue: null
    },
    
    // -------------------- UNIT COMBINING TESTS --------------------
    
    // Test combining friendly units of equal value - Player 0
    { 
      playerId: 0, 
      fromRow: 2, 
      fromCol: 1, 
      toRow: 2, 
      toCol: 2, 
      type: 'combine',
      description: "Combine two value 1 pieces to create a value 2 piece",
      sourceValue: 1,
      targetValue: 1
    },
    
    // Test combining to exactly value 6 - Player 1
    { 
      playerId: 1, 
      fromRow: 1, 
      fromCol: 5, 
      toRow: 1, 
      toCol: 6, 
      type: 'combine',
      description: "Combine value 1 and value 5 pieces (should create exactly value 6)",
      sourceValue: 1,
      targetValue: 5
    },
    
    // Test combining that exceeds value 6 - Player 3
    { 
      playerId: 3, 
      fromRow: 6, 
      fromCol: 1, 
      toRow: 6, 
      toCol: 2, 
      type: 'combine',
      description: "Combine value 5 and value 2 pieces (should create value 6 with remainder 1)",
      sourceValue: 5,
      targetValue: 2
    },
    
    // -------------------- BASE ACTION TESTS --------------------
    
    // Test base creating a unit in empty space - Player 0
    { 
      playerId: 0, 
      fromRow: 0, 
      fromCol: 0, 
      toRow: 0, 
      toCol: 3, 
      type: 'create',
      description: "Base creates a new unit in empty space",
      sourceValue: 6,
      targetValue: null
    },
    
    // Test base upgrading a friendly unit - Player 1
    { 
      playerId: 1, 
      fromRow: 0, 
      fromCol: 7, 
      toRow: 0, 
      toCol: 6, 
      type: 'upgrade',
      description: "Base upgrades a friendly unit from 1 to 2",
      sourceValue: 6,
      targetValue: 1
    },
    
    // Test base upgrading a unit to max value (5->6) - Player 2
    { 
      playerId: 2, 
      fromRow: 7, 
      fromCol: 7, 
      toRow: 6, 
      toCol: 6, 
      type: 'upgrade',
      description: "Base upgrades a friendly unit from 5 to 6 (max value)",
      sourceValue: 6,
      targetValue: 5
    },
    
    // Test base attacking enemy unit - Player 3
    { 
      playerId: 3, 
      fromRow: 7, 
      fromCol: 0, 
      toRow: 6, 
      toCol: 5, 
      type: 'attack',
      description: "Base attacks enemy unit, reducing its value by 1",
      sourceValue: 6,
      targetValue: 2
    },
    
    // Additional test: base attacking enemy unit at edge - Player 0
    { 
      playerId: 0, 
      fromRow: 0, 
      fromCol: 0, 
      toRow: 1, 
      toCol: 6, 
      type: 'attack',
      description: "Base attacks enemy unit at distance, reducing its value by 1",
      sourceValue: 6,
      targetValue: 5
    },
    
    // -------------------- COMBAT TESTS --------------------
    
    // Test combat with stronger attacker - Player 0
    { 
      playerId: 0, 
      fromRow: 2, 
      fromCol: 0, 
      toRow: 3, 
      toCol: 5, 
      type: 'move',
      description: "Player 0's value 4 attacks Player 1's value 3 (should result in value 1)",
      sourceValue: 4,
      targetValue: 3
    },
    
    // Test equal value combat - Player 1 (EXPLICIT TEST TO ENSURE DETECTION)
    { 
      playerId: 1, 
      fromRow: 2, 
      fromCol: 7, 
      toRow: 3, 
      toCol: 2, 
      type: 'move',
      description: "EQUAL VALUE COMBAT: Player 1's value 4 attacks Player 0's value 4 (both should be destroyed)",
      sourceValue: 4,
      targetValue: 4
    },
    
    // Test combat with weaker attacker - Player 2
    { 
      playerId: 2, 
      fromRow: 5, 
      fromCol: 7, 
      toRow: 4, 
      toCol: 2, 
      type: 'move',
      description: "Player 2's value 4 attacks Player 3's value 5 (attacker destroyed, defender reduced to 1)",
      sourceValue: 4,
      targetValue: 5
    },
    
    // Test attacker defeated but leaving defender with minimum value - Player 0
    { 
      playerId: 0, 
      fromRow: 1, 
      fromCol: 2, 
      toRow: 4, 
      toCol: 3, 
      type: 'move',
      description: "Player 0's value 2 attacks Player 3's value 2 (both destroyed, edge case with equal values)",
      sourceValue: 2,
      targetValue: 2
    },
    
    // Test attacking a base - Player 0
    { 
      playerId: 0, 
      fromRow: 0, 
      fromCol: 2, 
      toRow: 0, 
      toCol: 7, 
      type: 'move',
      description: "Value 3 attacking enemy base (attacker is destroyed, base is damaged to value 3)",
      sourceValue: 3,
      targetValue: 6
    },
    
    // Test attacking a base with equal value - Player 2
    { 
      playerId: 2, 
      fromRow: 5, 
      fromCol: 5, 
      toRow: 7, 
      toCol: 0, 
      type: 'move',
      description: "Value 3 attacking enemy base value 3 (attacker destroyed, base reduced to value 1)",
      sourceValue: 3,
      targetValue: 3
    },
    
    // -------------------- ELIMINATION TESTS --------------------
    
    // Series of moves to eliminate a player (Player 2) - multiple sequential moves
    { 
      playerId: 3, 
      fromRow: 5, 
      fromCol: 0, 
      toRow: 6, 
      toCol: 7, 
      type: 'move',
      description: "Player 3 attacks Player 2's last piece to test player elimination",
      sourceValue: 4,
      targetValue: 1
    },
    
    // -------------------- EDGE CASE TESTS --------------------
    
    // Test creating a unit next to a board edge
    { 
      playerId: 1, 
      fromRow: 0, 
      fromCol: 7, 
      toRow: 0, 
      toCol: 5, 
      type: 'create',
      description: "Base creates unit along board edge (boundary case)",
      sourceValue: 6,
      targetValue: null
    },
    
    // Test attacking a value 1 unit (should be removed)
    { 
      playerId: 0, 
      fromRow: 2, 
      fromCol: 2, 
      toRow: 2, 
      toCol: 5, 
      type: 'move',
      description: "Attack enemy value 1 unit with value 2 (check complete removal)",
      sourceValue: 2,
      targetValue: 1
    },
    
    // Additional test: Test combining two high value units
    { 
      playerId: 1, 
      fromRow: 0, 
      fromCol: 5, 
      toRow: 1, 
      toCol: 5, 
      type: 'combine',
      description: "Combine two value 3 units to create value 6 (exact combination)",
      sourceValue: 3,
      targetValue: 3
    },
    
    // Additional test: try to create unit in occupied space (should fail but test validation)
    { 
      playerId: 1, 
      fromRow: 0, 
      fromCol: 7, 
      toRow: 0, 
      toCol: 6, 
      type: 'create',
      description: "BASE ACTION VALIDATION: Base tries to create unit in occupied space (should upgrade instead)",
      sourceValue: 6,
      targetValue: 2
    }
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
        console.log(`Skipping move ${i}: Source piece not available at [${move.fromRow},${move.fromCol}]`);
        continue; // Skip this move if the source piece doesn't exist or belongs to a different player
      }
      
      // Store actual source piece value for result validation
      move.actualSourceValue = sourcePiece.value;
      
      // Determine the move type based on the target cell
      const targetCell = board[move.toRow][move.toCol];
      let moveType = 'move'; // Default move type
      
      // Store actual target piece value for result validation (if exists)
      if (targetCell) {
        move.actualTargetValue = targetCell.value;
        move.actualTargetPlayerId = targetCell.playerId;
      }
      
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
      
      console.log(`Executing move ${i}: ${move.description} (${moveType})`);
      
      return {
        fromRow: move.fromRow,
        fromCol: move.fromCol,
        toRow: move.toRow,
        toCol: move.toCol,
        type: moveType,
        piece: sourcePiece,
        isBase: sourcePiece.value === 6,
        testMoveIndex: i, // Include the move index for tracking progress
        description: move.description, // Include description for logging
        sourceValue: move.sourceValue,
        targetValue: move.targetValue,
        actualSourceValue: move.actualSourceValue,
        actualTargetValue: move.actualTargetValue,
        actualTargetPlayerId: move.actualTargetPlayerId
      };
    }
  }
  
  // If no moves are found for the current player, return null
  return null;
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
  // Store board snapshots before and after moves for validation
  let boardSnapshots = [];
  
  console.log("Starting automated game mechanics test...");
  
  // Helper to create a deep copy of the board for snapshots
  const copyBoard = (board) => {
    return JSON.parse(JSON.stringify(board));
  };
  
  // Function to validate board state changes
  const validateMove = (move, beforeBoard, afterBoard) => {
    const { fromRow, fromCol, toRow, toCol, type, 
            sourceValue, targetValue, description } = move;
            
    // Debug: log the current board state for better troubleshooting
    console.log(`Before move board state at [${fromRow},${fromCol}]:`, beforeBoard[fromRow][fromCol]);
    console.log(`Before move board state at [${toRow},${toCol}]:`, beforeBoard[toRow][toCol]);
    console.log(`After move board state at [${fromRow},${fromCol}]:`, afterBoard[fromRow][fromCol]);
    console.log(`After move board state at [${toRow},${toCol}]:`, afterBoard[toRow][toCol]);
    
    // Capture actual results for validation
    const actualResult = {
      sourceRemoved: afterBoard[fromRow][fromCol] === null,
      targetValue: afterBoard[toRow][toCol] ? afterBoard[toRow][toCol].value : null,
      targetPlayerId: afterBoard[toRow][toCol] ? afterBoard[toRow][toCol].playerId : null
    };
    
    // Add validation data to the move
    move.validation = { 
      valid: true,
      errors: [],
      beforeState: copyBoard(beforeBoard),
      afterState: copyBoard(afterBoard),
      actualResult
    };
    
    console.log(`Validating ${type} move: ${description}`);
    
    // Skip validation for certain known edge cases
    const skipValidation = 
      // Skip validation if both source and target are null after move (indicates a failed move)
      (afterBoard[fromRow][fromCol] === null && afterBoard[toRow][toCol] === null) ||
      // Skip validation if board states are identical (no change occurred)
      (JSON.stringify(beforeBoard) === JSON.stringify(afterBoard));
      
    if (skipValidation) {
      console.warn(`⚠️ Skipping validation for move ${description} - no board changes detected`);
      move.validation.valid = false;
      move.validation.errors.push("Move did not result in any board changes");
      return move;
    }

    // Validate based on move type
    switch(type) {
      case 'move':
        // In a move, source should be removed and target should have source's value
        if (!actualResult.sourceRemoved) {
          move.validation.valid = false;
          move.validation.errors.push("Source piece not removed after move");
        }
        if (actualResult.targetValue !== sourceValue) {
          move.validation.valid = false;
          move.validation.errors.push(`Target value incorrect: expected ${sourceValue}, got ${actualResult.targetValue}`);
        }
        break;
        
      case 'combine':
        // In a combine, we expect source + target values (up to max 6)
        const expectedValue = Math.min(6, (sourceValue || 0) + (targetValue || 0));
        const expectedRemainder = (sourceValue || 0) + (targetValue || 0) > 6 ? 
                                 (sourceValue || 0) + (targetValue || 0) - 6 : null;
                                 
        // Debug the combination math
        console.log(`COMBINE DEBUG: sourceValue=${sourceValue}, targetValue=${targetValue}`);
        console.log(`COMBINE DEBUG: expectedValue=${expectedValue}, expectedRemainder=${expectedRemainder}`);
        
        if (expectedRemainder && afterBoard[fromRow][fromCol] === null) {
          move.validation.valid = false;
          move.validation.errors.push(`Source should have remainder ${expectedRemainder} but was removed`);
        } else if (expectedRemainder && 
                 afterBoard[fromRow][fromCol] && 
                 afterBoard[fromRow][fromCol].value !== expectedRemainder) {
          move.validation.valid = false;
          move.validation.errors.push(`Source remainder incorrect: expected ${expectedRemainder}, got ${afterBoard[fromRow][fromCol].value}`);
        } else if (!expectedRemainder && !actualResult.sourceRemoved) {
          move.validation.valid = false;
          move.validation.errors.push(`Source piece should be removed when combine value <= 6`);
        }
        
        // Handle the case where combine is actually a move (result is a changed board state)
        if (actualResult.targetValue === null) {
          // This might be a failed execution, check if board changed at all
          const boardChanged = JSON.stringify(beforeBoard) !== JSON.stringify(afterBoard);
          if (!boardChanged) {
            move.validation.valid = false;
            move.validation.errors.push("Combine action failed to execute");
          }
        } else if (actualResult.targetValue !== expectedValue) {
          move.validation.valid = false;
          move.validation.errors.push(`Target value incorrect: expected ${expectedValue}, got ${actualResult.targetValue}`);
        }
        break;
        
      case 'combat':
        // Combat logic depends on values
        if (sourceValue > targetValue) {
          // Attacker wins, source removed, target becomes attacker with reduced value
          const expectedValue = sourceValue - targetValue;
          if (!actualResult.sourceRemoved) {
            move.validation.valid = false;
            move.validation.errors.push("Attacker should be removed from original position");
          }
          if (actualResult.targetValue !== expectedValue && expectedValue > 0) {
            move.validation.valid = false;
            move.validation.errors.push(`Target value incorrect: expected ${expectedValue}, got ${actualResult.targetValue}`);
          }
        } else if (sourceValue === targetValue) {
          // Equal values, both destroyed
          if (!actualResult.sourceRemoved) {
            move.validation.valid = false;
            move.validation.errors.push("Source should be removed in equal value combat");
          }
          if (afterBoard[toRow][toCol] !== null) {
            move.validation.valid = false;
            move.validation.errors.push("Target should be removed in equal value combat");
          }
        } else {
          // Attacker loses, removed, defender reduced
          const expectedValue = targetValue - sourceValue;
          if (!actualResult.sourceRemoved) {
            move.validation.valid = false;
            move.validation.errors.push("Attacker should be removed when losing combat");
          }
          if (actualResult.targetValue !== expectedValue && expectedValue > 0) {
            move.validation.valid = false;
            move.validation.errors.push(`Defender value incorrect: expected ${expectedValue}, got ${actualResult.targetValue}`);
          }
        }
        break;
        
      case 'create':
        // Base creating a unit - check if we got any unit at all
        if (actualResult.targetValue === null) {
          move.validation.valid = false;
          move.validation.errors.push(`Base failed to create a unit`);
        } else if (actualResult.targetValue !== 1) {
          // If a unit was created but not value 1, report the issue
          move.validation.valid = false;
          move.validation.errors.push(`Created unit should have value 1, got ${actualResult.targetValue}`);
        }
        break;
        
      case 'upgrade':
        // Base upgrading - should increase by 1
        const expectedUpgradeValue = Math.min(6, (targetValue || 0) + 1);
        if (actualResult.targetValue !== expectedUpgradeValue) {
          move.validation.valid = false;
          move.validation.errors.push(`Upgraded value incorrect: expected ${expectedUpgradeValue}, got ${actualResult.targetValue}`);
        }
        break;
        
      case 'attack':
        // Base attacking - should reduce by 1 or remove if at 1
        if ((targetValue || 0) > 1) {
          const expectedAttackValue = (targetValue || 0) - 1;
          if (actualResult.targetValue !== expectedAttackValue) {
            move.validation.valid = false;
            move.validation.errors.push(`After attack value incorrect: expected ${expectedAttackValue}, got ${actualResult.targetValue}`);
          }
        } else {
          // Value 1 units should be removed when attacked
          if (afterBoard[toRow][toCol] !== null) {
            move.validation.valid = false;
            move.validation.errors.push(`Value 1 unit should be removed when attacked`);
          }
        }
        break;
    }
    
    // Log validation results
    if (!move.validation.valid) {
      console.error(`❌ VALIDATION FAILED for ${type} move: ${description}`);
      move.validation.errors.forEach(error => console.error(`  - ${error}`));
    } else {
      console.log(`✅ Validated ${type} move: ${description}`);
    }
    
    return move;
  };

  const executeNextMove = () => {
    const state = store.getState().game;
    const { board, currentPlayer } = state;
    
    // Get the next test move for the current player
    const move = getAutomatedTestMoves(board, currentPlayer, moveCount);
    
    if (move) {
      console.log(`Executing test move ${moveCount + 1}: ${move.description} (type: ${move.type})`);
      
      // Print the current board state for debugging
      console.log(`Current board state at move ${moveCount + 1}:`, 
                 JSON.stringify(board[move.fromRow][move.fromCol]),
                 JSON.stringify(board[move.toRow][move.toCol]));
      
      // Save board state before the move for validation
      const beforeState = copyBoard(board);
      
      try {
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
            
            // Wait a bit for the state to update, then validate
            setTimeout(() => {
              try {
                const afterState = copyBoard(store.getState().game.board);
                console.log("Board state after move:");
                console.log(`From [${move.fromRow},${move.fromCol}]:`, 
                          afterState[move.fromRow][move.fromCol]);
                console.log(`To [${move.toRow},${move.toCol}]:`, 
                          afterState[move.toRow][move.toCol]);
                          
                const validatedMove = validateMove(move, beforeState, afterState);
                
                // Add to move history
                moveHistory.push(validatedMove);
                moveCount++;
                
                // Schedule next move
                setTimeout(executeNextMove, moveDelay);
              } catch (err) {
                console.error("Error validating move:", err);
                moveCount++;
                setTimeout(executeNextMove, moveDelay);
              }
            }, 100);
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
            
            // Wait a bit for the state to update, then validate
            setTimeout(() => {
              try {
                const afterState = copyBoard(store.getState().game.board);
                const validatedMove = validateMove(move, beforeState, afterState);
                
                // Add to move history
                moveHistory.push(validatedMove);
                moveCount++;
                
                // Schedule next move
                setTimeout(executeNextMove, moveDelay);
              } catch (err) {
                console.error("Error validating combine:", err);
                moveCount++;
                setTimeout(executeNextMove, moveDelay);
              }
            }, 100);
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
            
            // Wait a bit for the state to update, then validate
            setTimeout(() => {
              try {
                const afterState = copyBoard(store.getState().game.board);
                const validatedMove = validateMove(move, beforeState, afterState);
                
                // Add to move history
                moveHistory.push(validatedMove);
                moveCount++;
                
                // Schedule next move
                setTimeout(executeNextMove, moveDelay);
              } catch (err) {
                console.error("Error validating base action:", err);
                moveCount++;
                setTimeout(executeNextMove, moveDelay);
              }
            }, 100);
          }, 300);
        }
      } catch (err) {
        console.error("Error executing move:", err);
        moveCount++;
        setTimeout(executeNextMove, moveDelay);
      }
    }
    else {
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
    boardSnapshots = [];
    executeNextMove();
  };
};

/**
 * Helper function to get test results from test moves
 * @param {Array} board - Current game board
 * @param {Array} moveHistory - History of moves executed
 * @returns {Object} Test results with pass/fail status for each game mechanic
 */
export const analyzeTestResults = (board, moveHistory) => {
  // Initialize results object with more detailed categories
  const results = {
    // Basic game mechanics
    basicMovement: { tested: false, passed: false, details: [], validationErrors: [] },
    unitCombining: { tested: false, passed: false, details: [], validationErrors: [] },
    combatMechanics: { tested: false, passed: false, details: [], validationErrors: [] },
    baseActions: { tested: false, passed: false, details: [], validationErrors: [] },
    winCondition: { tested: false, passed: false, details: [], validationErrors: [] },
    
    // Edge cases and paranoid testing
    combiningOverflow: { tested: false, passed: false, details: [], validationErrors: [] },
    baseCombat: { tested: false, passed: false, details: [], validationErrors: [] },
    emptyTargets: { tested: false, passed: false, details: [], validationErrors: [] },
    valueZeroEdge: { tested: false, passed: false, details: [], validationErrors: [] },
    edgeBoardPositions: { tested: false, passed: false, details: [], validationErrors: [] },
    playerElimination: { tested: false, passed: false, details: [], validationErrors: [] }
  };
  
  // Track specific test conditions
  const trackedConditions = {
    hasCombinedUnitsToExactValue6: false,
    hasCombinedUnitsExceedingValue6: false,
    hasAttackedBase: false,
    hasBaseCreatedUnit: false,
    hasBaseUpgradedUnit: false,
    hasBaseAttackedUnit: false,
    hasAttackerDestroyedDefender: false,
    hasEqualValueCombat: false,
    hasDefenderSurvivedAttack: false,
    hasUnitMovedToEdge: false,
    hasUnitTriedToMoveOffBoard: false // This may require additional validation logic
  };
  
  // Track validation failures
  let validationFailures = 0;
  
  // Analyze board state for specific conditions
  const boardAnalysis = {
    unitsAtValue1: 0,
    unitsAtValue6: 0,
    playersWithUnits: new Set(),
    unitsAtEdges: 0
  };
  
  // Count units by value and position
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) {
        // Track player presence
        boardAnalysis.playersWithUnits.add(cell.playerId);
        
        // Count unit values
        if (cell.value === 1) boardAnalysis.unitsAtValue1++;
        if (cell.value === 6) boardAnalysis.unitsAtValue6++;
        
        // Check edge positions
        if (rowIndex === 0 || rowIndex === board.length - 1 || 
            colIndex === 0 || colIndex === row.length - 1) {
          boardAnalysis.unitsAtEdges++;
        }
      }
    });
  });
  
  // Analyze move history to determine what was tested
  moveHistory.forEach(move => {
    const { fromRow, fromCol, toRow, toCol, type, piece, description, validation } = move;
    console.log(`Analyzing move: ${description}, type: ${type}`);
    
    // Check if this move had validation errors
    const hasValidationErrors = validation && !validation.valid;
    if (hasValidationErrors) {
      validationFailures++;
    }
    
    // Check for basic movement
    if (type === 'move') {
      results.basicMovement.tested = true;
      results.basicMovement.passed = !hasValidationErrors;
      results.basicMovement.details.push(`Tested: ${description}`);
      
      if (hasValidationErrors) {
        validation.errors.forEach(error => {
          results.basicMovement.validationErrors.push(`${description}: ${error}`);
        });
      }
      
      // Check if move was to edge of board
      if (toRow === 0 || toRow === board.length - 1 || 
          toCol === 0 || toCol === board[0].length - 1) {
        trackedConditions.hasUnitMovedToEdge = true;
        results.edgeBoardPositions.tested = true;
        results.edgeBoardPositions.passed = !hasValidationErrors;
        results.edgeBoardPositions.details.push(`Unit moved to board edge`);
        
        if (hasValidationErrors) {
          validation.errors.forEach(error => {
            results.edgeBoardPositions.validationErrors.push(`${description}: ${error}`);
          });
        }
      }
    }
    
    // Check for unit combining
    if (type === 'combine') {
      results.unitCombining.tested = true;
      results.unitCombining.passed = !hasValidationErrors;
      results.unitCombining.details.push(`Tested: ${description}`);
      
      if (hasValidationErrors) {
        validation.errors.forEach(error => {
          results.unitCombining.validationErrors.push(`${description}: ${error}`);
        });
      }
      
      // Check if combined to exactly value 6
      if (description.includes("(should create exactly value 6)") || 
          (validation && validation.actualResult && validation.actualResult.targetValue === 6 && 
           !description.includes("remainder"))) {
        trackedConditions.hasCombinedUnitsToExactValue6 = true;
        console.log("Detected combining to exactly value 6");
      }
      
      // Check for combining that exceeds value 6
      if (description.includes("with remainder")) {
        trackedConditions.hasCombinedUnitsExceedingValue6 = true;
        results.combiningOverflow.tested = true;
        results.combiningOverflow.passed = !hasValidationErrors;
        results.combiningOverflow.details.push(`Tested combining beyond value 6`);
        
        if (hasValidationErrors) {
          validation.errors.forEach(error => {
            results.combiningOverflow.validationErrors.push(`${description}: ${error}`);
          });
        }
      }
    }
    
    // Check for overflow combining (value > 6)
    if (move.sourceValue && move.targetValue && 
        move.sourceValue + move.targetValue > 6) {
      trackedConditions.hasCombinedUnitsExceedingValue6 = true;
      results.combiningOverflow.tested = true;
      results.combiningOverflow.passed = !hasValidationErrors;
      results.combiningOverflow.details.push(`Tested combining beyond value 6`);
      
      if (hasValidationErrors) {
        validation.errors.forEach(error => {
          results.combiningOverflow.validationErrors.push(`${description}: ${error}`);
        });
      }
    }
    
    // Check for combat mechanics
    if (type === 'combat') {
      results.combatMechanics.tested = true;
      results.combatMechanics.passed = !hasValidationErrors;
      results.combatMechanics.details.push(`Tested: ${description}`);
      
      if (hasValidationErrors) {
        validation.errors.forEach(error => {
          results.combatMechanics.validationErrors.push(`${description}: ${error}`);
        });
      }
      
      // Track specific combat scenarios based on description or metadata
      if (description.includes('both should be destroyed') || 
          description.includes('equal values') ||
          description.includes('EQUAL VALUE COMBAT')) {
        trackedConditions.hasEqualValueCombat = true;
        console.log("Detected equal value combat");
      } else if (description.includes('attacker destroyed')) {
        trackedConditions.hasDefenderSurvivedAttack = true;
      } else if (description.includes('should result in value')) {
        trackedConditions.hasAttackerDestroyedDefender = true;
      }
      
      // Base combat detection
      if (description.includes('base')) {
        trackedConditions.hasAttackedBase = true;
        results.baseCombat.tested = true;
        results.baseCombat.passed = !hasValidationErrors;
        results.baseCombat.details.push(`Tested attacking a base: ${description}`);
        
        if (hasValidationErrors) {
          validation.errors.forEach(error => {
            results.baseCombat.validationErrors.push(`${description}: ${error}`);
          });
        }
      }
    }
    
    // Check for base actions
    if (type === 'create' && piece && piece.value === 6) {
      results.baseActions.tested = true;
      results.baseActions.passed = !hasValidationErrors;
      results.baseActions.details.push(`Tested base action: create`);
      trackedConditions.hasBaseCreatedUnit = true;
      console.log("Detected base creating a unit");
      
      if (hasValidationErrors) {
        validation.errors.forEach(error => {
          results.baseActions.validationErrors.push(`${description} (create): ${error}`);
        });
      }
    }
    
    if (type === 'upgrade' && piece && piece.value === 6) {
      results.baseActions.tested = true;
      results.baseActions.passed = !hasValidationErrors;
      results.baseActions.details.push(`Tested base action: upgrade`);
      trackedConditions.hasBaseUpgradedUnit = true;
      console.log("Detected base upgrading a unit");
      
      if (hasValidationErrors) {
        validation.errors.forEach(error => {
          results.baseActions.validationErrors.push(`${description} (upgrade): ${error}`);
        });
      }
    }
    
    if (type === 'attack' && piece && piece.value === 6) {
      results.baseActions.tested = true;
      results.baseActions.passed = !hasValidationErrors;
      results.baseActions.details.push(`Tested base action: attack`);
      trackedConditions.hasBaseAttackedUnit = true;
      console.log("Detected base attacking an enemy unit");
      
      if (hasValidationErrors) {
        validation.errors.forEach(error => {
          results.baseActions.validationErrors.push(`${description} (attack): ${error}`);
        });
      }
    }
    
    // Check for empty target cell handling
    if ((type === 'move' && description.includes('empty')) || 
        type === 'create') {
      results.emptyTargets.tested = true;
      results.emptyTargets.passed = !hasValidationErrors;
      results.emptyTargets.details.push(`Tested interaction with empty cell`);
      
      if (hasValidationErrors) {
        validation.errors.forEach(error => {
          results.emptyTargets.validationErrors.push(`${description}: ${error}`);
        });
      }
    }
  });
  
  // Check player elimination condition
  results.playerElimination.tested = boardAnalysis.playersWithUnits.size < 4;
  results.playerElimination.passed = results.playerElimination.tested;
  if (results.playerElimination.tested) {
    results.playerElimination.details.push(`Player elimination tested: ${4 - boardAnalysis.playersWithUnits.size} players eliminated`);
  }
  
  // Check win condition
  results.winCondition.tested = boardAnalysis.playersWithUnits.size <= 1;
  results.winCondition.passed = results.winCondition.tested;
  if (results.winCondition.tested) {
    results.winCondition.details.push(`Win condition tested with ${boardAnalysis.playersWithUnits.size} players remaining`);
  }
  
  // Add validation warnings for untested conditions
  const warnings = [];
  if (!trackedConditions.hasCombinedUnitsToExactValue6) {
    warnings.push("WARNING: Combining units to exactly value 6 was not tested");
  }
  if (!trackedConditions.hasCombinedUnitsExceedingValue6) {
    warnings.push("WARNING: Combining units exceeding value 6 was not tested");
  }
  if (!trackedConditions.hasAttackedBase) {
    warnings.push("WARNING: Attacking a base was not tested");
  }
  if (!trackedConditions.hasBaseCreatedUnit) {
    warnings.push("WARNING: Base creating a unit was not tested");
  }
  if (!trackedConditions.hasBaseUpgradedUnit) {
    warnings.push("WARNING: Base upgrading a unit was not tested");
  }
  if (!trackedConditions.hasBaseAttackedUnit) {
    warnings.push("WARNING: Base attacking an enemy unit was not tested");
  }
  if (!trackedConditions.hasEqualValueCombat) {
    warnings.push("WARNING: Equal value combat (both units destroyed) was not tested");
  }
  if (!trackedConditions.hasUnitMovedToEdge) {
    warnings.push("WARNING: Unit movement to board edge was not tested");
  }
  
  console.log("Tracked conditions:", trackedConditions);
  console.log("Total validation failures:", validationFailures);
  
  return { 
    results, 
    warnings, 
    boardAnalysis, 
    trackedConditions,
    validationFailures,
    hasLogicErrors: validationFailures > 0
  };
};

// Enhanced test report generation
export const generateTestReport = (testData) => {
  const { results, warnings, boardAnalysis, trackedConditions, validationFailures, hasLogicErrors } = testData;
  
  console.log('\n===== DICE CHESS GAME MECHANICS TEST REPORT =====');
  console.log('TIMESTAMP:', new Date().toISOString());
  
  // Overall validation summary
  console.log('\n----- VALIDATION SUMMARY -----');
  if (hasLogicErrors) {
    console.log(`❌ TEST FAILED: Found ${validationFailures} game logic errors! The implementation does not match the rules.`);
  } else {
    console.log('✅ VALIDATION PASSED: No game logic errors detected. Implementation matches rules.');
  }
  
  // Report on core mechanics
  console.log('\n----- CORE GAME MECHANICS -----');
  Object.entries(results).forEach(([mechanic, result]) => {
    if (!mechanic.includes('Edge') && !mechanic.startsWith('value') && 
        !mechanic.startsWith('empty') && !mechanic.startsWith('player')) {
      const status = !result.tested ? '⚪ NOT TESTED' : 
                      result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${mechanic}: ${status}`);
      
      // Show details when available
      if (result.details && result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`  - ${detail}`);
        });
      }
      
      // Show validation errors if any
      if (result.validationErrors && result.validationErrors.length > 0) {
        console.log(`  ❌ VALIDATION ERRORS:`);
        result.validationErrors.forEach(error => {
          console.log(`    - ${error}`);
        });
      }
    }
  });
  
  // Report on edge cases
  console.log('\n----- EDGE CASES & PARANOID TESTING -----');
  Object.entries(results).forEach(([mechanic, result]) => {
    if (mechanic.includes('Edge') || mechanic.startsWith('value') || 
        mechanic.startsWith('empty') || mechanic.startsWith('player') ||
        mechanic.includes('Overflow') || mechanic.includes('base')) {
      const status = !result.tested ? '⚪ NOT TESTED' : 
                      result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${mechanic}: ${status}`);
      
      // Show details when available
      if (result.details && result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`  - ${detail}`);
        });
      }
      
      // Show validation errors if any
      if (result.validationErrors && result.validationErrors.length > 0) {
        console.log(`  ❌ VALIDATION ERRORS:`);
        result.validationErrors.forEach(error => {
          console.log(`    - ${error}`);
        });
      }
    }
  });
  
  // Report on board state
  console.log('\n----- FINAL BOARD STATE -----');
  console.log(`Players remaining: ${boardAnalysis.playersWithUnits.size}`);
  console.log(`Value 1 units: ${boardAnalysis.unitsAtValue1}`);
  console.log(`Value 6 units/bases: ${boardAnalysis.unitsAtValue6}`);
  console.log(`Units at board edges: ${boardAnalysis.unitsAtEdges}`);
  
  // Display warnings
  if (warnings.length > 0) {
    console.log('\n----- WARNINGS & UNTESTED CONDITIONS -----');
    warnings.forEach(warning => {
      console.log(`⚠️ ${warning}`);
    });
  }
  
  // Summary
  console.log('\n----- SUMMARY -----');
  const allCategoriesTested = Object.values(results).every(r => r.tested);
  const allCategoriesPassed = Object.values(results).every(r => r.passed);
  const testedCount = Object.values(results).filter(r => r.tested).length;
  const totalCategories = Object.values(results).length;
  const coveragePercentage = Math.round((testedCount / totalCategories) * 100);
  
  console.log(`Test Coverage: ${coveragePercentage}% (${testedCount}/${totalCategories} categories tested)`);
  
  if (hasLogicErrors) {
    console.log('❌ IMPLEMENTATION ERROR: The game logic does not match the expected rules!');
    console.log('   Please check gameplayUtils.js for issues.');
  } else if (allCategoriesTested && allCategoriesPassed) {
    console.log('🎉 All game mechanics tests passed!');
  } else if (!allCategoriesTested) {
    console.log('⚠️ Some game mechanics were not tested.');
  } else {
    console.log('❌ Some game mechanics tests failed.');
  }
  
  console.log('================================================\n');
};
