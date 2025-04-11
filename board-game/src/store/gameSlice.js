import { createSlice } from '@reduxjs/toolkit';
import { 
  PLAYERS, 
  UNIT_TYPES, 
  STARTING_POSITIONS, 
  BOARD_SIZE,
  GAME_STATES 
} from '../constants/gameConstants';

/**
 * Helper function to get starting actions for a player
 */
const getStartingActions = (board, playerId) => {
  const playerPieces = board.flat().filter(cell => cell && cell.playerId === playerId);
  return playerPieces.reduce((total, piece) => total + (UNIT_TYPES[piece.value]?.actions || 0), 0);
};

/**
 * Helper function to create an empty board
 */
const createEmptyBoard = () => Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));

/**
 * Helper function to initialize the game board
 */
const initializeBoard = (numPlayers) => {
  const newBoard = createEmptyBoard();
  const actualNumPlayers = Math.min(numPlayers, 4);
  
  // Place bases at starting positions
  for (let i = 0; i < actualNumPlayers; i++) {
    const [row, col] = STARTING_POSITIONS[i];
    newBoard[row][col] = { playerId: i, value: 6 }; // Base value is 6
  }
  
  return newBoard;
};

/**
 * Check if a player has won the game
 */
const checkWinCondition = (board) => {
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

const initialState = {
  currentPlayer: 0,
  board: createEmptyBoard(),
  selectedPiece: null,
  validMoves: [],
  actions: 0,
  gameState: GAME_STATES.NOT_STARTED,
  showTurnMessage: false,
  winner: null,
  numPlayers: 4,
  turnHistory: [],
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state, action) => {
      const numPlayers = action.payload?.numPlayers || state.numPlayers;
      state.board = initializeBoard(numPlayers);
      state.currentPlayer = 0;
      state.selectedPiece = null;
      state.validMoves = [];
      state.winner = null;
      state.gameState = GAME_STATES.IN_PROGRESS;
      state.actions = getStartingActions(state.board, 0);
      state.turnHistory = [];
    },
    
    selectPiece: (state, action) => {
      const { row, col, isBase } = action.payload;
      state.selectedPiece = { row, col, isBase };
    },
    
    setValidMoves: (state, action) => {
      state.validMoves = action.payload;
    },
    
    clearSelection: (state) => {
      state.selectedPiece = null;
      state.validMoves = [];
    },
    
    movePiece: (state, action) => {
      const { fromRow, fromCol, toRow, toCol } = action.payload;
      const piece = state.board[fromRow][fromCol];
      
      if (!piece) return;
      
      // Create a new board with the piece moved
      const newBoard = [...state.board.map(row => [...row])];
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = null;
      
      state.board = newBoard;
      state.actions -= 1;
      state.selectedPiece = null;
      state.validMoves = [];
      
      // Check win condition
      const winner = checkWinCondition(newBoard);
      if (winner !== null) {
        state.winner = PLAYERS[winner];
        state.gameState = GAME_STATES.FINISHED;
      }
      
      // Add to turn history
      state.turnHistory.push({
        type: 'move',
        player: state.currentPlayer,
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece
      });
    },
    
    combineUnits: (state, action) => {
      const { fromRow, fromCol, toRow, toCol } = action.payload;
      const sourceUnit = state.board[fromRow][fromCol];
      const targetUnit = state.board[toRow][toCol];
      
      if (!sourceUnit || !targetUnit) return;
      
      const newBoard = [...state.board.map(row => [...row])];
      const combinedValue = sourceUnit.value + targetUnit.value;
      
      if (combinedValue <= 6) {
        // Units combine to a new unit with summed value
        newBoard[toRow][toCol] = { 
          playerId: targetUnit.playerId, 
          value: combinedValue 
        };
        newBoard[fromRow][fromCol] = null;
      } else if (targetUnit.value < 6) {
        // Target becomes a base (6), source keeps remainder
        newBoard[toRow][toCol] = { 
          playerId: targetUnit.playerId, 
          value: 6 
        };
        newBoard[fromRow][fromCol] = { 
          playerId: sourceUnit.playerId, 
          value: combinedValue - 6 
        };
      }
      
      state.board = newBoard;
      state.actions -= 1;
      state.selectedPiece = null;
      state.validMoves = [];
      
      // Add to turn history
      state.turnHistory.push({
        type: 'combine',
        player: state.currentPlayer,
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        sourceUnit,
        targetUnit,
        result: newBoard[toRow][toCol],
        remainder: newBoard[fromRow][fromCol]
      });
    },
    
    handleCombat: (state, action) => {
      const { attackerRow, attackerCol, defenderRow, defenderCol } = action.payload;
      const attacker = state.board[attackerRow][attackerCol];
      const defender = state.board[defenderRow][defenderCol];
      
      if (!attacker || !defender) return;
      
      const newBoard = [...state.board.map(row => [...row])];
      
      if (attacker.value > defender.value) {
        // Attacker wins
        const newValue = Math.max(1, attacker.value - defender.value);
        newBoard[defenderRow][defenderCol] = { 
          playerId: attacker.playerId, 
          value: newValue 
        };
        newBoard[attackerRow][attackerCol] = null;
      } else {
        // Defender wins or ties
        if (attacker.value === defender.value) {
          // Equal values - both are removed
          newBoard[defenderRow][defenderCol] = null;
        } else {
          // Defender survives with reduced value
          newBoard[defenderRow][defenderCol] = { 
            playerId: defender.playerId, 
            value: defender.value - attacker.value 
          };
        }
        newBoard[attackerRow][attackerCol] = null;
      }
      
      state.board = newBoard;
      state.actions -= 1;
      state.selectedPiece = null;
      state.validMoves = [];
      
      // Check win condition
      const winner = checkWinCondition(newBoard);
      if (winner !== null) {
        state.winner = PLAYERS[winner];
        state.gameState = GAME_STATES.FINISHED;
      }
      
      // Add to turn history
      state.turnHistory.push({
        type: 'combat',
        player: state.currentPlayer,
        attacker: { row: attackerRow, col: attackerCol, unit: attacker },
        defender: { row: defenderRow, col: defenderCol, unit: defender },
        result: newBoard[defenderRow][defenderCol]
      });
    },
    
    handleBaseAction: (state, action) => {
      const { baseRow, baseCol, targetRow, targetCol, actionType } = action.payload;
      const base = state.board[baseRow][baseCol];
      const target = state.board[targetRow][targetCol];
      
      if (!base || base.value !== 6) return;
      
      const newBoard = [...state.board.map(row => [...row])];
      
      if (actionType === 'create' && !target) {
        // Create a new unit (value 1) in an empty adjacent cell
        newBoard[targetRow][targetCol] = { 
          playerId: base.playerId, 
          value: 1 
        };
      } else if (actionType === 'upgrade' && target && target.playerId === base.playerId) {
        // Upgrade a friendly unit (max value 6)
        if (target.value < 6) {
          newBoard[targetRow][targetCol] = { 
            playerId: target.playerId, 
            value: target.value + 1 
          };
        }
      } else if (actionType === 'reduce' && target && target.playerId !== base.playerId) {
        // Reduce an enemy unit by 1
        if (target.value > 1) {
          newBoard[targetRow][targetCol] = { 
            playerId: target.playerId, 
            value: target.value - 1 
          };
        } else {
          // Remove the unit if reduced to 0
          newBoard[targetRow][targetCol] = null;
        }
      }
      
      state.board = newBoard;
      state.actions -= 1;
      state.selectedPiece = null;
      state.validMoves = [];
      
      // Check win condition
      const winner = checkWinCondition(newBoard);
      if (winner !== null) {
        state.winner = PLAYERS[winner];
        state.gameState = GAME_STATES.FINISHED;
      }
      
      // Add to turn history
      state.turnHistory.push({
        type: 'baseAction',
        player: state.currentPlayer,
        base: { row: baseRow, col: baseCol },
        target: { row: targetRow, col: targetCol },
        actionType,
        targetBefore: target,
        targetAfter: newBoard[targetRow][targetCol]
      });
    },
    
    decrementActions: (state) => {
      state.actions -= 1;
    },
    
    endTurn: (state) => {
      // Move to next player
      let nextPlayer = (state.currentPlayer + 1) % state.numPlayers;
      
      // Skip players that have been eliminated
      let playersChecked = 0;
      while (playersChecked < state.numPlayers) {
        const playerHasUnits = state.board.flat().some(cell => 
          cell && cell.playerId === nextPlayer
        );
        
        if (playerHasUnits) break;
        
        nextPlayer = (nextPlayer + 1) % state.numPlayers;
        playersChecked++;
      }
      
      state.currentPlayer = nextPlayer;
      state.actions = getStartingActions(state.board, nextPlayer);
      state.selectedPiece = null;
      state.validMoves = [];
      state.showTurnMessage = true;
      
      // Add to turn history
      state.turnHistory.push({
        type: 'endTurn',
        prevPlayer: state.currentPlayer,
        nextPlayer
      });
    },
    
    setShowTurnMessage: (state, action) => {
      state.showTurnMessage = action.payload;
    },
    
    setNumPlayers: (state, action) => {
      state.numPlayers = action.payload;
    }
  },
});

export const { 
  initializeGame,
  selectPiece,
  setValidMoves,
  clearSelection,
  movePiece,
  combineUnits,
  handleCombat,
  handleBaseAction,
  decrementActions,
  endTurn,
  setShowTurnMessage,
  setNumPlayers
} = gameSlice.actions;

export default gameSlice.reducer;
