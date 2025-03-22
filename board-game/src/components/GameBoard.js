import React, { useState } from 'react';
import './GameBoard.css';

const GameBoard = () => {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [board, setBoard] = useState(Array(8).fill().map(() => Array(8).fill(null)));
  const [selectedPiece, setSelectedPiece] = useState(null);
  const players = [
    { id: 0, color: 'red', position: [0, 0] },
    { id: 1, color: 'blue', position: [7, 7] },
    { id: 2, color: 'green', position: [0, 7] },
    { id: 3, color: 'yellow', position: [7, 0] },
  ];

  // Initialize board with players' pieces
  useState(() => {
    const newBoard = [...board];
    players.forEach(player => {
      const [row, col] = player.position;
      newBoard[row][col] = { playerId: player.id, value: 1 };
    });
    setBoard(newBoard);
  }, []);

  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    // Check if move is to an adjacent tile
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
  };

  const handleCellClick = (row, col) => {
    const piece = board[row][col];

    // If no piece is selected and clicked cell has current player's piece
    if (!selectedPiece && piece && piece.playerId === currentPlayer) {
      setSelectedPiece({ row, col });
      return;
    }

    // If a piece is selected, try to move it
    if (selectedPiece) {
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        const newBoard = [...board];
        newBoard[row][col] = board[selectedPiece.row][selectedPiece.col];
        newBoard[selectedPiece.row][selectedPiece.col] = null;
        setBoard(newBoard);
        
        // Move to next player
        setCurrentPlayer((currentPlayer + 1) % 4);
      }
      setSelectedPiece(null);
    }
  };

  return (
    <div className="game-container">
      <div className="current-player">
        Current Player: {players[currentPlayer].color}
      </div>
      <div className="game-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`board-cell ${
                  selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex
                    ? 'selected'
                    : ''
                }`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell && (
                  <div
                    className="dice"
                    style={{ backgroundColor: players[cell.playerId].color }}
                  >
                    {cell.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
