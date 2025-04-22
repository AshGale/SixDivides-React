import { BOARD_SIZE, UNIT_TYPES } from '../constants/gameConstants';

/**
 * Get adjacent tiles for a given position
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {Array} Array of valid adjacent positions
 */
export const getAdjacentTiles = (row, col) => {
  const adjacent = [
    [row - 1, col], // up
    [row + 1, col], // down
    [row, col - 1], // left
    [row, col + 1], // right
  ];
  return adjacent.filter(([r, c]) => 
    r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
  );
};

/**
 * Check if a cell position is valid
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} Whether the cell is valid
 */
export const isCellValid = (row, col) => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
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

/**
 * Get CSS classes for a cell based on its state
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {Array} validMoves - Array of valid moves
 * @param {Object} selectedPiece - Currently selected piece
 * @param {Array} board - Game board
 * @param {number} currentPlayer - Current player ID
 * @returns {string} CSS classes for the cell
 */
export const getCellClasses = (row, col, validMoves, selectedPiece, board, currentPlayer) => {
  const classes = [];
  
  // Extra safety check - never highlight bases as valid moves for non-base units
  const cell = board?.[row]?.[col];
  if (cell && cell.value === 6 && cell.playerId === currentPlayer && 
      selectedPiece && selectedPiece.value !== 6) {
    return '';
  }
  
  // Check if this cell is a valid move
  const validMove = validMoves.find(move => move.row === row && move.col === col);
  
  if (validMove) {
    classes.push('valid-move');
    classes.push(`valid-move-${validMove.type}`);
  }
  
  // Check if this cell is selected
  if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
    classes.push('selected');
  }
  
  return classes.join(' ');
};

/**
 * Create a deep copy of the board
 * @param {Array} board - Game board
 * @returns {Array} Deep copy of the board
 */
export const cloneBoard = (board) => {
  return board.map(row => [...row]);
};
