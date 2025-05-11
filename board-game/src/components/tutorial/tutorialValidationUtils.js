/**
 * Utility functions for validating tutorial step completion
 */

/**
 * Checks if a unit was moved to the target position
 * @param {string} unitId - ID of the unit to check
 * @param {object} targetPosition - Expected position {x, y}
 * @param {array} board - Current game board state
 * @returns {boolean} True if the unit is at the target position
 */
export const isUnitAtTargetPosition = (unitId, targetPosition, board) => {
  if (!unitId || !targetPosition || !board) return false;
  
  // Find the unit in the current board state
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x];
      if (cell && cell.id === unitId) {
        // If the unit is at the expected position, return true
        return (x === targetPosition.x && y === targetPosition.y);
      }
    }
  }
  
  return false; // Unit not found or not at target position
};

/**
 * Checks if there's a base at a specific position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate 
 * @param {array} board - Current game board state
 * @returns {boolean} True if a base exists at the position
 */
export const isBaseAtPosition = (x, y, board) => {
  if (!board || !board[y] || !board[y][x]) return false;
  return board[y][x].isBase === true;
};

/**
 * Determines if a tutorial step has been completed based on its action type and game state
 * @param {object} step - Current tutorial step
 * @param {object} gameState - Current game state
 * @returns {boolean} True if the step is completed
 */
export const isTutorialStepCompleted = (step, gameState) => {
  if (!step) return false;
  
  const { board, selectedPiece } = gameState;
  
  // For steps that just need the Next button clicked
  if (step.action === 'NEXT' || step.action === 'END_TURN' || step.action === 'COMPLETE') {
    return false; // User must click the button manually
  }
  
  // Handle different step types
  switch (step.action) {
    case 'CLICK_UNIT':
      if (selectedPiece) {
        const { targetUnit } = step;
        const selectedUnit = board[selectedPiece.row][selectedPiece.col];
        return selectedUnit && selectedUnit.id === targetUnit;
      }
      return false;
      
    case 'MOVE_TO':
    case 'ATTACK':
      // Check if the player made the expected move
      if (step.targetPosition && step.targetUnit) {
        return isUnitAtTargetPosition(step.targetUnit, step.targetPosition, board);
      }
      return false;
      
    default:
      return false;
  }
};
