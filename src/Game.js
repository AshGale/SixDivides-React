import Board from './models/Board.js';
import Unit from './models/Unit.js';
import CombatSystem from './models/CombatSystem.js';
import GameUI from './components/GameUI.js';

class Game {
    constructor(numPlayers = 2) {
        this.numPlayers = Math.min(Math.max(2, numPlayers), 4);
        this.currentPlayer = 1;
        this.actionsLeft = 0;
        this.board = new Board();
        this.ui = new GameUI();
        this.selectedUnit = null;
        
        this.initialize();
    }

    initialize() {
        this.ui.createBoard();
        this.initializeUnits();
        this.setupEventListeners();
        this.calculateStartingActions();
    }

    initializeUnits() {
        const startingPositions = this.board.getStartingPositions();
        
        // Create bases for each player
        for (let i = 0; i < this.numPlayers; i++) {
            const [row, col] = startingPositions[i];
            const unit = new Unit(6, i + 1);  // Value 6 = Base
            this.board.placeUnit(unit, row, col);
            this.ui.updateCell(row, col, unit);
        }
    }

    setupEventListeners() {
        document.getElementById('board').addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell) return;

            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.handleCellClick(row, col);
        });

        document.getElementById('end-turn').addEventListener('click', () => this.endTurn());
    }

    handleCellClick(row, col) {
        const clickedUnit = this.board.getUnit(row, col);

        // Selecting a unit
        if (!this.selectedUnit && clickedUnit?.player === this.currentPlayer) {
            this.selectUnit(row, col);
            return;
        }

        // Handle base actions
        if (this.selectedUnit?.isBase) {
            this.handleBaseAction(row, col);
            return;
        }

        // Handle movement or combat
        if (this.selectedUnit) {
            this.handleUnitAction(row, col);
            return;
        }

        this.deselectUnit();
    }

    handleBaseAction(row, col) {
        const targetUnit = this.board.getUnit(row, col);
        const selectedPos = this.board.units.get(this.selectedUnit);
        
        // Check if target is adjacent
        const adjacent = this.board.getAdjacentPositions(selectedPos.row, selectedPos.col)
            .some(([r, c]) => r === row && c === col);
            
        if (!adjacent) {
            this.deselectUnit();
            return;
        }

        if (this.actionsLeft <= 0) {
            this.deselectUnit();
            return;
        }

        // Create worker
        if (!targetUnit) {
            const newUnit = new Unit(1, this.currentPlayer);
            this.board.placeUnit(newUnit, row, col);
            this.ui.updateCell(row, col, newUnit);
            this.actionsLeft--;
        }
        // Attack enemy
        else if (targetUnit.player !== this.currentPlayer) {
            const combat = CombatSystem.handleCombat(this.selectedUnit, targetUnit);
            if (combat.success) {
                if (combat.defenderReduced) {
                    targetUnit.value = combat.newDefenderValue;
                    this.ui.updateCell(row, col, targetUnit);
                }
            }
            this.actionsLeft--;
        }

        this.deselectUnit();
        this.ui.updateGameInfo(this.currentPlayer, this.actionsLeft);
    }

    handleUnitAction(row, col) {
        const targetUnit = this.board.getUnit(row, col);
        const selectedPos = this.board.units.get(this.selectedUnit);
        
        // Check if move is adjacent
        const adjacent = this.board.getAdjacentPositions(selectedPos.row, selectedPos.col)
            .some(([r, c]) => r === row && c === col);
            
        if (!adjacent || this.actionsLeft <= 0) {
            this.deselectUnit();
            return;
        }

        // Move to empty space
        if (!targetUnit) {
            this.board.moveUnit(this.selectedUnit, row, col);
            this.ui.updateCell(selectedPos.row, selectedPos.col, null);
            this.ui.updateCell(row, col, this.selectedUnit);
            this.actionsLeft--;
        }
        // Combat or combine
        else if (targetUnit.player === this.currentPlayer) {
            const units = [this.selectedUnit, targetUnit];
            if (CombatSystem.canCombineUnits(units)) {
                const newUnit = CombatSystem.combineUnits(units);
                if (newUnit) {
                    const combinedUnit = new Unit(newUnit.value, newUnit.player);
                    this.board.removeUnit(this.selectedUnit);
                    this.board.removeUnit(targetUnit);
                    this.board.placeUnit(combinedUnit, row, col);
                    this.ui.updateCell(selectedPos.row, selectedPos.col, null);
                    this.ui.updateCell(row, col, combinedUnit);
                    this.actionsLeft--;
                }
            }
        }
        else if (this.selectedUnit.canAttack()) {
            const combat = CombatSystem.handleCombat(this.selectedUnit, targetUnit);
            if (combat.success) {
                if (combat.defenderReduced) {
                    targetUnit.value = combat.newDefenderValue;
                    this.ui.updateCell(row, col, targetUnit);
                }
                if (combat.attackerReduced) {
                    this.selectedUnit.value = combat.newAttackerValue;
                    this.ui.updateCell(selectedPos.row, selectedPos.col, this.selectedUnit);
                }
            } else if (combat.attackerDestroyed) {
                this.board.removeUnit(this.selectedUnit);
                this.ui.updateCell(selectedPos.row, selectedPos.col, null);
            }
            this.actionsLeft--;
        }

        this.deselectUnit();
        this.ui.updateGameInfo(this.currentPlayer, this.actionsLeft);
    }

    selectUnit(row, col) {
        const unit = this.board.getUnit(row, col);
        if (!unit || unit.player !== this.currentPlayer) return;

        this.selectedUnit = unit;
        this.ui.selectCell(row, col);
        this.showValidMoves(row, col);
    }

    deselectUnit() {
        this.selectedUnit = null;
        this.ui.deselectCell();
    }

    showValidMoves(row, col) {
        const unit = this.board.getUnit(row, col);
        if (!unit || this.actionsLeft <= 0) return;

        const adjacentPositions = this.board.getAdjacentPositions(row, col);
        
        adjacentPositions.forEach(([r, c]) => {
            const targetUnit = this.board.getUnit(r, c);
            if (!targetUnit) {
                if (unit.canMove()) {
                    this.ui.highlightValidMoves([[r, c]], 'move');
                }
            } else if (targetUnit.player === this.currentPlayer) {
                if (CombatSystem.canCombineUnits([unit, targetUnit])) {
                    this.ui.highlightValidMoves([[r, c]], 'combine');
                }
            } else if (unit.canAttack()) {
                this.ui.highlightValidMoves([[r, c]], 'attack');
            }
        });
    }

    calculateStartingActions() {
        this.actionsLeft = 0;
        this.board.units.forEach((_pos, unit) => {
            if (unit.player === this.currentPlayer) {
                this.actionsLeft += unit.getActions();
            }
        });
        this.ui.updateGameInfo(this.currentPlayer, this.actionsLeft);
    }

    endTurn() {
        this.deselectUnit();
        this.currentPlayer = (this.currentPlayer % this.numPlayers) + 1;
        this.calculateStartingActions();
    }
}

export default Game;
