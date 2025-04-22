import { getValidMovesForPiece } from './gameUtils';
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
 * Verify if a move is valid (additional validation)
 * @param {Object} move - Move to validate
 * @param {Array} board - Current game board
 * @returns {boolean} Whether the move is valid
 */
export const isValidMove = (move, board) => {
  const { fromRow, fromCol, toRow, toCol, type, isBase } = move;
  
  // Ensure source piece exists
  const sourcePiece = board[fromRow][fromCol];
  if (!sourcePiece) return false;
  
  // Ensure target position is within bounds
  if (toRow < 0 || toRow >= board.length || toCol < 0 || toCol >= board[0].length) {
    return false;
  }
  
  const targetPiece = board[toRow][toCol];
  
  // Base-specific validation
  if (isBase) {
    // Base can't move
    if (type === 'move') return false;
    
    // For upgrades, target must be friendly and not already max value
    if (type === 'upgrade') {
      return targetPiece && 
             targetPiece.playerId === sourcePiece.playerId && 
             targetPiece.value < 6;
    }
    
    // For creation, target must be empty
    if (type === 'create') {
      return !targetPiece;
    }
    
    // For attacks, target must be enemy
    if (type === 'attack') {
      return targetPiece && targetPiece.playerId !== sourcePiece.playerId;
    }
  } 
  // Regular unit validation
  else {
    // For movement, target must be empty
    if (type === 'move') {
      return !targetPiece && UNIT_TYPES[sourcePiece.value].canMove;
    }
    
    // For combining, target must be friendly
    if (type === 'combine') {
      return targetPiece && 
             targetPiece.playerId === sourcePiece.playerId && 
             (targetPiece.value < 6 || sourcePiece.value < 6); // At least one must not be a base
    }
    
    // For attacks, target must be enemy and source must be able to attack
    if (type === 'attack') {
      return targetPiece && 
             targetPiece.playerId !== sourcePiece.playerId && 
             UNIT_TYPES[sourcePiece.value].canAttack;
    }
  }
  
  return false;
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
  
  // Additional validation to ensure moves are valid
  const validMoves = possibleMoves.filter(move => isValidMove(move, board));
  
  if (validMoves.length === 0) {
    return null;
  }
  
  // Score each move based on the strategy
  const scoredMoves = validMoves.map(move => {
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
