import { UNIT_TYPES } from '../constants/gameConstants';
import { getAdjacentTiles } from './boardUtils';

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
export const getValidMovesForPiece = (board, row, col, currentPlayer) => {
  const piece = board[row][col];
  if (!piece || piece.playerId !== currentPlayer) return [];

  const validMoves = [];
  const isBase = piece.value === 6;

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
