import { BOARD_SIZE } from '../constants/gameConstants';

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
 * Create a deep copy of the board
 * @param {Array} board - Game board
 * @returns {Array} Deep copy of the board
 */
export const cloneBoard = (board) => {
  return board.map(row => [...row]);
};
