import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectBestMove } from '../utils/aiUtils';
import { 
  movePiece, 
  combineUnits, 
  handleCombat, 
  handleBaseAction,
  endTurn
} from './gameSlice';

// AI difficulty levels
export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// AI strategies
export const AI_STRATEGY = {
  RANDOM: 'random',
  AGGRESSIVE: 'aggressive',
  DEFENSIVE: 'defensive'
};

// Map difficulty levels to strategies
const difficultyToStrategy = {
  [AI_DIFFICULTY.EASY]: AI_STRATEGY.RANDOM,
  [AI_DIFFICULTY.MEDIUM]: AI_STRATEGY.AGGRESSIVE,
  [AI_DIFFICULTY.HARD]: AI_STRATEGY.DEFENSIVE
};

// Async thunk for AI move
export const makeAiMove = createAsyncThunk(
  'ai/makeAiMove',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { board, currentPlayer, actions } = state.game;
    const { aiPlayers, aiDelay } = state.ai;
    
    // Check if current player is AI
    if (!aiPlayers[currentPlayer] || actions <= 0) {
      return null;
    }
    
    // Get AI strategy based on difficulty
    const strategy = difficultyToStrategy[aiPlayers[currentPlayer]];
    
    // Select the best move
    const bestMove = selectBestMove(board, currentPlayer, strategy);
    
    if (!bestMove) {
      // No valid moves, end turn
      dispatch(endTurn());
      return null;
    }
    
    // Wait for AI delay
    await new Promise(resolve => setTimeout(resolve, aiDelay));
    
    // Execute the move
    const { fromRow, fromCol, toRow, toCol, type, isBase } = bestMove;
    
    if (isBase) {
      dispatch(handleBaseAction({ 
        baseRow: fromRow, 
        baseCol: fromCol, 
        targetRow: toRow, 
        targetCol: toCol, 
        actionType: type 
      }));
    } else if (type === 'move') {
      dispatch(movePiece({ 
        fromRow, 
        fromCol, 
        toRow, 
        toCol 
      }));
    } else if (type === 'combine') {
      dispatch(combineUnits({ 
        fromRow, 
        fromCol, 
        toRow, 
        toCol 
      }));
    } else if (type === 'attack') {
      dispatch(handleCombat({ 
        attackerRow: fromRow, 
        attackerCol: fromCol, 
        defenderRow: toRow, 
        defenderCol: toCol 
      }));
    }
    
    return bestMove;
  }
);

const initialState = {
  // Map player IDs to AI difficulty (null means human player)
  aiPlayers: {
    0: null, // Player 0 is human by default
    1: AI_DIFFICULTY.EASY, // Player 1 is AI (easy) by default
    2: AI_DIFFICULTY.MEDIUM, // Player 2 is AI (medium) by default
    3: AI_DIFFICULTY.HARD, // Player 3 is AI (hard) by default
  },
  aiDelay: 800, // Delay in ms before AI makes a move
  aiThinking: false, // Whether AI is currently "thinking"
  lastAiMove: null, // Last move made by AI
};

export const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setPlayerType: (state, action) => {
      const { playerId, type } = action.payload;
      state.aiPlayers[playerId] = type;
    },
    setAiDelay: (state, action) => {
      state.aiDelay = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(makeAiMove.pending, (state) => {
        state.aiThinking = true;
      })
      .addCase(makeAiMove.fulfilled, (state, action) => {
        state.aiThinking = false;
        state.lastAiMove = action.payload;
      })
      .addCase(makeAiMove.rejected, (state) => {
        state.aiThinking = false;
      });
  },
});

export const { setPlayerType, setAiDelay } = aiSlice.actions;

export default aiSlice.reducer;
