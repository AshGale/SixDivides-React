/**
 * Determine the CSS class for a piece based on its player ID and value
 * @param {Object} piece - The piece object (e.g., { playerId: 1, value: 4 })
 * @returns {string} - The CSS class for the piece
 */
export const getPieceClass = (piece) => {
  // Ensure piece exists before accessing properties
  if (!piece) return ''; 
  return `piece player-${piece.playerId} value-${piece.value}`;
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
