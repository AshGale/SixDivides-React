/**
 * Game Thunks - Redux async actions for game state
 * Handles async operations for saving and loading games
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  saveGameState, 
  loadGameState,
  setAvailableSaves,
  clearSaveLoadStatus 
} from './gameSlice';
import { 
  persistenceAPI, 
  serializeGameState, 
  deserializeGameState 
} from '../services/persistenceService';
import { setPlayerName } from './playerSlice';
import { setPlayerType } from './aiSlice';

// Save game thunk
export const saveGame = createAsyncThunk(
  'game/saveGame',
  async ({ saveName }, { dispatch, getState }) => {
    try {
      // Get current game state
      const state = getState();
      const gameState = state.game;
      
      // Get player data
      const playerData = {
        playerNames: state.player.playerNames,
        aiPlayers: state.ai.aiPlayers
      };
      
      // Save game state with player data
      const result = await persistenceAPI.saveGame(gameState, saveName, playerData);
      
      // Update UI with save status
      dispatch(saveGameState({ 
        success: result.success, 
        message: result.success ? `Game saved as "${saveName}"` : `Save failed: ${result.error}` 
      }));
      
      // Clear status after 3 seconds
      setTimeout(() => {
        dispatch(clearSaveLoadStatus());
      }, 3000);
      
      // Refresh list of available saves
      dispatch(fetchSavedGames());
      
      return result;
    } catch (error) {
      dispatch(saveGameState({ 
        success: false, 
        message: `Save failed: ${error.message}` 
      }));
      throw error;
    }
  }
);

// Load game thunk
export const loadGame = createAsyncThunk(
  'game/loadGame',
  async ({ saveName, customSettings = false }, { dispatch, getState }) => {
    try {
      // Load game state
      const result = await persistenceAPI.loadGame(saveName);
      
      if (result.success && result.data) {
        // Extract the game state - could be in result.data.gameState (new format)
        // or directly in result.data (old format)
        const gameState = result.data.gameState || result.data;
        
        // Extract player data if available
        const playerData = result.data.playerData;
        
        if (gameState) {
          // Dispatch action to load game state
          dispatch(loadGameState(gameState));
          
          // If not using custom settings, restore player names and AI settings from save
          if (!customSettings && playerData) {
            // Restore player names
            if (playerData.playerNames) {
              Object.entries(playerData.playerNames).forEach(([playerId, name]) => {
                dispatch(setPlayerName({
                  playerId: Number(playerId),
                  name
                }));
              });
            }
            
            // Restore AI settings
            if (playerData.aiPlayers) {
              Object.entries(playerData.aiPlayers).forEach(([playerId, type]) => {
                dispatch(setPlayerType({
                  playerId: Number(playerId),
                  type
                }));
              });
            }
          }
          
          // Clear status after 3 seconds
          setTimeout(() => {
            dispatch(clearSaveLoadStatus());
          }, 3000);
          
          return gameState;
        }
      }
      
      // Handle load failure
      dispatch(loadGameState(null));
      return null;
    } catch (error) {
      dispatch(loadGameState(null));
      throw error;
    }
  }
);

// Fetch saved games thunk
export const fetchSavedGames = createAsyncThunk(
  'game/fetchSavedGames',
  async (_, { dispatch }) => {
    try {
      // Get all saved games
      const result = await persistenceAPI.getSavedGames();
      
      if (result.success) {
        // Dispatch action to update available saves
        dispatch(setAvailableSaves(result.saves || []));
        return result.saves;
      } else {
        dispatch(setAvailableSaves([]));
        return [];
      }
    } catch (error) {
      dispatch(setAvailableSaves([]));
      throw error;
    }
  }
);

// Delete saved game thunk
export const deleteSavedGame = createAsyncThunk(
  'game/deleteSavedGame',
  async ({ saveName }, { dispatch }) => {
    try {
      // Delete saved game
      const result = await persistenceAPI.deleteSavedGame(saveName);
      
      // Refresh list of available saves
      if (result.success) {
        dispatch(fetchSavedGames());
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }
);
