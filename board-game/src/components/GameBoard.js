import React, { useState, useEffect, useCallback } from 'react';
import './GameBoard.css';

const GameBoard = () => {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [board, setBoard] = useState(Array(8).fill().map(() => Array(8).fill(null)));
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [actions, setActions] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showTurnMessage, setShowTurnMessage] = useState(false);
  const [winner, setWinner] = useState(null);

  // Starting positions: D3, F4, E6, C5 (converted to 0-based indices)
  const startingPositions = [
    [5, 3], // D3
    [4, 5], // F4
    [2, 4], // E6
    [3, 2], // C5
  ];

  const players = [
    { id: 0, color: 'red', name: 'Red' },
    { id: 1, color: 'blue', name: 'Blue' },
    { id: 2, color: 'green', name: 'Green' },
    { id: 3, color: 'yellow', name: 'Yellow' },
  ];

  const unitTypes = {
    1: { name: 'Worker', actions: 1, canMove: true, canAttack: false },
    2: { name: 'Soldier', actions: 0, canMove: true, canAttack: true },
    3: { name: 'Super Worker', actions: 2, canMove: true, canAttack: false },
    4: { name: 'Super Soldier', actions: 0, canMove: true, canAttack: true },
    5: { name: 'Elite Worker', actions: 3, canMove: true, canAttack: false },
    6: { name: 'Base', actions: 3, canMove: false, canAttack: true },
  };

  const getStartingActions = useCallback((currentBoard, player) => {
    const playerPieces = currentBoard.flat().filter(cell => cell && cell.playerId === player);
    return playerPieces.reduce((total, piece) => total + (unitTypes[piece.value]?.actions || 0), 0);
  }, []);

  const initializeGame = useCallback(() => {
    const newBoard = Array(8).fill().map(() => Array(8).fill(null));
    const numPlayers = Math.min(players.length, 4);
    
    // Place bases at starting positions
    for (let i = 0; i < numPlayers; i++) {
      const [row, col] = startingPositions[i];
      newBoard[row][col] = { playerId: i, value: 6 }; // Base value is 6
    }
    
    setBoard(newBoard);
    setWinner(null);
    setActions(getStartingActions(newBoard, currentPlayer));
    setGameStarted(true);
    showNewTurnMessage(0);
  }, [currentPlayer, getStartingActions]);

  const showNewTurnMessage = (player) => {
    setShowTurnMessage(true);
    setTimeout(() => setShowTurnMessage(false), 1500);
  };

  useEffect(() => {
    if (!gameStarted) {
      initializeGame();
    }
  }, [gameStarted, initializeGame]);

  const getAdjacentTiles = (row, col) => {
    const adjacent = [
      [row - 1, col], // up
      [row + 1, col], // down
      [row, col - 1], // left
      [row, col + 1], // right
    ];
    return adjacent.filter(([r, c]) => 
      r >= 0 && r < 8 && c >= 0 && c < 8
    );
  };

  const checkWinCondition = (currentBoard) => {
    const playersWithUnits = new Set();
    currentBoard.flat().forEach(cell => {
      if (cell) {
        playersWithUnits.add(cell.playerId);
      }
    });
    
    if (playersWithUnits.size === 1) {
      const winnerId = Array.from(playersWithUnits)[0];
      setWinner(players[winnerId]);
      return true;
    }
    return false;
  };

  const handleCombat = (attackerRow, attackerCol, defenderRow, defenderCol) => {
    const attacker = board[attackerRow][attackerCol];
    const defender = board[defenderRow][defenderCol];
    const newBoard = [...board];

    if (attacker.value > defender.value) {
      // Attacker wins
      const newValue = Math.max(1, attacker.value - defender.value);
      newBoard[defenderRow][defenderCol] = { playerId: attacker.playerId, value: newValue };
      newBoard[attackerRow][attackerCol] = null;
    } else {
      // Defender wins or ties
      if (attacker.value === defender.value) {
        // Equal values - both are removed
        newBoard[defenderRow][defenderCol] = null;
      } else {
        // Defender survives with reduced value
        newBoard[defenderRow][defenderCol] = {
          ...defender,
          value: Math.max(1, defender.value - attacker.value)
        };
      }
      newBoard[attackerRow][attackerCol] = null;
    }

    setBoard(newBoard);
    setValidMoves([]); // Clear valid moves after combat
    setSelectedPiece(null); // Clear selected piece after combat
    setActions(prev => {
      const newActions = prev - 1;
      if (newActions <= 0) endTurn();
      return newActions;
    });

    checkWinCondition(newBoard);
  };

  const handleCombine = (fromRow, fromCol, toRow, toCol) => {
    const piece1 = board[fromRow][fromCol];
    const piece2 = board[toRow][toCol];
    
    // Safety check - both pieces must exist
    if (!piece1 || !piece2) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    // Prevent combining with a base
    if (piece2.value === 6) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    const combinedValue = piece1.value + piece2.value;
    const newBoard = [...board];

    if (combinedValue <= 6) {
      newBoard[toRow][toCol] = { playerId: piece1.playerId, value: combinedValue };
      newBoard[fromRow][fromCol] = null;
    } else if (piece1.value !== 6 && piece2.value !== 6) {
      // Convert target to base, keep remainder on original
      newBoard[toRow][toCol] = { playerId: piece1.playerId, value: 6 };
      newBoard[fromRow][fromCol] = { playerId: piece1.playerId, value: combinedValue - 6 };
    } else {
      // Invalid combination
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    setBoard(newBoard);
    setSelectedPiece(null); // Clear selected piece after combine
    setValidMoves([]); // Clear valid moves after combine
    setActions(prev => {
      const newActions = prev - 1;
      if (newActions <= 0) endTurn();
      return newActions;
    });

    checkWinCondition(newBoard);
  };

  const handleBaseAction = (row, col) => {
    if (actions <= 0) return;
    
    const newBoard = [...board];
    const targetCell = board[row][col];

    if (!targetCell) {
      // Create new unit if cell is empty
      newBoard[row][col] = { playerId: currentPlayer, value: 1 };
    } else if (targetCell.playerId === currentPlayer && targetCell.value < 6) {
      // Upgrade existing friendly unit
      newBoard[row][col] = {
        ...targetCell,
        value: targetCell.value + 1
      };
    } else if (targetCell.playerId !== currentPlayer) {
      // Only reduce enemy unit value by 1, remove only if it would go to 0
      if (targetCell.value === 1) {
        newBoard[row][col] = null; // Remove unit that would be reduced to 0
      } else {
        newBoard[row][col] = {
          ...targetCell,
          value: targetCell.value - 1
        };
      }
    } else {
      // Invalid action - don't consume an action
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    setBoard(newBoard);
    setActions(prev => {
      const newActions = prev - 1;
      if (newActions <= 0) endTurn();
      return newActions;
    });
    setSelectedPiece(null);
    setValidMoves([]);

    checkWinCondition(newBoard);
  };

  const endTurn = () => {
    const nextPlayer = (currentPlayer + 1) % players.length;
    const nextActions = getStartingActions(board, nextPlayer);
    
    // Only advance to next player if they have actions available
    if (nextActions > 0) {
      setCurrentPlayer(nextPlayer);
      setActions(nextActions);
      showNewTurnMessage(nextPlayer);
    } else {
      // Skip to the next player with available actions
      let playerToSkipTo = (nextPlayer + 1) % players.length;
      let actionsForPlayer = getStartingActions(board, playerToSkipTo);
      
      while (playerToSkipTo !== currentPlayer && actionsForPlayer === 0) {
        playerToSkipTo = (playerToSkipTo + 1) % players.length;
        actionsForPlayer = getStartingActions(board, playerToSkipTo);
      }
      
      if (actionsForPlayer > 0) {
        setCurrentPlayer(playerToSkipTo);
        setActions(actionsForPlayer);
        showNewTurnMessage(playerToSkipTo);
      } else {
        // Game is effectively over as no players have actions
        setActions(0);
      }
    }
    
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const getValidMovesForPiece = (row, col) => {
    const piece = board[row][col];
    if (!piece || piece.playerId !== currentPlayer) return [];

    const adjacentTiles = getAdjacentTiles(row, col);
    const validMoves = [];
    
    if (piece.value === 6) { // Base
      // For bases, check each adjacent tile
      adjacentTiles.forEach(([r, c]) => {
        const targetCell = board[r][c];
        if (!targetCell) {
          validMoves.push({ row: r, col: c, type: 'create' }); // Empty cell - can create
        } else if (targetCell.playerId === currentPlayer && targetCell.value < 6) {
          validMoves.push({ row: r, col: c, type: 'upgrade' }); // Friendly unit - can upgrade
        } else if (targetCell.playerId !== currentPlayer) {
          validMoves.push({ row: r, col: c, type: 'attack' }); // Enemy unit - can attack
        }
      });
    } else if (unitTypes[piece.value].canMove) {
      // For movable units
      adjacentTiles.forEach(([r, c]) => {
        const targetCell = board[r][c];
        if (!targetCell) {
          validMoves.push({ row: r, col: c, type: 'move' }); // Empty cell - can move
        } else if (targetCell.playerId === currentPlayer) {
          if (targetCell.value !== 6 && piece.value + targetCell.value <= 6) {
            validMoves.push({ row: r, col: c, type: 'combine' }); // Friendly unit - can combine
          }
        } else if (unitTypes[piece.value].canAttack) {
          validMoves.push({ row: r, col: c, type: 'attack' }); // Enemy unit - can attack if unit type allows
        }
      });
    }
    
    return validMoves;
  };

  const isCellValid = (row, col) => {
    return validMoves.find(move => move.row === row && move.col === col);
  };

  const getCellClasses = (row, col) => {
    const validMove = isCellValid(row, col);
    if (!validMove) return '';
    
    const classes = ['valid-move'];
    classes.push(`valid-move-${validMove.type}`);
    return classes.join(' ');
  };

  const handleCellClick = (row, col) => {
    if (winner || actions <= 0) return;

    const piece = board[row][col];
    
    // If clicking a valid move location
    if (selectedPiece && validMoves.some(move => move.row === row && move.col === col)) {
      const selectedUnit = board[selectedPiece.row][selectedPiece.col];
      
      // Safety check - selected unit must exist
      if (!selectedUnit) {
        setSelectedPiece(null);
        setValidMoves([]);
        return;
      }

      if (selectedPiece.isBase) {
        handleBaseAction(row, col);
        return;
      }

      const targetPiece = board[row][col];

      if (!targetPiece) {
        // Move to empty cell
        const newBoard = [...board];
        newBoard[row][col] = selectedUnit;
        newBoard[selectedPiece.row][selectedPiece.col] = null;
        setBoard(newBoard);
        setActions(prev => {
          const newActions = prev - 1;
          if (newActions <= 0) endTurn();
          return newActions;
        });
        setSelectedPiece(null);
        setValidMoves([]);
        checkWinCondition(newBoard);
      } else if (targetPiece.playerId === currentPlayer) {
        // Combine friendly units
        handleCombine(selectedPiece.row, selectedPiece.col, row, col);
      } else if (unitTypes[selectedUnit.value].canAttack) {
        // Combat with enemy unit
        handleCombat(selectedPiece.row, selectedPiece.col, row, col);
      } else {
        // Invalid attack attempt - don't consume an action
        setSelectedPiece(null);
        setValidMoves([]);
        return;
      }
      return;
    }

    // If selecting a new piece
    if (piece && piece.playerId === currentPlayer) {
      const isBase = piece.value === 6;
      setSelectedPiece({ row, col, isBase });
      setValidMoves(getValidMovesForPiece(row, col));
    } else {
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="current-player">Current Player: {players[currentPlayer].name}</div>
        <div className="actions">Actions Remaining: {actions}</div>
        {showTurnMessage && !winner && (
          <div className="turn-message" style={{ backgroundColor: players[currentPlayer].color }}>
            {players[currentPlayer].name}'s Turn!
          </div>
        )}
        {winner && (
          <div className="win-screen">
            <div className="win-message" style={{ backgroundColor: winner.color }}>
              {winner.name} Wins!
            </div>
            <button className="new-game-button" onClick={() => initializeGame()}>
              Start New Game
            </button>
          </div>
        )}
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
                } ${getCellClasses(rowIndex, colIndex)}`}
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
