import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BoardCell from '../board/BoardCell';
import { 
  selectPiece, 
  setValidMoves, 
  clearSelection,
  movePiece,
  combineUnits,
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
    
    // Log for debugging
    console.log('Clicked cell:', row, col);
    
    // If no piece is selected, try to select one
    if (!selectedPiece) {
      // Check if this cell has a piece that can be selected
      const piece = board[row][col];
      if (piece && piece.playerId === currentPlayer) {
        const moves = getTutorialValidMoves(board, row, col, currentPlayer, restrictions);
        if (moves.length > 0) {
          dispatch(selectPiece({ row, col, isBase: piece.value === 6 }));
          dispatch(setValidMoves(moves));
          
          // If the tutorial step requires selecting a specific piece, check if this is it
          const isTargetPiece = currentTutorialStep?.restriction?.type === 'forcedSelection' &&
                              row === currentTutorialStep.restriction.row &&
                              col === currentTutorialStep.restriction.col;
          
          if (currentTutorialStep?.waitForAction && isTargetPiece && 
              (!currentTutorialStep.nextTrigger || currentTutorialStep.nextTrigger === 'pieceSelected')) {
            // Add a small delay before advancing to the next step
            setTimeout(() => {
              dispatch(advanceTutorial());
            }, 500); // Shorter delay for selection
          }
        }
      }
      return;
    }

    // If we have a selected piece
    const isMoveValid = validMoves.some(move => move.row === row && move.col === col);
    
    // Check if this is an invalid move that we want to prevent
    const isInvalidMove = !isMoveValid && currentTutorialStep?.preventInvalidMoves;
    
    if (isMoveValid || isInvalidMove) {
      // If this is a valid move, handle it
      if (isMoveValid) {
        const move = validMoves.find(m => m.row === row && m.col === col);
        
        if (move.type === 'move' || move.type === 'attack') {
          dispatch(movePiece({ 
            fromRow: selectedPiece.row, 
            fromCol: selectedPiece.col, 
            toRow: row, 
            toCol: col,
            type: move.type
          }));
        } else if (move.type === 'combine') {
          dispatch(combineUnits({ 
            fromRow: selectedPiece.row, 
            fromCol: selectedPiece.col, 
            toRow: row, 
            toCol: col 
          }));
        } else if (move.type === 'baseAction') {
          dispatch(handleBaseAction({ 
            baseRow: selectedPiece.row, 
            baseCol: selectedPiece.col, 
            targetRow: row, 
            targetCol: col 
          }));
        }
      }
      
      // Clear selection after move or invalid attempt
      dispatch(clearSelection());
      
      // If this was a tutorial step that requires a specific action, advance the tutorial
      if (currentTutorialStep?.waitForAction && 
          (!currentTutorialStep.nextTrigger || currentTutorialStep.nextTrigger === 'pieceMoved')) {
        // Add a small delay before advancing to the next step
        setTimeout(() => {
          dispatch(advanceTutorial());
        }, 1000); // 1 second delay
      }
      return;
    }
    
    // If we get here, it's an invalid move or selection
    dispatch(clearSelection());
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
