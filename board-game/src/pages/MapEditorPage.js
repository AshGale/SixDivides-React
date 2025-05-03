import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PLAYERS, UNIT_TYPES, BOARD_SIZE } from '../constants/gameConstants';
import { createEmptyBoard } from '../logic/boardUtils';
import { setAvailableSaves } from '../store/gameSlice';
import { saveGameToLocalStorage, getAllSavedGames, loadGameFromLocalStorage, persistenceAPI } from '../services/persistenceService';
import './MapEditorPage.css';

const MapEditorPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State
  const [board, setBoard] = useState(createEmptyBoard());
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [selectedDiceValue, setSelectedDiceValue] = useState(1);
  const [mapName, setMapName] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [availableMaps, setAvailableMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [actionsRemaining, setActionsRemaining] = useState(3);
  const [saveAsScenario, setSaveAsScenario] = useState(false);
  
  // Load available maps on mount
  useEffect(() => {
    loadAvailableMaps();
  }, []);
  
  // Get available players based on constants
  const availablePlayers = PLAYERS.slice(0, 4);
  
  // Get unit types from constants
  const diceOptions = Object.entries(UNIT_TYPES).map(([value, details]) => ({
    value: parseInt(value),
    name: details.name
  }));
  
  // Load available maps
  const loadAvailableMaps = () => {
    const saveResult = getAllSavedGames();
    if (saveResult.success) {
      // Filter for maps that start with custom-map-
      const maps = saveResult.saves.filter(save => 
        save.saveName.startsWith('custom-map-')
      );
      setAvailableMaps(maps);
    }
  };
  
  // Handle cell click - place or remove a unit
  const handleCellClick = (row, col) => {
    const newBoard = [...board];
    const currentCell = newBoard[row][col];
    
    // If cell already has a unit of this player, remove it
    if (currentCell && (currentCell.playerId === selectedPlayer || currentCell.player === selectedPlayer)) {
      newBoard[row][col] = null;
    } 
    // Otherwise place the selected dice
    else {
      newBoard[row][col] = {
        playerId: selectedPlayer, 
        value: selectedDiceValue
      };
    }
    
    setBoard(newBoard);
  };
  
  // Save the custom map
  const saveMap = () => {
    if (!mapName.trim()) {
      setSaveStatus({ success: false, message: 'Please enter a map name' });
      return;
    }
    
    // Create a game state that can be loaded
    const customMapState = {
      board: board,
      currentPlayer: currentPlayer,
      selectedPiece: null,
      validMoves: [],
      actions: actionsRemaining,
      gameState: 'NOT_STARTED',
      showTurnMessage: false,
      winner: null,
      numPlayers: 4,
      turnHistory: [{ type: 'customMap', createdAt: new Date().toISOString() }],
    };
    
    // If saving as scenario, add to scenarios
    if (saveAsScenario) {
      if (!mapDescription.trim()) {
        setSaveStatus({ success: false, message: 'Please enter a map description for the scenario' });
        return;
      }
      
      // Convert the map to a scenario format and save it
      const scenarioId = mapName.toLowerCase().replace(/\s+/g, '-');
      
      const newScenario = {
        id: scenarioId,
        name: mapName,
        description: mapDescription,
        gameState: customMapState, // Already includes the board
        createdAt: new Date().toISOString()
      };
      
      // Add scenario to constants/scenarios.js
      persistenceAPI.saveScenario(newScenario)
        .then(result => {
          if (result.success) {
            setSaveStatus({ success: true, message: result.message || 'Scenario saved successfully for all users' });
          } else {
            setSaveStatus({ success: false, message: `Failed to save scenario: ${result.error}` });
          }
        })
        .catch(error => {
          setSaveStatus({ success: false, message: `Error saving scenario: ${error.message}` });
        });
    } 
    // Regular local save
    else {
      // Save to localStorage with a custom prefix
      const saveName = `custom-map-${mapName}`;
      const result = saveGameToLocalStorage(customMapState, saveName);
      
      if (result.success) {
        setSaveStatus({ success: true, message: 'Map saved successfully' });
        
        // Update available saves in Redux
        const saveResult = getAllSavedGames();
        if (saveResult.success) {
          dispatch(setAvailableSaves(saveResult.saves));
          loadAvailableMaps(); 
        }
      } else {
        setSaveStatus({ success: false, message: 'Failed to save map' });
      }
    }
  };
  
  // Clear the board
  const clearBoard = () => {
    setBoard(createEmptyBoard());
  };
  
  // Return to home
  const handleCancel = () => {
    navigate('/');
  };
  
  // Open load modal
  const openLoadModal = () => {
    loadAvailableMaps(); 
    setLoadModalOpen(true);
  };
  
  // Close load modal
  const closeLoadModal = () => {
    setLoadModalOpen(false);
    setSelectedMap(null);
  };
  
  // Validate and sanitize player data in board cells
  const sanitizeBoard = (board) => {
    const newBoard = [...board];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = newBoard[i][j];
        if (cell) {
          // Convert player to playerId if needed
          if (cell.player !== undefined && cell.playerId === undefined) {
            cell.playerId = cell.player;
            delete cell.player;
          }
          
          // Ensure playerId is valid (0-3)
          if (cell.playerId < 0 || cell.playerId > 3 || cell.playerId === undefined) {
            cell.playerId = 0; 
          }
          
          // Ensure value is valid (1-6)
          if (!UNIT_TYPES[cell.value]) {
            cell.value = 1; 
          }
          
          // Remove redundant actions property if it exists
          if (cell.hasOwnProperty('actions')) {
            delete cell.actions;
          }
        }
      }
    }
    return newBoard;
  };
  
  // Load selected map
  const handleLoadMap = () => {
    if (!selectedMap) {
      setSaveStatus({ success: false, message: 'Please select a map first' });
      return;
    }
    
    const result = loadGameFromLocalStorage(selectedMap.saveName);
    
    if (result.success && result.data) {
      try {
        // The structure could be either result.data.gameState (if it's from the main game)
        // or just result.data (if it's a directly saved map)
        const gameData = result.data.gameState || result.data;
        
        if (gameData && gameData.board) {
          // Sanitize the board data to ensure player IDs are valid
          const sanitizedBoard = sanitizeBoard(gameData.board);
          setBoard(sanitizedBoard);
          
          // Set current player and actions if available in loaded data
          if (gameData.currentPlayer !== undefined) {
            setCurrentPlayer(gameData.currentPlayer);
          }
          
          if (gameData.actions !== undefined) {
            setActionsRemaining(gameData.actions);
          }
          
          // Set map name (remove the prefix)
          const actualName = selectedMap.saveName.replace('custom-map-', '');
          setMapName(actualName);
          
          setSaveStatus({ success: true, message: 'Map loaded successfully' });
          closeLoadModal();
        } else {
          setSaveStatus({ success: false, message: 'Invalid map data format' });
        }
      } catch (error) {
        console.error('Error loading map:', error);
        setSaveStatus({ success: false, message: `Error loading map: ${error.message}` });
      }
    } else {
      setSaveStatus({ success: false, message: 'Failed to load map' });
    }
  };
  
  // Render a board cell
  const renderBoardCell = (row, col) => {
    const cell = board[row][col];
    const cellKey = `cell-${row}-${col}`;
    
    const cellContent = cell ? (
      <div 
        className={`dice player-${getPlayerColor(cell)}`}
        data-value={cell.value}
      >
        {cell.value}
      </div>
    ) : null;
    
    return (
      <div 
        key={cellKey}
        className="board-cell"
        onClick={() => handleCellClick(row, col)}
      >
        {cellContent}
      </div>
    );
  };
  
  // Helper to get player color, handling both player and playerId fields
  const getPlayerColor = (cell) => {
    const id = cell.playerId !== undefined ? cell.playerId : cell.player;
    if (id !== undefined && id >= 0 && id < PLAYERS.length) {
      return PLAYERS[id].color;
    }
    return 'red'; 
  };
  
  // Render the board
  const renderBoard = () => {
    const rows = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const row = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        row.push(renderBoardCell(i, j));
      }
      rows.push(<div key={`row-${i}`} className="board-row">{row}</div>);
    }
    return <div className="editor-board">{rows}</div>;
  };
  
  return (
    <div className="map-editor-page">
      <h1>Custom Map Editor</h1>
      
      <div className="editor-container">
        <div className="editor-controls">
          <div className="control-section">
            <h3>Map Name</h3>
            <input 
              type="text" 
              value={mapName} 
              onChange={(e) => setMapName(e.target.value)}
              placeholder="Enter map name..."
              className="map-name-input"
            />
          </div>
          
          <div className="control-section">
            <h3>Map Description</h3>
            <textarea 
              value={mapDescription} 
              onChange={(e) => setMapDescription(e.target.value)}
              placeholder="Enter map description (required for scenarios)..."
              className="map-description-input"
              disabled={!saveAsScenario}
            />
            
            <div className="scenario-option">
              <label>
                <input 
                  type="checkbox" 
                  checked={saveAsScenario} 
                  onChange={(e) => setSaveAsScenario(e.target.checked)} 
                />
                Save as global scenario (available to all users)
              </label>
            </div>
          </div>
          
          <div className="control-section">
            <h3>Game Settings</h3>
            <div className="game-settings">
              <div className="setting-group">
                <label>Starting Player:</label>
                <select 
                  value={currentPlayer}
                  onChange={(e) => setCurrentPlayer(Number(e.target.value))}
                  className="setting-select"
                >
                  {availablePlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="setting-group">
                <label>Actions Remaining:</label>
                <input 
                  type="number" 
                  min="0" 
                  max="10"
                  value={actionsRemaining}
                  onChange={(e) => setActionsRemaining(Number(e.target.value))}
                  className="setting-input"
                />
              </div>
            </div>
          </div>
          
          <div className="control-section">
            <h3>Select Player</h3>
            <div className="player-buttons">
              {availablePlayers.map(player => (
                <button 
                  key={player.id}
                  className={`player-button ${selectedPlayer === player.id ? 'selected' : ''} player-${player.color}`}
                  onClick={() => setSelectedPlayer(player.id)}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="control-section">
            <h3>Select Unit Type</h3>
            <div className="dice-options">
              {diceOptions.map(dice => (
                <button 
                  key={dice.value}
                  className={`dice-option ${selectedDiceValue === dice.value ? 'selected' : ''}`}
                  onClick={() => setSelectedDiceValue(dice.value)}
                >
                  {dice.value} - {dice.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="editor-actions">
            <button className="editor-button primary-button" onClick={saveMap}>
              {saveAsScenario ? 'Save as Scenario' : 'Save Custom Map'}
            </button>
            <button className="editor-button secondary-button" onClick={openLoadModal}>
              Load Existing Map
            </button>
            <button className="editor-button secondary-button" onClick={clearBoard}>
              Clear Board
            </button>
            <button className="editor-button cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
          
          {saveStatus && (
            <div className={`save-status ${saveStatus.success ? 'success' : 'error'}`}>
              {saveStatus.message}
            </div>
          )}
        </div>
        
        <div className="editor-board-container">
          <h3>Map Layout</h3>
          <p className="editor-instructions">
            Click on a cell to place selected unit. Click again to remove it.
          </p>
          {renderBoard()}
        </div>
      </div>
      
      {/* Load Map Modal */}
      {loadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content load-modal">
            <h2>Load Custom Map</h2>
            
            <div className="modal-body">
              {availableMaps.length === 0 ? (
                <div className="no-maps">No custom maps found</div>
              ) : (
                <div className="maps-list">
                  {availableMaps.map((map) => (
                    <div 
                      key={map.key} 
                      className={`map-item ${selectedMap && selectedMap.key === map.key ? 'selected' : ''}`}
                      onClick={() => setSelectedMap(map)}
                    >
                      <div className="map-details">
                        <div className="map-name">{map.saveName.replace('custom-map-', '')}</div>
                        <div className="map-timestamp">
                          {new Date(map.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={closeLoadModal}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleLoadMap}
                disabled={!selectedMap}
              >
                Load Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapEditorPage;
