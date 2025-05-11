/**
 * Tutorial scenarios for the SixDivides game
 * Provides predefined board states and instructions for the tutorial
 */

// Initial tutorial board setup with minimal pieces for teaching basic movement
export const tutorialBasicMovement = {
  // Using direct 2D array for board structure to match what the game expects
  board: Array(8).fill().map(() => Array(8).fill(null)),
  players: [
    { id: 1, name: "You", color: "blue", isActive: true },
    { id: 2, name: "Opponent", color: "red", isActive: false }
  ],
  units: [
    // Player units (blue)
    { id: "p1-1", playerId: 1, position: { x: 1, y: 3 }, value: 3, isSelected: false },
    { id: "p1-2", playerId: 1, position: { x: 2, y: 5 }, value: 5, isSelected: false },
    // Player base
    { id: "p1-base", playerId: 1, position: { x: 0, y: 0 }, isBase: true, isSelected: false },
    
    // Opponent units (red)
    { id: "p2-1", playerId: 2, position: { x: 5, y: 3 }, value: 2, isSelected: false },
    { id: "p2-2", playerId: 2, position: { x: 6, y: 5 }, value: 4, isSelected: false },
    // Opponent base
    { id: "p2-base", playerId: 2, position: { x: 7, y: 7 }, isBase: true, isSelected: false }
  ],
  turn: 1,
  phase: "MOVE",
  activePlayerId: 1,
  winner: null,
  message: "Tutorial: Select your unit to begin"
};

// Tutorial for teaching attacking mechanics
export const tutorialAttackScenario = {
  // Using direct 2D array for board structure to match what the game expects
  board: Array(8).fill().map(() => Array(8).fill(null)),
  players: [
    { id: 1, name: "You", color: "blue", isActive: true },
    { id: 2, name: "Opponent", color: "red", isActive: false }
  ],
  units: [
    // Player units (blue)
    { id: "p1-1", playerId: 1, position: { x: 4, y: 3 }, value: 5, isSelected: false },
    { id: "p1-2", playerId: 1, position: { x: 2, y: 5 }, value: 3, isSelected: false },
    // Player base
    { id: "p1-base", playerId: 1, position: { x: 0, y: 0 }, isBase: true, isSelected: false },
    
    // Opponent units (red)
    { id: "p2-1", playerId: 2, position: { x: 5, y: 3 }, value: 2, isSelected: false },
    { id: "p2-2", playerId: 2, position: { x: 6, y: 5 }, value: 4, isSelected: false },
    // Opponent base
    { id: "p2-base", playerId: 2, position: { x: 7, y: 7 }, isBase: true, isSelected: false }
  ],
  turn: 1,
  phase: "MOVE",
  activePlayerId: 1,
  winner: null,
  message: "Tutorial: Attacking - Move your 5 to attack the enemy's 2"
};

// Tutorial steps with instructions
export const tutorialSteps = [
  {
    id: 1,
    title: "Welcome to SixDivides!",
    instruction: "This tutorial will guide you through the basic mechanics of the game.",
    highlightPosition: null,
    action: "NEXT"
  },
  {
    id: 2,
    title: "The Board",
    instruction: "The game is played on an 8x8 grid, similar to chess. Each player has units (represented by dice) and a base.",
    highlightPosition: null,
    action: "NEXT"
  },
  {
    id: 3,
    title: "Your Units",
    instruction: "These are your units. The number on each die represents its value. Higher values are stronger.",
    highlightPosition: { x: 1, y: 3 },
    action: "CLICK_UNIT",
    targetUnit: "p1-1"
  },
  {
    id: 4,
    title: "Movement",
    instruction: "Click on one of your units to select it. The highlighted squares show where you can move.",
    highlightPosition: { x: 1, y: 3 },
    action: "SHOW_MOVES",
    targetUnit: "p1-1"
  },
  {
    id: 5,
    title: "Making a Move",
    instruction: "Click on a highlighted square to move your unit there.",
    highlightPosition: { x: 2, y: 3 },
    action: "MOVE_TO",
    targetUnit: "p1-1",
    targetPosition: { x: 2, y: 3 }
  },
  {
    id: 6,
    title: "Attacking",
    instruction: "To attack an enemy, move your unit to their position. Your unit's value must be higher than the enemy's to capture it.",
    highlightPosition: { x: 5, y: 3 },
    action: "NEXT"
  },
  {
    id: 7,
    title: "Try It Yourself",
    instruction: "Select your unit with value 5 and attack the enemy unit with value 2.",
    highlightPosition: { x: 4, y: 3 },
    action: "ATTACK",
    targetUnit: "p1-1",
    targetPosition: { x: 5, y: 3 }
  },
  {
    id: 8,
    title: "Capturing the Base",
    instruction: "The goal is to capture the opponent's base. Move any unit to the enemy base to win.",
    highlightPosition: { x: 7, y: 7 },
    action: "NEXT"
  },
  {
    id: 9,
    title: "End Turn",
    instruction: "After moving, you can end your turn. The opponent will then take their turn.",
    highlightPosition: null,
    action: "END_TURN"
  },
  {
    id: 10,
    title: "Congratulations!",
    instruction: "You've completed the basic tutorial! Ready to play a full game?",
    highlightPosition: null,
    action: "COMPLETE"
  }
];

// Tutorial highlights for the UI
export const tutorialHighlights = {
  UNIT_SELECT: "Select this unit",
  MOVE_HERE: "Move here",
  ATTACK_HERE: "Attack this unit",
  END_TURN: "Click to end your turn",
  BASE: "This is a base. Capture the enemy base to win!"
};

export default {
  tutorialBasicMovement,
  tutorialAttackScenario,
  tutorialSteps,
  tutorialHighlights
};
