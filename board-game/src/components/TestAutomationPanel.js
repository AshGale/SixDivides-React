import React, { useCallback, useState } from 'react';
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
  const [refreshInProgress, setRefreshInProgress] = useState(false);

  /**
   * Helper function to force a fresh reload and clear cache
   */
  const forceRefresh = async (callback) => {
    // Clear any cached data
    try {
      setRefreshInProgress(true);
      console.log("Starting cache clearing and refresh process");
      
      if (window.caches) {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames.map(name => window.caches.delete(name))
        );
        console.log("Cache cleared successfully");
      }
      
      // Clear localStorage test data
      localStorage.removeItem('testResults');
      localStorage.removeItem('testScenario');
      console.log("LocalStorage test data cleared");
      
      // Execute callback after clearing
      if (callback) {
        setTimeout(() => {
          console.log("Executing post-refresh callback");
          callback();
          setRefreshInProgress(false);
        }, 100);
      } else {
        setRefreshInProgress(false);
      }
    } catch (err) {
      console.error("Error clearing cache:", err);
      // Try callback anyway if clearing fails
      if (callback) {
        callback();
      }
      setRefreshInProgress(false);
    }
  };

  /**
   * Function to fully refresh the app and clear all caches
   */
  const fullRefresh = () => {
    setRefreshInProgress(true);
    console.log("Performing full application refresh");
    
    // Clear Redux state
    dispatch({ type: 'game/resetGame' });
    
    // Clear caches and reload window
    forceRefresh(() => {
      console.log("About to reload window");
      window.location.reload(true); // Force reload from server
    });
  };

  // Function to load the test scenario and start the tests
  const startAutomatedTest = useCallback(() => {
    try {
      console.log('Loading test scenario:', gameplayTestScenario.id);
      
      // Force refresh before starting tests
      forceRefresh(() => {
        // Load the scenario directly from our embedded data
        const gameState = gameplayTestScenario.gameState;
        
        // Reset any game state
        dispatch({ type: 'game/resetGame' });
        
        // Wait for reset to complete
        setTimeout(() => {
          // Log the game state for debugging
          console.log('Loading test game state with fresh data:', gameState);
          
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
        }, 500);
      });
    } catch (error) {
      console.error('Error loading test scenario:', error);
      alert('Failed to load test scenario: ' + error.message);
    }
  }, [dispatch]);

  return (
    <div className="test-automation-panel">
      <h3>Automated Testing</h3>
      <div className="test-controls">
        <button 
          onClick={startAutomatedTest}
          disabled={refreshInProgress}
          className="btn btn-primary">
          Run Tests
        </button>
        <button 
          onClick={fullRefresh}
          disabled={refreshInProgress}
          className="btn btn-warning ml-2">
          Full Refresh
        </button>
      </div>
      <div className="test-status">
        {refreshInProgress && <p><strong>Refreshing...</strong> Please wait while caches are cleared and the application reloads.</p>}
      </div>
    </div>
  );
};

export default TestAutomationPanel;
