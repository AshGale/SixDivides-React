import React from 'react';
import { PLAYERS } from '../../constants/gameConstants';

/**
 * BoardCell component represents a single cell on the game board
 */
const BoardCell = ({ 
  row, 
  col, 
  cell, 
  className, 
  onClick 
}) => {
  return (
    <div
      className={`board-cell ${className}`}
      onClick={() => onClick(row, col)}
    >
      {cell && (
        <div
          className="dice"
          style={{ backgroundColor: PLAYERS[cell.playerId].color }}
        >
          {cell.value}
        </div>
      )}
    </div>
  );
};

export default BoardCell;
