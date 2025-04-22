/**
 * Game Persistence Service
 * Handles saving and loading game states
 * Currently uses localStorage, but designed to be extended to use a backend API
 */

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
  }
};
