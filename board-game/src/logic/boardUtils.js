import { BOARD_SIZE, STARTING_POSITIONS } from '../constants/gameConstants';

/**
 * Create a deep copy of the board
 * @param {Array} board - Game board
 * @returns {Array} Deep copy of the board
 */
export const cloneBoard = (board) => {
  return board.map(row => [...row]);
};

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
    isCellValid(r, c) // Use isCellValid here for consistency
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

// Moved from gameSlice.js
/**
 * Helper function to create an empty board
 */
export const createEmptyBoard = () => Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));

/**
 * Helper function to initialize the game board
 */
export const initializeBoard = (numPlayers) => {
  const newBoard = createEmptyBoard();
  const actualNumPlayers = Math.min(numPlayers, 4);
  
  // Place bases at starting positions
  for (let i = 0; i < actualNumPlayers; i++) {
    const [row, col] = STARTING_POSITIONS[i];
    newBoard[row][col] = { playerId: i, value: 6 }; // Base value is 6
  }
  
  return newBoard;
};
