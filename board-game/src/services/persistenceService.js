/**
 * Game Persistence Service
 * Handles saving and loading game states
 * Currently uses localStorage, but designed to be extended to use a backend API
 */
import { getScenarioById, getAvailableScenarios, registerScenario } from '../constants/scenarios';

// Helper to serialize game state to a storable format
export const serializeGameState = (gameState) => {
  // Create a clean copy without any Redux/Immer proxies
  return JSON.stringify(gameState);
};

// Helper to deserialize stored game state
export const deserializeGameState = (serializedState) => {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Failed to parse saved game:", error);
    return null;
  }
};

// Save game to localStorage
export const saveGameToLocalStorage = (gameState, saveName) => {
  try {
    const saveKey = `dice-chess-save-${saveName}`;
    const timestamp = new Date().toISOString();
    const saveData = {
      timestamp,
      saveName,
      gameState,
    };
    
    localStorage.setItem(saveKey, serializeGameState(saveData));
    return { success: true, saveKey };
  } catch (error) {
    console.error("Failed to save game:", error);
    return { success: false, error: error.message };
  }
};

// Load game from localStorage
export const loadGameFromLocalStorage = (saveName) => {
  try {
    const saveKey = `dice-chess-save-${saveName}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (!savedData) {
      return { success: false, error: "Save not found" };
    }
    
    const parsedData = deserializeGameState(savedData);
    return { success: true, data: parsedData };
  } catch (error) {
    console.error("Failed to load game:", error);
    return { success: false, error: error.message };
  }
};

// Get all saved games
export const getAllSavedGames = () => {
  try {
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('dice-chess-save-')) {
        const savedData = localStorage.getItem(key);
        const parsedData = deserializeGameState(savedData);
        if (parsedData) {
          saves.push({
            saveName: parsedData.saveName,
            timestamp: parsedData.timestamp,
            key
          });
        }
      }
    }
    
    // Sort by timestamp (newest first)
    saves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return { success: true, saves };
  } catch (error) {
    console.error("Failed to get saved games:", error);
    return { success: false, error: error.message };
  }
};

// Delete a saved game
export const deleteSavedGame = (saveName) => {
  try {
    const saveKey = `dice-chess-save-${saveName}`;
    localStorage.removeItem(saveKey);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete saved game:", error);
    return { success: false, error: error.message };
  }
};

// Mock API service for future implementation
export const persistenceAPI = {
  // Base URL for the future API server
  baseUrl: 'http://localhost:3001/api/games',
  
  // Save game to API
  saveGame: async (gameState, saveName) => {
    // This is a placeholder for future implementation
    console.log('API saveGame called - would save to:', `${persistenceAPI.baseUrl}/${saveName}`);
    
    // For now, just save to localStorage
    return saveGameToLocalStorage(gameState, saveName);
  },
  
  // Load game from API
  loadGame: async (saveName) => {
    // This is a placeholder for future implementation
    console.log('API loadGame called - would load from:', `${persistenceAPI.baseUrl}/${saveName}`);
    
    // For now, just load from localStorage
    return loadGameFromLocalStorage(saveName);
  },
  
  // Get list of saved games from API
  getSavedGames: async () => {
    // This is a placeholder for future implementation
    console.log('API getSavedGames called - would fetch from:', persistenceAPI.baseUrl);
    
    // For now, just get from localStorage
    return getAllSavedGames();
  },
  
  // Delete saved game from API
  deleteSavedGame: async (saveName) => {
    // This is a placeholder for future implementation
    console.log('API deleteSavedGame called - would delete from:', `${persistenceAPI.baseUrl}/${saveName}`);
    
    // For now, just delete from localStorage
    return deleteSavedGame(saveName);
  },
  
  // Get available predefined scenarios
  getScenarios: async () => {
    // Return predefined scenarios from constants
    return { success: true, scenarios: getAvailableScenarios() };
  },
  
  // Load a specific scenario by ID
  loadScenario: async (scenarioId) => {
    try {
      const scenario = getScenarioById(scenarioId);
      if (!scenario) {
        return { success: false, error: "Scenario not found" };
      }
      
      // Log the scenario data for debugging
      console.log('Found scenario:', scenarioId, scenario);
      
      // Make sure gameState contains the board
      if (!scenario.gameState || !scenario.gameState.board) {
        console.error('Scenario missing board data:', scenario);
        return { success: false, error: "Invalid scenario data: missing board" };
      }
      
      // For debugging, log the board structure
      console.log('Scenario board:', scenario.gameState.board);
      
      return { 
        success: true, 
        data: {
          // Include the complete game state directly
          gameState: scenario.gameState,
          saveName: `scenario-${scenarioId}`,
          timestamp: new Date().toISOString(),
          isScenario: true
        } 
      };
    } catch (error) {
      console.error("Failed to load scenario:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Save a new scenario (in a real app, this would be server-side)
  saveScenario: async (scenario) => {
    try {
      // In a real implementation, this would be a server API request
      // For now, we'll register it to our runtime scenarios
      console.log('saveScenario called - would save scenario to a server database:', scenario);
      
      // Register the scenario with our runtime registry
      registerScenario(scenario);
      
      // Simulate server response
      return { 
        success: true, 
        message: 'Scenario saved successfully! (Please note: in this demo, scenarios are not permanently saved and will be available only until the page is reloaded.)'
      };
      
      /* In a real implementation with a server, we'd do something like:
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save scenario to server');
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error('Error saving scenario:', error);
      return { success: false, error: error.message };
    }
  }
};
