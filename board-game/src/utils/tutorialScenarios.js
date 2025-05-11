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
    { id: "p1-1", playerId: 1, position: { x: 1, y: 4 }, value: 3, isSelected: false },
    { id: "p1-2", playerId: 1, position: { x: 3, y: 6 }, value: 5, isSelected: false },
    // Player base
    { id: "p1-base", playerId: 1, position: { x: 0, y: 0 }, isBase: true, isSelected: false },
    
    // Opponent units (red)
    { id: "p2-1", playerId: 2, position: { x: 5, y: 4 }, value: 2, isSelected: false },
    { id: "p2-2", playerId: 2, position: { x: 6, y: 6 }, value: 4, isSelected: false },
    // Opponent base
    { id: "p2-base", playerId: 2, position: { x: 7, y: 7 }, isBase: true, value: 6, isSelected: false }
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
    { id: "p1-base", playerId: 1, position: { x: 0, y: 0 }, isBase: true, value: 6, isSelected: false },
    
    // Opponent units (red)
    { id: "p2-1", playerId: 2, position: { x: 5, y: 3 }, value: 2, isSelected: false },
    { id: "p2-2", playerId: 2, position: { x: 6, y: 5 }, value: 4, isSelected: false },
    // Opponent base
    { id: "p2-base", playerId: 2, position: { x: 7, y: 7 }, isBase: true, value: 6, isSelected: false }
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
    instruction: "The game is played on an 8x8 grid. Each player starts with a base (value 6) at their designated position.",
    highlightPosition: null,
    action: "NEXT"
  },
  {
    id: 3,
    title: "Unit Types",
    instruction: "Units have different roles based on their value:\n• Workers (1,3,5): Can only move (1,2,3 actions)\n• Soldiers (2,4): Can move & attack (0 actions)\n• Base (6): Stationary, has 3 actions, can create/upgrade/attack",
    highlightPosition: null,
    action: "NEXT"
  },
  {
    id: 4,
    title: "Your Units",
    instruction: "These are your units. The number on each die represents its value. This unit is a Super Worker (value 3) with 2 actions.",
    highlightPosition: { x: 1, y: 4 },
    action: "CLICK_UNIT",
    targetUnit: "p1-1"
  },
  {
    id: 5,
    title: "Movement",
    instruction: "Click on one of your units to select it. The highlighted squares show where you can move.",
    highlightPosition: { x: 1, y: 4 },
    action: "SHOW_MOVES",
    targetUnit: "p1-1"
  },
  {
    id: 6,
    title: "Making a Move",
    instruction: "Click on a highlighted square to move your unit there.",
    highlightPosition: { x: 2, y: 4 },
    action: "MOVE_TO",
    targetUnit: "p1-1",
    targetPosition: { x: 2, y: 4 }
  },
  {
    id: 7,
    title: "Combat System",
    instruction: "Combat rules:\n• Attacker > Defender: Defender removed, attacker's value reduced by defender's value\n• Attacker < Defender: Attacker destroyed, defender's value reduced by attacker's value\n• Equal Values: Both units destroyed",
    highlightPosition: null,
    action: "NEXT"
  },
  {
    id: 8,
    title: "Try Attacking",
    instruction: "Select your Elite Worker (value 5) and attack the enemy Soldier (value 2). Your unit will win and be reduced to value 3.",
    highlightPosition: { x: 3, y: 6 },
    action: "ATTACK",
    targetUnit: "p1-2",
    targetPosition: { x: 5, y: 4 }
  },
  {
    id: 9,
    title: "Unit Combining",
    instruction: "Units can be combined by moving onto friendly units:\n• Combined ≤ 6: Sum values, place on target tile\n• Combined > 6: Target becomes 6, source keeps remainder\n• Example: 4+4=8 results in a 6 and a 2",
    highlightPosition: null,
    action: "NEXT"
  },
  {
    id: 10,
    title: "Base Actions",
    instruction: "Bases (value 6) are crucial:\n• Create new units adjacent to the base\n• Upgrade adjacent friendly units (+1 up to 6)\n• Reduce enemy units (-1)",
    highlightPosition: null,
    action: "NEXT"
  },
  {
    id: 11,
    title: "Winning the Game",
    instruction: "The last player with units remaining on the board wins the game. Eliminate all enemy units to win!",
    highlightPosition: { x: 7, y: 7 },
    action: "NEXT"
  },
  {
    id: 12,
    title: "End Turn",
    instruction: "After using all your actions, you can end your turn. The opponent will then take their turn.",
    highlightPosition: null,
    action: "END_TURN"
  },
  {
    id: 13,
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
  BASE: "This is a base (value 6). It can create, upgrade and attack!",
  COMBINE: "Move here to combine units"
};

export default {
  tutorialBasicMovement,
  tutorialAttackScenario,
  tutorialSteps,
  tutorialHighlights
};
