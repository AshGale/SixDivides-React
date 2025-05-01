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
    const parsed = JSON.parse(serializedState);
    
    // Clean up redundant 'actions' property in cells if it exists
    if (parsed.gameState && parsed.gameState.board) {
      parsed.gameState.board = parsed.gameState.board.map(row => 
        row.map(cell => {
          if (cell && cell.hasOwnProperty('actions')) {
            const { actions, ...cellWithoutActions } = cell;
            return cellWithoutActions;
          }
          return cell;
        })
      );
    }
    
    return parsed;
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
  // Base URL for the API server
  baseUrl: 'http://localhost:3001/api',
  
  // Save game to API
  saveGame: async (gameState, saveName) => {
    // This is a placeholder for future implementation
    console.log('API saveGame called - would save to:', `${persistenceAPI.baseUrl}/games/${saveName}`);
    
    // For now, just save to localStorage
    return saveGameToLocalStorage(gameState, saveName);
  },
  
  // Load game from API
  loadGame: async (saveName) => {
    // This is a placeholder for future implementation
    console.log('API loadGame called - would load from:', `${persistenceAPI.baseUrl}/games/${saveName}`);
    
    // For now, just load from localStorage
    return loadGameFromLocalStorage(saveName);
  },
  
  // Get list of saved games from API
  getSavedGames: async () => {
    // This is a placeholder for future implementation
    console.log('API getSavedGames called - would fetch from:', `${persistenceAPI.baseUrl}/games`);
    
    // For now, just get from localStorage
    return getAllSavedGames();
  },
  
  // Delete saved game from API
  deleteSavedGame: async (saveName) => {
    // This is a placeholder for future implementation
    console.log('API deleteSavedGame called - would delete from:', `${persistenceAPI.baseUrl}/games/${saveName}`);
    
    // For now, just delete from localStorage
    return deleteSavedGame(saveName);
  },
  
  // Get available scenarios
  getScenarios: async () => {
    try {
      // Use the actual API endpoint to get scenarios
      const response = await fetch(`${persistenceAPI.baseUrl}/scenarios`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      
      // Fallback to local scenarios if API fails
      return { success: true, scenarios: getAvailableScenarios() };
    }
  },
  
  // Load a specific scenario by ID
  loadScenario: async (scenarioId) => {
    try {
      // Use the actual API endpoint to get a specific scenario
      const response = await fetch(`${persistenceAPI.baseUrl}/scenarios/${scenarioId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scenario ${scenarioId}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to load scenario from API:", error);
      
      // Fallback to local scenario if API fails
      try {
        const scenario = getScenarioById(scenarioId);
        if (!scenario) {
          return { success: false, error: "Scenario not found" };
        }
        
        // Log the scenario data for debugging
        console.log('Found local scenario:', scenarioId, scenario);
        
        // Make sure gameState contains the board
        if (!scenario.gameState || !scenario.gameState.board) {
          console.error('Scenario missing board data:', scenario);
          return { success: false, error: "Invalid scenario data: missing board" };
        }
        
        // Make sure we remove the setupFunction from the gameState
        const gameState = { ...scenario.gameState };
        delete gameState.setupFunction;
        
        return { 
          success: true, 
          data: {
            gameState,
            saveName: `scenario-${scenarioId}`,
            timestamp: new Date().toISOString(),
            isScenario: true
          } 
        };
      } catch (error) {
        console.error("Failed to load local scenario:", error);
        return { success: false, error: error.message };
      }
    }
  },
  
  // Save a new scenario
  saveScenario: async (scenario) => {
    try {
      // Send the scenario to the server API
      const response = await fetch(`${persistenceAPI.baseUrl}/scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save scenario: ${response.statusText}`);
      }
      
      // Get the server response
      const result = await response.json();
      
      // Also register locally for immediate use
      registerScenario(scenario);
      
      return { 
        success: true, 
        message: 'Scenario saved successfully! It is now available to all users.',
        scenario: result.scenario
      };
    } catch (error) {
      console.error('Error saving scenario:', error);
      
      // Fallback to local registration
      try {
        // Register the scenario with our runtime registry
        registerScenario(scenario);
        
        return { 
          success: true, 
          message: 'Scenario saved locally but failed to save to server. It will only be available in this session.',
          error: error.message
        };
      } catch (localError) {
        return { success: false, error: localError.message };
      }
    }
  },
  
  // Delete a scenario
  deleteScenario: async (scenarioId) => {
    try {
      // Delete the scenario from the server API
      const response = await fetch(`${persistenceAPI.baseUrl}/scenarios/${scenarioId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete scenario: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting scenario:', error);
      return { success: false, error: error.message };
    }
  }
};
