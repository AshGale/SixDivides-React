import { UNIT_TYPES, PLAYERS, GAME_STATES } from '../constants/gameConstants';
import { getStartingActions as calculateStartingActions, checkWinCondition as determineWinner, findNextPlayerWithUnits as getNextPlayer } from './gameplayUtils'; // Placeholder for self-import during move

/**
 * Helper function to get starting actions for a player
 */
export const getStartingActions = (board, playerId) => {
  const playerPieces = board.flat().filter(cell => cell && cell.playerId === playerId);
  return playerPieces.reduce((total, piece) => total + (UNIT_TYPES[piece.value]?.actions || 0), 0);
};

/**
 * Check if a player has won the game
 * @returns {number|null} Player ID of the winner, or null
 */
export const checkWinCondition = (board) => {
  const playersWithUnits = new Set();
  board.flat().forEach(cell => {
    if (cell) {
      playersWithUnits.add(cell.playerId);
    }
  });
  
  if (playersWithUnits.size === 1) {
    return Array.from(playersWithUnits)[0];
  }
  return null;
};

/**
 * Find the next player with units on the board
 * @returns {number} Player ID of the next player
 */
export const findNextPlayerWithUnits = (board, currentPlayer, numPlayers) => {
  let nextPlayer = (currentPlayer + 1) % numPlayers;
  let playersChecked = 0;
  
  while (playersChecked < numPlayers) {
    const playerHasUnits = board.flat().some(cell => 
      cell && cell.playerId === nextPlayer
    );
    
    if (playerHasUnits) {
      const startingActions = getStartingActions(board, nextPlayer); // Use exported version
      // If the next player has no actions, skip them too
      if (startingActions > 0) {
        return nextPlayer;
      }
    }
    
    nextPlayer = (nextPlayer + 1) % numPlayers;
    playersChecked++;
  }
  
  // Fallback to prevent infinite loops if no player has actions (shouldn't happen if win condition is checked)
  return (currentPlayer + 1) % numPlayers; 
};

// --- Logic extracted from gameSlice reducers --- 

/**
 * Processes a simple move action.
 * @returns {Array} The updated board.
 */
export const processMove = (board, fromRow, fromCol, toRow, toCol) => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[fromRow][fromCol];
  if (!piece) return board; // Should not happen if validation is correct

  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;
  return newBoard;
};

/**
 * Processes a combine action between two friendly units.
 * @returns {Array} The updated board.
 */
export const processCombine = (board, fromRow, fromCol, toRow, toCol) => {
  const newBoard = board.map(row => [...row]);
  const sourcePiece = newBoard[fromRow][fromCol];
  const targetPiece = newBoard[toRow][toCol];
  
  // Basic validation (should be guaranteed by prior checks)
  if (!sourcePiece || !targetPiece || sourcePiece.playerId !== targetPiece.playerId) {
    return board;
  }

  // Calculate combined value, capped at 6
  let combinedValue = sourcePiece.value + targetPiece.value;
  if (combinedValue > 6) {
    combinedValue = 6;
  }
  
  newBoard[toRow][toCol] = { 
    playerId: sourcePiece.playerId, 
    value: combinedValue
  };
  newBoard[fromRow][fromCol] = null;
  return newBoard;
};

/**
 * Processes a combat action between two units.
 * @returns {Array} The updated board after combat resolution.
 */
export const processCombat = (board, attackerRow, attackerCol, defenderRow, defenderCol) => {
  const newBoard = board.map(row => [...row]);
  const attacker = newBoard[attackerRow][attackerCol];
  const defender = newBoard[defenderRow][defenderCol];

  // Basic validation
  if (!attacker || !defender || attacker.playerId === defender.playerId) {
    return board;
  }

  // Simple combat logic: highest value wins, loser is removed.
  // Ties: Attacker wins (removes defender)
  if (attacker.value >= defender.value) {
    newBoard[defenderRow][defenderCol] = null; // Defender removed
    // Move attacker to defender's cell
    newBoard[defenderRow][defenderCol] = attacker;
    newBoard[attackerRow][attackerCol] = null;
  } else {
    newBoard[attackerRow][attackerCol] = null; // Attacker removed
  }
  
  return newBoard;
};

/**
 * Processes an action performed by a base.
 * @returns {Array} The updated board.
 */
export const processBaseAction = (board, baseRow, baseCol, targetRow, targetCol, actionType) => {
  const newBoard = board.map(row => [...row]);
  const base = newBoard[baseRow][baseCol];
  const target = newBoard[targetRow][targetCol];

  // Basic validation
  if (!base || base.value !== 6) return board;

  if (actionType === 'create' && !target) {
    // Create a new unit (value 1)
    newBoard[targetRow][targetCol] = { playerId: base.playerId, value: 1 };
  } else if (actionType === 'upgrade' && target && target.playerId === base.playerId) {
    // Upgrade a friendly unit (max value 6)
    if (target.value < 6) {
      newBoard[targetRow][targetCol] = { ...target, value: target.value + 1 };
    }
  } else if (actionType === 'attack' && target && target.playerId !== base.playerId) { 
    // Use 'attack' consistently for base reducing enemy
    // Reduce an enemy unit by 1
    if (target.value > 1) {
      newBoard[targetRow][targetCol] = { ...target, value: target.value - 1 };
    } else {
      // Remove the unit if reduced to 0
      newBoard[targetRow][targetCol] = null;
    }
  }
  
  return newBoard;
};
