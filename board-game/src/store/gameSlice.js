import { createSlice } from '@reduxjs/toolkit';
import { 
  PLAYERS, 
  GAME_STATES 
} from '../constants/gameConstants';
// Import centralized logic functions
import {
  createEmptyBoard, 
  initializeBoard as initializeBoardLogic,
  getStartingActions,
  checkWinCondition,
  findNextPlayerWithUnits,
  processMove,
  processCombine,
  processCombat,
  processBaseAction,
  cloneBoard // Needed for history tracking potentially
} from '../logic';

const initialState = {
  currentPlayer: 0,
  board: createEmptyBoard(), // Use imported function for initial state
  selectedPiece: null,
  validMoves: [],
  actions: 0,
  gameState: GAME_STATES.NOT_STARTED,
  showTurnMessage: false,
  winner: null,
  numPlayers: 4,
  turnHistory: [],
  saveStatus: null, // Track save status for UI feedback
  loadStatus: null, // Track load status for UI feedback
  availableSaves: [], // List of available saves
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state, action) => {
      const numPlayers = action.payload?.numPlayers || state.numPlayers;
      // Use logic function to initialize board
      state.board = initializeBoardLogic(numPlayers); 
      state.currentPlayer = 0;
      state.selectedPiece = null;
      state.validMoves = [];
      state.winner = null;
      state.gameState = GAME_STATES.IN_PROGRESS;
      // Use logic function to get starting actions
      state.actions = getStartingActions(state.board, 0); 
      state.turnHistory = [{ type: 'initialize', numPlayers }];
      
      // If the first player has no actions, move to the next player
      if (state.actions === 0 && !state.winner) {
        // Use logic function to find next player
        const nextPlayer = findNextPlayerWithUnits(state.board, state.currentPlayer, numPlayers); 
        state.currentPlayer = nextPlayer;
        state.actions = getStartingActions(state.board, nextPlayer); // Use logic function
        state.showTurnMessage = true;
        state.turnHistory.push({ type: 'autoEndTurn', reason: 'no actions', nextPlayer });
      }
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
      const pieceBefore = cloneBoard(state.board)[fromRow][fromCol]; // For history
      // Use logic function to process the move
      const newBoard = processMove(state.board, fromRow, fromCol, toRow, toCol);

      if (newBoard !== state.board) { // Check if the board actually changed
        state.board = newBoard;
        // Ensure actions don't go below 0
        state.actions = Math.max(0, state.actions - 1);
        state.turnHistory.push({ 
          type: 'move', 
          player: state.currentPlayer, 
          from: { row: fromRow, col: fromCol, piece: pieceBefore }, 
          to: { row: toRow, col: toCol }
        });
      } else {
        // Handle case where move didn't happen (e.g., source piece didn't exist)
        // Optionally log an error or handle gracefully
      }
      state.selectedPiece = null;
      state.validMoves = [];
    },
    
    combineUnits: (state, action) => {
      const { fromRow, fromCol, toRow, toCol } = action.payload;
      const boardBefore = cloneBoard(state.board); // For history
      const sourcePieceBefore = boardBefore[fromRow][fromCol];
      const targetPieceBefore = boardBefore[toRow][toCol];
      
      // Use logic function to process combine
      const newBoard = processCombine(state.board, fromRow, fromCol, toRow, toCol);
      
      if (newBoard !== state.board) {
        state.board = newBoard;
        // Ensure actions don't go below 0
        state.actions = Math.max(0, state.actions - 1);
        state.turnHistory.push({
          type: 'combine',
          player: state.currentPlayer,
          from: { row: fromRow, col: fromCol, piece: sourcePieceBefore },
          to: { row: toRow, col: toCol, pieceBefore: targetPieceBefore, pieceAfter: newBoard[toRow][toCol] }
        });
        // Check win condition after combine
        const winnerId = checkWinCondition(newBoard);
        if (winnerId !== null) {
          state.winner = PLAYERS[winnerId];
          state.gameState = GAME_STATES.FINISHED;
        }
      } else {
         // Handle case where combine didn't happen
      }
      state.selectedPiece = null;
      state.validMoves = [];
    },
    
    handleCombat: (state, action) => {
      const { attackerRow, attackerCol, defenderRow, defenderCol } = action.payload;
      const boardBefore = cloneBoard(state.board); // For history
      const attackerBefore = boardBefore[attackerRow][attackerCol];
      const defenderBefore = boardBefore[defenderRow][defenderCol];
      
      // Use logic function to process combat
      const newBoard = processCombat(state.board, attackerRow, attackerCol, defenderRow, defenderCol);
      
      if (newBoard !== state.board) {
        state.board = newBoard;
        // Ensure actions don't go below 0
        state.actions = Math.max(0, state.actions - 1);
        state.turnHistory.push({
          type: 'combat',
          player: state.currentPlayer,
          attacker: { row: attackerRow, col: attackerCol, unit: attackerBefore },
          defender: { row: defenderRow, col: defenderCol, unit: defenderBefore },
          boardAfter: cloneBoard(newBoard) // Record state after combat
        });
        // Check win condition after combat
        const winnerId = checkWinCondition(newBoard);
        if (winnerId !== null) {
          state.winner = PLAYERS[winnerId];
          state.gameState = GAME_STATES.FINISHED;
        }
      } else {
        // Handle case where combat didn't happen 
      }
      state.selectedPiece = null;
      state.validMoves = [];
    },
    
    handleBaseAction: (state, action) => {
      const { baseRow, baseCol, targetRow, targetCol, actionType } = action.payload;
      const boardBefore = cloneBoard(state.board); // For history
      
      // Use logic function to process base action
      const newBoard = processBaseAction(state.board, baseRow, baseCol, targetRow, targetCol, actionType, state.currentPlayer);
      
      if (newBoard !== state.board) {
        state.board = newBoard;
        // Ensure actions don't go below 0
        state.actions = Math.max(0, state.actions - 1);
        state.turnHistory.push({
          type: 'baseAction',
          player: state.currentPlayer,
          base: { row: baseRow, col: baseCol },
          target: { row: targetRow, col: targetCol },
          actionType,
          targetBefore: boardBefore[targetRow][targetCol],
          targetAfter: newBoard[targetRow][targetCol]
        });
        // Check win condition after base action
        const winnerId = checkWinCondition(newBoard);
        if (winnerId !== null) {
          state.winner = PLAYERS[winnerId];
          state.gameState = GAME_STATES.FINISHED;
        }
      } else {
         // Handle case where base action didn't happen
      }
      state.selectedPiece = null;
      state.validMoves = [];
    },
    
    decrementActions: (state) => {
      // Ensure actions never go below 0
      state.actions = Math.max(0, state.actions - 1);
    },
    
    endTurn: (state) => {
      // Fix actions if somehow they went negative
      if (state.actions < 0) {
        state.actions = 0;
      }
      
      // Check win condition before ending turn (in case last action caused win)
      const winnerId = checkWinCondition(state.board);
      if (winnerId !== null) {
        state.winner = PLAYERS[winnerId];
        state.gameState = GAME_STATES.FINISHED;
        // Don't proceed to next turn if game is over
        return; 
      }
      
      // Use logic function to find next player
      const nextPlayer = findNextPlayerWithUnits(state.board, state.currentPlayer, state.numPlayers);
      const prevPlayer = state.currentPlayer; // Store previous player for history
      
      state.currentPlayer = nextPlayer;
      // Use logic function to get starting actions
      state.actions = getStartingActions(state.board, nextPlayer); 
      state.selectedPiece = null;
      state.validMoves = [];
      state.showTurnMessage = true;
      
      state.turnHistory.push({
        type: 'endTurn',
        prevPlayer,
        nextPlayer
      });

      // Handle case where the next player immediately has no actions (e.g., all units were just destroyed)
      if (state.actions === 0 && state.gameState !== GAME_STATES.FINISHED) {
         const nextNextPlayer = findNextPlayerWithUnits(state.board, state.currentPlayer, state.numPlayers);
         state.currentPlayer = nextNextPlayer;
         state.actions = getStartingActions(state.board, nextNextPlayer); 
         state.turnHistory.push({ type: 'autoEndTurn', reason: 'no actions', prevPlayer: nextPlayer, nextPlayer: nextNextPlayer });
         // Potentially loop again if this player also has no actions, although checkWinCondition should prevent infinite loops ideally.
         // For robustness, consider adding a maximum loop count or ensuring findNextPlayer always eventually finds someone or triggers win/draw.
      }
    },
    
    setShowTurnMessage: (state, action) => {
      state.showTurnMessage = action.payload;
    },
    
    setNumPlayers: (state, action) => {
      state.numPlayers = action.payload;
    },
    
    // Save game state action
    saveGameState: (state, action) => {
      // The actual saving happens in the thunk, this just updates UI state
      state.saveStatus = action.payload;
    },
    
    // Set available saves action
    setAvailableSaves: (state, action) => {
      state.availableSaves = action.payload;
    },
    
    // Load game state action
    loadGameState: (state, action) => {
      // Replace the entire state with the loaded state
      const loadedState = action.payload;
      
      // Only update if we have a valid state to load
      if (loadedState) {
        // Apply all properties from loaded state, preserving the current functions
        Object.keys(loadedState).forEach(key => {
          // Skip non-serializable parts or UI feedback properties
          if (key !== 'saveStatus' && key !== 'loadStatus') {
            state[key] = loadedState[key];
          }
        });
        
        // Update load status for UI feedback
        state.loadStatus = { success: true, message: "Game loaded successfully" };
      } else {
        state.loadStatus = { success: false, message: "Failed to load game" };
      }
    },
    
    // Clear save/load status (to reset UI feedback)
    clearSaveLoadStatus: (state) => {
      state.saveStatus = null;
      state.loadStatus = null;
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
  setNumPlayers,
  saveGameState,
  loadGameState,
  setAvailableSaves,
  clearSaveLoadStatus
} = gameSlice.actions;

export default gameSlice.reducer;
