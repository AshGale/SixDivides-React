import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { persistenceAPI } from '../services/persistenceService';
import { loadGameState } from '../store/gameSlice';
import './ScenariosPage.css';

const ScenariosPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  
  // Load available scenarios on mount
  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await persistenceAPI.getScenarios();
        if (result.success && result.scenarios) {
          setScenarios(result.scenarios);
        } else {
          throw new Error('Failed to load scenarios');
        }
      } catch (err) {
        console.error('Error loading scenarios:', err);
        setError('Failed to load scenarios. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchScenarios();
  }, []);
  
  // Handle scenario selection
  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
  };
  
  // Handle scenario load
  const handleLoadScenario = async () => {
    if (!selectedScenario) return;
    
    try {
      console.log('Loading scenario:', selectedScenario.id);
      setError(null);
      
      // Load the selected scenario
      const result = await persistenceAPI.loadScenario(selectedScenario.id);
      console.log('Load scenario result:', result);
      
      if (result.success && result.data && result.data.gameState) {
        // Log the game state for debugging
        console.log('Loaded game state:', result.data.gameState);
        
        // Make sure we have a valid board
        if (!result.data.gameState.board) {
          throw new Error('Loaded scenario has no board data');
        }
        
        // Direct approach: load game state from the scenario into Redux
        dispatch(loadGameState(result.data.gameState));
        
        // Navigate to the game page
        navigate('/game');
      } else {
        const errorMessage = result.error || 'Failed to load scenario';
        console.error('Error in scenario data:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
      setError(`Failed to load scenario: ${error.message}`);
    }
  };
  
  // Return to home
  const handleBack = () => {
    navigate('/');
  };
  
  return (
    <div className="scenarios-page">
      <h1 className="page-title">Scenario Maps</h1>
      <p className="scenarios-description">
        Select a predefined scenario to play. These maps are available to all players.
      </p>
      
      {loading ? (
        <div className="loading-spinner">Loading scenarios...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="scenarios-list">
          {scenarios.length === 0 ? (
            <div className="no-scenarios">
              <p>No scenarios available. Create some in the Map Editor!</p>
            </div>
          ) : (
            scenarios.map((scenario) => (
              <div 
                key={scenario.id} 
                className={`scenario-item ${selectedScenario?.id === scenario.id ? 'selected' : ''}`}
                onClick={() => handleScenarioSelect(scenario)}
              >
                <div className="scenario-details">
                  <h3 className="scenario-name">{scenario.name}</h3>
                  <p className="scenario-description">{scenario.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      <div className="scenarios-actions">
        <button 
          className="btn-primary" 
          onClick={handleLoadScenario} 
          disabled={!selectedScenario}
        >
          Load Scenario
        </button>
        <button className="btn-secondary" onClick={handleBack}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ScenariosPage;
