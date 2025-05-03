/**
 * Predefined Scenario Maps
 * These scenarios are available to all users regardless of browser
 */
import { UNIT_TYPES } from './gameConstants';

// Helper to create units with proper actions
const createUnit = (playerId, value) => ({
  playerId,
  value,
  actions: UNIT_TYPES[value].actions
});

// Base scenarios defined in the codebase
const PREDEFINED_SCENARIOS = [
  // Sample scenario - this will be visible to all users
  {
    id: 'sample-scenario',
    name: 'Sample Scenario',
    description: 'A simple scenario to demonstrate the feature',
    gameState: {
      board: Array(8).fill().map((_, i) => Array(8).fill(null)),
      currentPlayer: 0,
      selectedPiece: null,
      validMoves: [],
      actions: 3,
      gameState: 'NOT_STARTED',
      showTurnMessage: false,
      winner: null,
      numPlayers: 4,
      turnHistory: [{ type: 'scenario', name: 'Sample Scenario', createdAt: new Date().toISOString() }],
    }
  },
  {
    id: 'starting-positions',
    name: 'Starting Positions',
    description: 'Standard starting position with units in the corners.',
    gameState: {
      board: Array(8).fill().map((_, i) => Array(8).fill(null)),
      currentPlayer: 0,
      selectedPiece: null,
      validMoves: [],
      actions: 3,
      gameState: 'NOT_STARTED',
      showTurnMessage: false,
      winner: null,
      numPlayers: 4,
      turnHistory: [{ type: 'scenario', name: 'Starting Positions', createdAt: new Date().toISOString() }],
    },
    setupFunction: (board) => {
      // Player 0 (Red) units in top-left corner
      board[0][0] = createUnit(0, 5); // Castle
      board[0][1] = createUnit(0, 1); // Pawn
      board[1][0] = createUnit(0, 1); // Pawn
      
      // Player 1 (Green) units in top-right corner
      board[0][7] = createUnit(1, 5); // Castle
      board[0][6] = createUnit(1, 1); // Pawn
      board[1][7] = createUnit(1, 1); // Pawn
      
      // Player 2 (Blue) units in bottom-right corner
      board[7][7] = createUnit(2, 5); // Castle
      board[7][6] = createUnit(2, 1); // Pawn
      board[6][7] = createUnit(2, 1); // Pawn
      
      // Player 3 (Yellow) units in bottom-left corner
      board[7][0] = createUnit(3, 5); // Castle
      board[7][1] = createUnit(3, 1); // Pawn
      board[6][0] = createUnit(3, 1); // Pawn
      
      return board;
    }
  },
  {
    id: 'knights-battle',
    name: 'Knights Battle',
    description: 'Face off with knights in the center.',
    gameState: {
      board: Array(8).fill().map((_, i) => Array(8).fill(null)),
      currentPlayer: 0,
      selectedPiece: null,
      validMoves: [],
      actions: 3,
      gameState: 'NOT_STARTED',
      showTurnMessage: false,
      winner: null,
      numPlayers: 4,
      turnHistory: [{ type: 'scenario', name: 'Knights Battle', createdAt: new Date().toISOString() }],
    },
    setupFunction: (board) => {
      // Player 0 (Red) setup
      board[1][1] = createUnit(0, 5); // Castle in corner
      board[3][3] = createUnit(0, 2); // Knight
      
      // Player 1 (Green) setup
      board[1][6] = createUnit(1, 5); // Castle in corner
      board[3][4] = createUnit(1, 2); // Knight
      
      // Player 2 (Blue) setup
      board[6][6] = createUnit(2, 5); // Castle in corner
      board[4][4] = createUnit(2, 2); // Knight
      
      // Player 3 (Yellow) setup
      board[6][1] = createUnit(3, 5); // Castle in corner
      board[4][3] = createUnit(3, 2); // Knight
      
      return board;
    }
  },
  {
    id: 'queen-versus-all',
    name: 'Queen Versus All',
    description: 'One player has a powerful queen while others have multiple units.',
    gameState: {
      board: Array(8).fill().map((_, i) => Array(8).fill(null)),
      currentPlayer: 0,
      selectedPiece: null,
      validMoves: [],
      actions: 3,
      gameState: 'NOT_STARTED',
      showTurnMessage: false,
      winner: null,
      numPlayers: 4,
      turnHistory: [{ type: 'scenario', name: 'Queen Versus All', createdAt: new Date().toISOString() }],
    },
    setupFunction: (board) => {
      // Player 0 (Red) has a queen and castle
      board[0][0] = createUnit(0, 5); // Castle
      board[3][3] = createUnit(0, 4); // Queen
      
      // Player 1 (Green) has multiple pawns and a castle
      board[0][7] = createUnit(1, 5); // Castle
      board[2][6] = createUnit(1, 1); // Pawn
      board[3][7] = createUnit(1, 1); // Pawn
      board[2][7] = createUnit(1, 2); // Knight
      
      // Player 2 (Blue) has multiple pawns and a castle
      board[7][7] = createUnit(2, 5); // Castle
      board[5][5] = createUnit(2, 1); // Pawn
      board[6][6] = createUnit(2, 1); // Pawn
      board[7][5] = createUnit(2, 2); // Knight
      
      // Player 3 (Yellow) has multiple pawns and a castle
      board[7][0] = createUnit(3, 5); // Castle
      board[5][2] = createUnit(3, 1); // Pawn
      board[5][1] = createUnit(3, 1); // Pawn
      board[6][1] = createUnit(3, 2); // Knight
      
      return board;
    }
  }
];

