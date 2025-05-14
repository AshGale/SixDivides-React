import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BoardCell from '../board/BoardCell';
import { 
  selectPiece, 
  setValidMoves, 
  clearSelection,
  movePiece,
  combineUnits,
  handleCombat,
  handleBaseAction
} from '../../store/gameSlice';
import { advanceTutorial } from '../../store/tutorialSlice';
import { getTutorialValidMoves } from '../../logic/tutorialUtils';
import { getCellClasses } from '../../logic';
import '../board/GameBoard.css';
import './TutorialGameBoard.css';

/**
 * TutorialGameBoard component - Special version of GameBoard for tutorials
 */
const TutorialGameBoard = () => {
  const dispatch = useDispatch();
  const { 
    board, 
    currentPlayer, 
    selectedPiece, 
    validMoves, 
    actions,
    winner
  } = useSelector(state => state.game);
  
  const { 
    currentStep,
    tutorialScenario
  } = useSelector(state => state.tutorial);

  // Get current tutorial step
  const currentTutorialStep = tutorialScenario?.steps[currentStep] || null;
  
  // Handle cell click with tutorial restrictions
  const handleCellClick = (row, col) => {
    if (winner || actions <= 0) return;
    
    // If the tutorial step has restrictions, enforce them
    const restrictions = currentTutorialStep?.restriction || null;
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
        
        // Advance tutorial if this was a required action
        if (currentTutorialStep?.waitForAction && currentTutorialStep?.nextTrigger === 'baseAction') {
          dispatch(advanceTutorial());
        }
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
        
        // Advance tutorial if this was a required action
        if (currentTutorialStep?.waitForAction && currentTutorialStep?.nextTrigger === 'pieceMoved') {
          dispatch(advanceTutorial());
        }
      } else if (targetPiece && targetPiece.playerId === currentPlayer && moveType === 'combine') {
        // Combine friendly units
        dispatch(combineUnits({ 
          fromRow: selectedPiece.row, 
          fromCol: selectedPiece.col, 
          toRow: row, 
          toCol: col 
        }));
        
        // Advance tutorial if this was a required action
        if (currentTutorialStep?.waitForAction && currentTutorialStep?.nextTrigger === 'unitsCombined') {
          dispatch(advanceTutorial());
        }
      } else if (targetPiece && targetPiece.playerId !== currentPlayer && moveType === 'attack') {
        // Combat with enemy unit
        dispatch(handleCombat({ 
          attackerRow: selectedPiece.row, 
          attackerCol: selectedPiece.col, 
          defenderRow: row, 
          defenderCol: col 
        }));
        
        // Advance tutorial if this was a required action
        if (currentTutorialStep?.waitForAction && currentTutorialStep?.nextTrigger === 'combat') {
          dispatch(advanceTutorial());
        }
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
      
      // If forced selection is active, only allow selection of the forced piece
      if (restrictions && restrictions.type === 'forcedSelection') {
        if (row !== restrictions.row || col !== restrictions.col) {
          return; // Prevent selecting any other piece
        }
      }
      
      dispatch(selectPiece({ row, col, isBase }));
      
      // Calculate valid moves with tutorial restrictions
      const moves = getTutorialValidMoves(
        board, 
        row, 
        col, 
        currentPlayer, 
        restrictions
      );
      
      dispatch(setValidMoves(moves));
      
      // Advance tutorial if this was a required action
      if (currentTutorialStep?.waitForAction && currentTutorialStep?.nextTrigger === 'pieceSelected') {
        dispatch(advanceTutorial());
      }
    } else {
      dispatch(clearSelection());
    }
  };

  // Get cell class names with tutorial highlights
  const getCellClassesWithTutorial = (row, col) => {
    const baseClasses = getCellClasses(row, col, validMoves, selectedPiece, board, currentPlayer);
    const isTutorialHighlighted = currentTutorialStep?.highlightedCells?.some(
      cell => cell.row === row && cell.col === col
    );
    
    return `${baseClasses}${isTutorialHighlighted ? ' tutorial-highlight' : ''}`;
  };

  return (
    <div className="game-board tutorial-game-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => (
            <BoardCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              cell={cell}
              className={getCellClassesWithTutorial(rowIndex, colIndex)}
              onClick={handleCellClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TutorialGameBoard;
