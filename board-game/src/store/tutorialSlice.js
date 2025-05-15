import { createSlice } from '@reduxjs/toolkit';
import { getBasicMovesTutorial } from '../logic/tutorialUtils';
import { loadGameState } from './gameSlice';

const initialState = {
  isActive: false,
  tutorialScenario: null,
  currentStep: 0,
  tutorialCompleted: false
};

const tutorialSlice = createSlice({
  name: 'tutorial',
  initialState,
  reducers: {
    startTutorial: (state, action) => {
      const scenarioId = action.payload || 'basic-moves';
      let scenario;
      
      // Load the appropriate tutorial scenario
      if (scenarioId === 'basic-moves') {
        scenario = getBasicMovesTutorial();
      } else {
        // Default to basic moves if no valid scenario is provided
        scenario = getBasicMovesTutorial();
      }
      
      state.tutorialScenario = scenario;
      state.isActive = true;
      state.currentStep = 0;
      state.tutorialCompleted = false;
    },
    
    advanceTutorial: (state) => {
      if (!state.tutorialScenario) return;
      
      // If we're on the last step, mark tutorial as completed
      if (state.currentStep >= state.tutorialScenario.steps.length - 1) {
        state.tutorialCompleted = true;
      } else {
        // Otherwise, advance to the next step
        state.currentStep += 1;
      }
    },
    
    exitTutorial: (state) => {
      state.isActive = false;
      state.tutorialScenario = null;
      state.currentStep = 0;
    },
    
    resetTutorial: (state) => {
      return initialState;
    }
  }
});

// Thunk to initialize a tutorial
export const initializeTutorial = (scenarioId) => (dispatch) => {
  // First, fetch the tutorial scenario
  const scenario = scenarioId === 'basic-moves' ? 
    getBasicMovesTutorial() : getBasicMovesTutorial();
    
  // Create a game state object with the tutorial board and settings
  const tutorialGameState = {
    board: scenario.board,
    currentPlayer: scenario.currentPlayer,
    actions: 3, // Give the player a set number of actions for tutorial
    selectedPiece: null,
    validMoves: [],
    gameState: 'IN_PROGRESS',
    showTurnMessage: false,
    winner: null,
    numPlayers: 2, // Set number of players for tutorial
    turnHistory: [] // Initialize with empty turn history
  };
  
  // First activate the tutorial scenario
  dispatch(startTutorial(scenarioId));
  
  // Then load the tutorial game state
  // We do this second to ensure the tutorial state is ready
  dispatch(loadGameState(tutorialGameState));
};

export const { 
  startTutorial, 
  advanceTutorial, 
  exitTutorial, 
  resetTutorial 
} = tutorialSlice.actions;

export default tutorialSlice.reducer;