// Initialize the board for the sample scenario
PREDEFINED_SCENARIOS[0].gameState.board[0][0] = createUnit(0, 5); // Player 0 castle
PREDEFINED_SCENARIOS[0].gameState.board[2][2] = createUnit(0, 2); // Player 0 knight
PREDEFINED_SCENARIOS[0].gameState.board[7][7] = createUnit(1, 5); // Player 1 castle
PREDEFINED_SCENARIOS[0].gameState.board[5][5] = createUnit(1, 4); // Player 1 queen

// Runtime added scenarios (in a real app, these would come from a server)
let RUNTIME_SCENARIOS = [];

// All scenarios combined (predefined + runtime)
export const SCENARIOS = [...PREDEFINED_SCENARIOS, ...RUNTIME_SCENARIOS];

/**
 * Register a new scenario at runtime
 * @param {Object} scenario - The scenario object to register
 */
export const registerScenario = (scenario) => {
  // Ensure we're not adding a duplicate
  const existingIndex = RUNTIME_SCENARIOS.findIndex(s => s.id === scenario.id);
  
  if (existingIndex >= 0) {
    // Replace existing scenario
    RUNTIME_SCENARIOS[existingIndex] = scenario;
  } else {
    // Add new scenario
    RUNTIME_SCENARIOS.push(scenario);
  }
  
  // Update the exported SCENARIOS array
  SCENARIOS.length = 0; // Clear the array
  SCENARIOS.push(...PREDEFINED_SCENARIOS, ...RUNTIME_SCENARIOS); // Re-add all scenarios
  
  return true;
};

/**
 * Get a scenario by ID
 * @param {string} id - The scenario ID
 * @returns {Object} - The scenario object or null if not found
 */
export const getScenarioById = (id) => {
  const scenario = SCENARIOS.find(scenario => scenario.id === id);
  if (!scenario) return null;
  
  // Create a deep copy to avoid modifying the original
  const scenarioCopy = JSON.parse(JSON.stringify(scenario));
  
  // Setup the board using the scenario's setup function if it exists
  if (scenarioCopy.setupFunction && typeof scenarioCopy.setupFunction === 'function') {
    const board = scenarioCopy.gameState.board;
    scenarioCopy.gameState.board = scenarioCopy.setupFunction(board);
  }
  
  return scenarioCopy;
};

/**
 * Get all available scenarios
 * @returns {Array} - Array of scenario objects with id, name, and description
 */
export const getAvailableScenarios = () => {
  return SCENARIOS.map(scenario => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description
  }));
};
