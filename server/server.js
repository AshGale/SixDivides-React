const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create the scenarios file if it doesn't exist
const scenariosFile = path.join(dataDir, 'scenarios.json');
if (!fs.existsSync(scenariosFile)) {
  fs.writeFileSync(scenariosFile, JSON.stringify({ scenarios: [] }));
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// API Routes
const apiRouter = express.Router();

// Get all scenarios
apiRouter.get('/scenarios', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(scenariosFile, 'utf8'));
    res.json({ success: true, scenarios: data.scenarios });
  } catch (error) {
    console.error('Error getting scenarios:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get scenario by ID
apiRouter.get('/scenarios/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(scenariosFile, 'utf8'));
    const scenario = data.scenarios.find(s => s.id === id);
    
    if (!scenario) {
      return res.status(404).json({ success: false, error: 'Scenario not found' });
    }
    
    res.json({ success: true, data: {
      gameState: scenario.gameState,
      saveName: `scenario-${id}`,
      timestamp: scenario.timestamp || new Date().toISOString(),
      isScenario: true
    }});
  } catch (error) {
    console.error('Error getting scenario:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save a new scenario
apiRouter.post('/scenarios', (req, res) => {
  try {
    const scenario = req.body;
    
    // Validate the scenario
    if (!scenario || !scenario.name || !scenario.gameState || !scenario.gameState.board) {
      return res.status(400).json({ success: false, error: 'Invalid scenario data' });
    }
    
    // Generate a unique ID if not provided
    if (!scenario.id) {
      scenario.id = `custom-${Date.now()}`;
    }
    
    // Add timestamp if not provided
    if (!scenario.timestamp) {
      scenario.timestamp = new Date().toISOString();
    }
    
    // Read existing scenarios
    const data = JSON.parse(fs.readFileSync(scenariosFile, 'utf8'));
    
    // Check if scenario with same ID already exists
    const existingIndex = data.scenarios.findIndex(s => s.id === scenario.id);
    
    if (existingIndex >= 0) {
      // Update existing scenario
      data.scenarios[existingIndex] = scenario;
    } else {
      // Add new scenario
      data.scenarios.push(scenario);
    }
    
    // Save the updated data
    fs.writeFileSync(scenariosFile, JSON.stringify(data, null, 2));
    
    res.json({ success: true, scenario });
  } catch (error) {
    console.error('Error saving scenario:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a scenario
apiRouter.delete('/scenarios/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(scenariosFile, 'utf8'));
    
    // Filter out the scenario to delete
    data.scenarios = data.scenarios.filter(s => s.id !== id);
    
    // Save the updated data
    fs.writeFileSync(scenariosFile, JSON.stringify(data, null, 2));
    
    res.json({ success: true, message: 'Scenario deleted successfully' });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mount the API router
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
