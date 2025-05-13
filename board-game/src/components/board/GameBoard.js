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
import { getValidMovesForPiece, getCellClasses } from '../../logic';
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
    winner,
    isTutorialMode,
    tutorialStep,
    tutorialSteps
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
    
    // Handle tutorial-specific click behavior
    if (isTutorialMode) {
      handleTutorialCellClick(row, col, piece);
      return;
    }
    
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

  // Handle tutorial-specific cell clicks
  const handleTutorialCellClick = (row, col, piece) => {
    const currentTutorialStep = tutorialSteps[tutorialStep];
    
    if (!currentTutorialStep) return;
    
    // Special handling for step 5 (SHOW_MOVES)
    if (tutorialStep === 4 && currentTutorialStep.action === 'SHOW_MOVES') {
      // Step 5 is about showing valid moves for a specific unit
      if (piece && piece.playerId === currentPlayer) {
        // Select the piece
        dispatch(selectPiece({ row, col, isBase: piece.isBase }));
        
        // Manually set valid moves to include the step 6 target position
        const targetStep = tutorialSteps[5]; // Get step 6
        if (targetStep && targetStep.targetPosition) {
          const validMovesList = [
            {
              row: targetStep.targetPosition.y,
              col: targetStep.targetPosition.x,
              type: 'move'
            }
          ];
          dispatch(setValidMoves(validMovesList));
        } else {
          // Fallback - use regular valid moves calculation
          const moves = getValidMovesForPiece(board, row, col, currentPlayer);
          dispatch(setValidMoves(moves));
        }
      }
      return;
    }
    
    // Special handling for step 6 (MOVE_TO)
    if (tutorialStep === 5 && currentTutorialStep.action === 'MOVE_TO') {
      // If clicking on highlighted target position while a piece is selected
      if (selectedPiece && 
          currentTutorialStep.targetPosition && 
          row === currentTutorialStep.targetPosition.y && 
          col === currentTutorialStep.targetPosition.x) {
        
        // Execute the move action unconditionally for tutorial
        dispatch(movePiece({ 
          fromRow: selectedPiece.row, 
          fromCol: selectedPiece.col, 
          toRow: row, 
          toCol: col 
        }));
        return;
      }
      // Let user select any friendly piece
      else if (piece && piece.playerId === currentPlayer) {
        dispatch(selectPiece({ row, col, isBase: piece.isBase }));
        
        // Always show the target position as a valid move
        if (currentTutorialStep.targetPosition) {
          const validMovesList = [
            {
              row: currentTutorialStep.targetPosition.y,
              col: currentTutorialStep.targetPosition.x,
              type: 'move'
            }
          ];
          dispatch(setValidMoves(validMovesList));
        }
        return;
      }
    }
    
    // Handle CLICK_UNIT action
    if (currentTutorialStep.action === 'CLICK_UNIT') {
      // Allow selecting the specific unit mentioned in the tutorial
      if (piece && piece.playerId === currentPlayer) {
        // If there's a specific target unit, verify it's the correct one
        if (currentTutorialStep.targetUnit) {
          // Check piece ID if available, otherwise just allow selection
          const pieceId = piece?.id;
          if (!pieceId || pieceId === currentTutorialStep.targetUnit) {
            dispatch(selectPiece({ row, col, isBase: piece.isBase }));
            const moves = getValidMovesForPiece(board, row, col, currentPlayer);
            dispatch(setValidMoves(moves));
          }
        } else {
          // If no specific target unit, allow selecting any friendly piece
          dispatch(selectPiece({ row, col, isBase: piece.isBase }));
          const moves = getValidMovesForPiece(board, row, col, currentPlayer);
          dispatch(setValidMoves(moves));
        }
      }
      return;
    }
    
    // Handle ATTACK action 
    if (currentTutorialStep.action === 'ATTACK') {
      // If clicking on highlighted target position while a piece is selected
      if (selectedPiece && 
          currentTutorialStep.targetPosition && 
          row === currentTutorialStep.targetPosition.y && 
          col === currentTutorialStep.targetPosition.x &&
          piece && piece.playerId !== currentPlayer) {
        
        // Execute the attack action
        dispatch(handleCombat({ 
          attackerRow: selectedPiece.row, 
          attackerCol: selectedPiece.col, 
          defenderRow: row, 
          defenderCol: col 
        }));
        return;
      }
      // Let user select any friendly piece
      else if (piece && piece.playerId === currentPlayer) {
        dispatch(selectPiece({ row, col, isBase: piece.isBase }));
        
        // Always show the target position as a valid attack
        if (currentTutorialStep.targetPosition) {
          const validMovesList = [
            {
              row: currentTutorialStep.targetPosition.y,
              col: currentTutorialStep.targetPosition.x,
              type: 'attack'
            }
          ];
          dispatch(setValidMoves(validMovesList));
        }
        return;
      }
    }
    
    // Default behavior for other tutorial steps
    if (piece && piece.playerId === currentPlayer) {
      dispatch(selectPiece({ row, col, isBase: piece.isBase }));
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
              className={`${getCellClasses(rowIndex, colIndex, validMoves, selectedPiece, board, currentPlayer)} cell-${colIndex}-${rowIndex} ${cell ? `unit-cell-${colIndex}-${rowIndex}` : ''}`}
              onClick={handleCellClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
