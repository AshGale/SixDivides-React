/**
 * Game constants for the Dice Chess Game
 */

// Player definitions
export const PLAYERS = [
  { id: 0, color: 'red', name: 'Red' },
  { id: 1, color: 'blue', name: 'Blue' },
  { id: 2, color: 'green', name: 'Green' },
  { id: 3, color: 'yellow', name: 'Yellow' },
];

// Unit type definitions
export const UNIT_TYPES = {
  1: { name: 'Worker', actions: 1, canMove: true, canAttack: false },
  2: { name: 'Soldier', actions: 0, canMove: true, canAttack: true },
  3: { name: 'Super Worker', actions: 2, canMove: true, canAttack: false },
  4: { name: 'Super Soldier', actions: 0, canMove: true, canAttack: true },
  5: { name: 'Elite Worker', actions: 3, canMove: true, canAttack: false },
  6: { name: 'Base', actions: 3, canMove: false, canAttack: true },
};

// Starting positions: D3, F4, E6, C5 (converted to 0-based indices)
export const STARTING_POSITIONS = [
  [5, 3], // D3
  [4, 5], // F4
  [2, 4], // E6
  [3, 2], // C5
];

// Board dimensions
export const BOARD_SIZE = 8;

// Game states
export const GAME_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
};

// Action types
export const ACTION_TYPES = {
  MOVE: 'move',
  ATTACK: 'attack',
  CREATE: 'create',
  UPGRADE: 'upgrade',
  COMBINE: 'combine',
};
