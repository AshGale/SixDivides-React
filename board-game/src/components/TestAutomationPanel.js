import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { loadGameState } from '../store/gameSlice';

// Test scenario data directly embedded to avoid API dependency
const gameplayTestScenario = {
  id: "gameplay-test",
  name: "Gameplay Test Scenario",
  description: "A comprehensive scenario to test all gameplay mechanics including movement, combining, combat, and base actions",
  gameState: {
    board: [
      [
        { playerId: 0, value: 6 }, { playerId: 0, value: 1 }, { playerId: 0, value: 3 }, null, null, { playerId: 1, value: 3 }, { playerId: 1, value: 1 }, { playerId: 1, value: 6 }
      ],
      [
        { playerId: 0, value: 1 }, { playerId: 0, value: 5 }, { playerId: 0, value: 2 }, null, null, { playerId: 1, value: 2 }, { playerId: 1, value: 5 }, { playerId: 1, value: 1 }
      ],
      [
        { playerId: 0, value: 4 }, { playerId: 0, value: 1 }, { playerId: 0, value: 1 }, null, null, { playerId: 1, value: 1 }, { playerId: 1, value: 1 }, { playerId: 1, value: 4 }
      ],
      [
        null, null, { playerId: 0, value: 3 }, { playerId: 0, value: 2 }, { playerId: 1, value: 2 }, { playerId: 1, value: 3 }, null, null
      ],
      [
        null, null, { playerId: 3, value: 3 }, { playerId: 3, value: 2 }, { playerId: 2, value: 2 }, { playerId: 2, value: 3 }, null, null
      ],
      [
        { playerId: 3, value: 4 }, { playerId: 3, value: 1 }, { playerId: 3, value: 1 }, null, null, { playerId: 2, value: 1 }, { playerId: 2, value: 1 }, { playerId: 2, value: 4 }
      ],
      [
        { playerId: 3, value: 1 }, { playerId: 3, value: 5 }, { playerId: 3, value: 2 }, null, null, { playerId: 2, value: 2 }, { playerId: 2, value: 5 }, { playerId: 2, value: 1 }
      ],
      [
        { playerId: 3, value: 6 }, { playerId: 3, value: 1 }, { playerId: 3, value: 3 }, null, null, { playerId: 2, value: 3 }, { playerId: 2, value: 1 }, { playerId: 2, value: 6 }
      ]
    ],
    currentPlayer: 0,
    selectedPiece: null,
    validMoves: [],
    actions: 0,
    gameState: "IN_PROGRESS",
    showTurnMessage: false,
    winner: null,
    numPlayers: 4,
    turnHistory: [
      {
        type: "customMap",
        createdAt: new Date().toISOString()
      }
    ]
  },
  createdAt: new Date().toISOString(),
  timestamp: new Date().toISOString()
};

const TestAutomationPanel = () => {
  const dispatch = useDispatch();

  // Function to load the test scenario and start the tests
  const startAutomatedTest = useCallback(() => {
    try {
      console.log('Loading test scenario:', gameplayTestScenario.id);
      
      // Load the scenario directly from our embedded data
      const gameState = gameplayTestScenario.gameState;
      
      // Log the game state for debugging
      console.log('Loading test game state:', gameState);
      
      // Dispatch the action to load the game state
      dispatch(loadGameState(gameState));
      
      // Wait a bit for the state to update
      setTimeout(() => {
        // Get current Redux store
        const store = window.reduxStore;
        
        if (!store) {
          console.error('Redux store not available globally. Make sure to add store to window.reduxStore in index.js');
          return;
        }
        
        // Import the testing function dynamically to avoid circular dependencies
        import('../utils/aiUtils').then(({ runAutomatedGameTest }) => {
          // Start the automated test
          const runTest = runAutomatedGameTest(store, 1500); // 1.5 seconds between moves
          runTest();
        });
      }, 1000);
    } catch (error) {
      console.error('Error loading test scenario:', error);
      alert('Failed to load test scenario: ' + error.message);
    }
  }, [dispatch]);

  return (
    <div className="test-automation-panel">
      <h3>Game Mechanics Testing</h3>
      <p>
        Run automated tests on the game mechanics using the "Gameplay Test Scenario".
        The tests will validate movement, combat, combining, and base actions.
      </p>
      <button 
        onClick={startAutomatedTest}
        className="btn btn-primary"
      >
        Run Automated Tests
      </button>
      <div className="test-info">
        <small>
          Results will be shown in the browser console (F12).
        </small>
      </div>
    </div>
  );
};

export default TestAutomationPanel;
