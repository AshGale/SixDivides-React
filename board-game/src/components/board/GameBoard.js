import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BoardCell from './BoardCell';
import { 
  selectPiece, 
  setValidMoves, 
  clearSelection,
  movePiece,
  combineUnits,
  handleCombat,
  handleBaseAction,
  endTurn,
  setShowTurnMessage
} from '../../store/gameSlice';
import { getValidMovesForPiece, getCellClasses } from '../../utils/gameUtils';
import './GameBoard.css';

/**
 * GameBoard component represents the main game board
 */
const GameBoard = () => {
  const dispatch = useDispatch();
  const { 
    board, 
    currentPlayer, 
    selectedPiece, 
    validMoves, 
    actions, 
    showTurnMessage,
    winner
  } = useSelector(state => state.game);
  const { aiPlayers } = useSelector(state => state.ai);

  // Show turn message when player changes
  useEffect(() => {
    if (showTurnMessage) {
      const timer = setTimeout(() => {
        dispatch(setShowTurnMessage(false));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showTurnMessage, dispatch]);

  // Automatically end turn when actions are depleted
  useEffect(() => {
    if (actions === 0 && !winner) {
      // Add a small delay before ending the turn
      const timer = setTimeout(() => {
        dispatch(endTurn());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [actions, winner, dispatch]);

  // Handle cell click
  const handleCellClick = (row, col) => {
    // If it's an AI player's turn, don't allow human interaction
    if (aiPlayers[currentPlayer] !== null) {
      return;
    }
    
    if (winner || actions <= 0) return;

    const piece = board[row][col];
    
    // If clicking a valid move location
    if (selectedPiece && validMoves.some(move => move.row === row && move.col === col)) {
      const selectedUnit = board[selectedPiece.row][selectedPiece.col];
      
      // Safety check - selected unit must exist
      if (!selectedUnit) {
        dispatch(clearSelection());
        return;
      }

      // Find the move type
      const move = validMoves.find(m => m.row === row && m.col === col);
      const moveType = move?.type;

      if (selectedPiece.isBase) {
        dispatch(handleBaseAction({ 
          baseRow: selectedPiece.row, 
          baseCol: selectedPiece.col, 
          targetRow: row, 
          targetCol: col, 
          actionType: moveType 
        }));
        return;
      }

      const targetPiece = board[row][col];

      if (!targetPiece && moveType === 'move') {
        // Move to empty cell
        dispatch(movePiece({ 
          fromRow: selectedPiece.row, 
          fromCol: selectedPiece.col, 
          toRow: row, 
          toCol: col 
        }));
      } else if (targetPiece && targetPiece.playerId === currentPlayer && moveType === 'combine') {
        // Combine friendly units
        dispatch(combineUnits({ 
          fromRow: selectedPiece.row, 
          fromCol: selectedPiece.col, 
          toRow: row, 
          toCol: col 
        }));
      } else if (targetPiece && targetPiece.playerId !== currentPlayer && moveType === 'attack') {
        // Combat with enemy unit
        dispatch(handleCombat({ 
          attackerRow: selectedPiece.row, 
          attackerCol: selectedPiece.col, 
          defenderRow: row, 
          defenderCol: col 
        }));
      } else {
        // Invalid action - don't consume an action
        dispatch(clearSelection());
        return;
      }
      
      return;
    }

    // If selecting a new piece
    if (piece && piece.playerId === currentPlayer) {
      const isBase = piece.value === 6;
      dispatch(selectPiece({ row, col, isBase }));
      
      // Calculate valid moves
      const moves = getValidMovesForPiece(board, row, col, currentPlayer);
      dispatch(setValidMoves(moves));
    } else {
      dispatch(clearSelection());
    }
  };

  return (
    <div className="game-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => (
            <BoardCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              cell={cell}
              className={getCellClasses(rowIndex, colIndex, validMoves, selectedPiece)}
              onClick={handleCellClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
