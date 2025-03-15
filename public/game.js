class Game {
    constructor(numPlayers = 2) {
        this.numPlayers = Math.min(Math.max(2, numPlayers), 4);
        this.currentPlayer = 1;
        this.actionsLeft = 0;
        this.selectedUnit = null;
        this.board = this.createBoard();
        this.initializeUnits();
        this.setupEventListeners();
        this.calculateStartingActions();
    }

    createBoard() {
        const board = document.getElementById('board');
        const cells = [];
        
        for (let row = 0; row < 8; row++) {
            cells[row] = [];
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                board.appendChild(cell);
                cells[row][col] = cell;
            }
        }
        return cells;
    }

    initializeUnits() {
        this.units = new Map();
        
        // Starting positions (chess notation to array indices)
        const positions = [
            [5, 3], // D3 (Player 1)
            [3, 5], // F4 (Player 2)
            [3, 4], // E4 (Player 3)
            [4, 2]  // C5 (Player 4)
        ];

        for (let i = 0; i < this.numPlayers; i++) {
            const [row, col] = positions[i];
            const unit = this.createUnit(i + 1, 6);
            this.placeUnit(unit, row, col);
        }
    }

    createUnit(player, value) {
        const unit = document.createElement('div');
        unit.className = `unit player${player}`;
        unit.textContent = value;
        return unit;
    }

    placeUnit(unit, row, col) {
        const cell = this.board[row][col];
        cell.appendChild(unit);
        this.units.set(unit, { 
            row, 
            col, 
            value: parseInt(unit.textContent), 
            player: parseInt(unit.className.slice(-1)),
            isBase: parseInt(unit.textContent) === 6
        });
    }

    calculateStartingActions() {
        this.actionsLeft = 0;
        this.units.forEach((unitInfo, unit) => {
            if (unitInfo.player === this.currentPlayer) {
                // Workers (1, 3, 5) and Base (6) provide actions
                switch(unitInfo.value) {
                    case 1: this.actionsLeft += 1; break;
                    case 3: this.actionsLeft += 2; break;
                    case 5: this.actionsLeft += 3; break;
                    case 6: this.actionsLeft += 3; break;
                }
            }
        });
        this.updateGameInfo();
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
        const cell = this.board[row][col];
        const unit = cell.querySelector('.unit');

        // If no unit is selected and clicked on own unit
        if (!this.selectedUnit && unit && this.getUnitPlayer(unit) === this.currentPlayer) {
            this.selectUnit(unit);
            return;
        }

        // If base is selected
        if (this.selectedUnit && this.units.get(this.selectedUnit).isBase) {
            const targetUnit = cell.querySelector('.unit');
            // If clicked on valid creation spot (empty adjacent cell)
            if (this.isValidCreationSpot(row, col)) {
                this.createWorkerUnit(row, col);
                return;
            }
            // If clicked on friendly unit in adjacent cell for upgrade
            if (targetUnit && this.isValidBaseUpgrade(row, col)) {
                this.handleBaseUpgrade(row, col, targetUnit);
                return;
            }
            // If clicked on enemy unit in adjacent cell
            if (targetUnit && this.isValidBaseAttack(row, col)) {
                this.handleBaseAttack(row, col, targetUnit);
                return;
            }
        }

        // If unit is selected and clicked on valid move location
        if (this.selectedUnit && this.isValidMove(row, col)) {
            const targetUnit = cell.querySelector('.unit');
            if (targetUnit) {
                // Check if it's a friendly unit for combining
                if (this.getUnitPlayer(targetUnit) === this.currentPlayer) {
                    this.handleCombining(row, col, targetUnit);
                } else {
                    this.handleCombat(row, col, targetUnit);
                }
            } else {
                this.moveUnit(row, col);
            }
            return;
        }

        // Deselect if clicking elsewhere
        this.deselectUnit();
    }

    showValidMoves() {
        if (!this.selectedUnit) return;

        const unitInfo = this.units.get(this.selectedUnit);
        const { row, col, isBase } = unitInfo;

        if (isBase) return; // Bases can't move

        // Show valid moves in four directions
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
        
        directions.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidMove(newRow, newCol)) {
                const targetCell = this.board[newRow][newCol];
                const targetUnit = targetCell.querySelector('.unit');
                
                if (targetUnit && this.getUnitPlayer(targetUnit) === this.currentPlayer) {
                    // Show combining opportunity in yellow
                    targetCell.classList.add('valid-combine');
                } else if (targetUnit) {
                    // Show attack opportunity in red
                    targetCell.classList.add('valid-attack');
                } else {
                    // Show movement opportunity in green
                    targetCell.classList.add('valid-move');
                }
            }
        });
    }

    clearValidMoves() {
        document.querySelectorAll('.valid-move, .valid-attack, .valid-combine').forEach(cell => {
            cell.classList.remove('valid-move', 'valid-attack', 'valid-combine');
        });
    }

    isValidMove(row, col) {
        if (!this.selectedUnit) return false;
        
        // Check if within board bounds
        if (row < 0 || row >= 8 || col < 0 || col >= 8) return false;

        // Check if we have actions left
        if (this.actionsLeft <= 0) return false;

        const unitInfo = this.units.get(this.selectedUnit);
        
        // Bases can't move
        if (unitInfo.isBase) return false;

        const { row: currentRow, col: currentCol } = unitInfo;

        // Check if move is one step in any direction
        const rowDiff = Math.abs(row - currentRow);
        const colDiff = Math.abs(col - currentCol);

        // Check target cell
        const targetCell = this.board[row][col];
        const targetUnit = targetCell.querySelector('.unit');
        
        if (targetUnit) {
            const targetInfo = this.units.get(targetUnit);
            // Can't move onto or combine with bases
            if (targetInfo.isBase) return false;
            // Allow moving to friendly unit position for combining unless either unit is value 6
            if (targetInfo.player === this.currentPlayer) {
                return ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) &&
                       !(unitInfo.value === 6 || targetInfo.value === 6);
            }
            // Workers can't attack
            if (unitInfo.value === 1 || unitInfo.value === 3 || unitInfo.value === 5) return false;
        }
        
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    showValidBaseActions() {
        if (!this.selectedUnit) return;

        const unitInfo = this.units.get(this.selectedUnit);
        if (!unitInfo.isBase) return;

        const { row, col } = unitInfo;
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
        
        directions.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            // Show valid creation spots (empty cells)
            if (this.isValidCreationSpot(newRow, newCol)) {
                this.board[newRow][newCol].classList.add('valid-move');
            }
            
            // Show valid upgrade spots (friendly units)
            if (this.isValidBaseUpgrade(newRow, newCol)) {
                this.board[newRow][newCol].classList.add('valid-combine');
            }
            
            // Show valid attack spots (enemy units)
            if (this.isValidBaseAttack(newRow, newCol)) {
                this.board[newRow][newCol].classList.add('valid-attack');
            }
        });
    }

    isValidCreationSpot(row, col) {
        // Check if within board bounds
        if (row < 0 || row >= 8 || col < 0 || col >= 8) return false;

        // Check if we have actions left
        if (this.actionsLeft <= 0) return false;

        // Check if selected unit is a base
        const unitInfo = this.units.get(this.selectedUnit);
        if (!unitInfo || !unitInfo.isBase) return false;

        // Check if target cell is adjacent
        const { row: baseRow, col: baseCol } = unitInfo;
        const rowDiff = Math.abs(row - baseRow);
        const colDiff = Math.abs(col - baseCol);
        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) return false;

        // Check if target cell is empty
        const targetCell = this.board[row][col];
        return !targetCell.querySelector('.unit');
    }

    isValidBaseAttack(row, col) {
        // Check if within board bounds
        if (row < 0 || row >= 8 || col < 0 || col >= 8) return false;

        // Check if we have actions left
        if (this.actionsLeft <= 0) return false;

        // Check if selected unit is a base
        const unitInfo = this.units.get(this.selectedUnit);
        if (!unitInfo || !unitInfo.isBase) return false;

        // Check if target cell is adjacent
        const { row: baseRow, col: baseCol } = unitInfo;
        const rowDiff = Math.abs(row - baseRow);
        const colDiff = Math.abs(col - baseCol);
        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) return false;

        // Check if target cell has an enemy unit
        const targetCell = this.board[row][col];
        const targetUnit = targetCell.querySelector('.unit');
        if (!targetUnit) return false;
        
        return this.getUnitPlayer(targetUnit) !== this.currentPlayer;
    }

    isValidBaseUpgrade(row, col) {
        // Check if within board bounds
        if (row < 0 || row >= 8 || col < 0 || col >= 8) return false;

        // Check if we have actions left
        if (this.actionsLeft <= 0) return false;

        // Check if selected unit is a base
        const unitInfo = this.units.get(this.selectedUnit);
        if (!unitInfo || !unitInfo.isBase) return false;

        // Check if target cell is adjacent
        const { row: baseRow, col: baseCol } = unitInfo;
        const rowDiff = Math.abs(row - baseRow);
        const colDiff = Math.abs(col - baseCol);
        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) return false;

        // Check if target cell has a friendly unit that can be upgraded
        const targetCell = this.board[row][col];
        const targetUnit = targetCell.querySelector('.unit');
        if (!targetUnit) return false;
        
        const targetInfo = this.units.get(targetUnit);
        return targetInfo.player === this.currentPlayer && targetInfo.value < 6;
    }

    createWorkerUnit(row, col) {
        if (!this.selectedUnit || this.actionsLeft <= 0) return;

        const unitInfo = this.units.get(this.selectedUnit);
        if (!unitInfo.isBase) return;

        // Create new worker (value 1)
        const newUnit = this.createUnit(this.currentPlayer, 1);
        this.placeUnit(newUnit, row, col);

        // Decrease actions
        this.actionsLeft--;
        this.updateGameInfo();
        this.deselectUnit();
    }

    moveUnit(row, col) {
        if (!this.selectedUnit || this.actionsLeft <= 0) return;

        const targetCell = this.board[row][col];
        const unitInfo = this.units.get(this.selectedUnit);
        
        // Update unit position
        this.units.set(this.selectedUnit, { ...unitInfo, row, col });
        targetCell.appendChild(this.selectedUnit);
        
        // Decrease actions
        this.actionsLeft--;
        this.updateGameInfo();
        
        // Deselect after move
        this.deselectUnit();
    }

    getUnitPlayer(unit) {
        return this.units.get(unit)?.player;
    }

    endTurn() {
        this.deselectUnit();
        this.currentPlayer = (this.currentPlayer % this.numPlayers) + 1;
        this.calculateStartingActions();
    }

    updateGameInfo() {
        document.getElementById('current-player').textContent = `Current Player: ${this.currentPlayer}`;
        document.getElementById('actions-left').textContent = `Actions Left: ${this.actionsLeft}`;
    }

    handleBaseAttack(row, col, targetUnit) {
        if (!this.selectedUnit || this.actionsLeft <= 0) return;

        const unitInfo = this.units.get(this.selectedUnit);
        if (!unitInfo.isBase) return;

        const targetInfo = this.units.get(targetUnit);
        
        // Reduce enemy unit value by 1
        const newValue = targetInfo.value - 1;
        
        if (newValue <= 0) {
            // Remove the unit if its value would be reduced to 0
            targetUnit.remove();
            this.units.delete(targetUnit);
        } else {
            // Otherwise reduce its value by 1
            targetUnit.textContent = newValue;
            targetInfo.value = newValue;
        }
        
        // Decrease actions
        this.actionsLeft--;
        this.updateGameInfo();
        this.deselectUnit();
    }

    handleBaseUpgrade(row, col, targetUnit) {
        if (!this.selectedUnit || this.actionsLeft <= 0) return;

        const unitInfo = this.units.get(this.selectedUnit);
        if (!unitInfo.isBase) return;

        const targetInfo = this.units.get(targetUnit);
        
        // Upgrade unit value by 1
        const newValue = Math.min(6, targetInfo.value + 1);
        targetUnit.textContent = newValue;
        targetInfo.value = newValue;
        
        // If upgraded to value 6, make it a base
        if (newValue === 6) {
            targetInfo.isBase = true;
        }
        
        // Decrease actions
        this.actionsLeft--;
        this.updateGameInfo();
        this.deselectUnit();
        
        // Recalculate actions if we created a new base
        if (newValue === 6) {
            this.calculateStartingActions();
        }
    }

    selectUnit(unit) {
        const unitInfo = this.units.get(unit);
        
        // Can't select if no actions left
        if (this.actionsLeft <= 0) return;
        
        // Can only select own units
        if (unitInfo.player !== this.currentPlayer) return;
        
        this.selectedUnit = unit;
        unit.parentElement.classList.add('selected');
        
        // Show different valid moves based on unit type
        if (unitInfo.isBase) {
            this.showValidBaseActions();
        } else {
            this.showValidMoves();
        }
    }

    deselectUnit() {
        if (this.selectedUnit) {
            // Find all cells with the selected class and remove it
            document.querySelectorAll('.selected').forEach(cell => {
                cell.classList.remove('selected');
            });
            this.clearValidMoves();
            this.selectedUnit = null;
        }
    }

    handleCombining(row, col, targetUnit) {
        if (!this.selectedUnit || this.actionsLeft <= 0) return;

        const unitInfo = this.units.get(this.selectedUnit);
        const targetInfo = this.units.get(targetUnit);
        
        // Never combine with bases
        if (targetInfo.isBase) {
            this.deselectUnit();
            return;
        }
        
        // Calculate combined value
        const combinedValue = unitInfo.value + targetInfo.value;
        
        // If combined value exceeds 6, create value 6 unit and leave remainder
        if (combinedValue > 6) {
            // Target becomes value 6
            targetUnit.textContent = '6';
            targetInfo.value = 6;
            targetInfo.isBase = true;
            
            // Original unit becomes the remainder
            const remainderValue = combinedValue - 6;
            this.selectedUnit.textContent = remainderValue;
            unitInfo.value = remainderValue;
            unitInfo.isBase = false;
        } else {
            // Remove both units if we're creating a new combined unit
            this.selectedUnit.remove();
            targetUnit.remove();
            this.units.delete(this.selectedUnit);
            this.units.delete(targetUnit);
            
            // Create new combined unit
            const newUnit = this.createUnit(this.currentPlayer, combinedValue);
            this.placeUnit(newUnit, row, col);
            
            // If combined value is 6, mark as base
            const newUnitInfo = this.units.get(newUnit);
            if (combinedValue === 6) {
                newUnitInfo.isBase = true;
            }
        }
        
        // Decrease actions
        this.actionsLeft--;
        this.updateGameInfo();
        this.deselectUnit();
        
        // Recalculate actions if we created a new base
        if (combinedValue === 6) {
            this.calculateStartingActions();
        }
    }

    handleCombat(row, col, targetUnit) {
        const attackerInfo = this.units.get(this.selectedUnit);
        const defenderInfo = this.units.get(targetUnit);
        
        // Check if unit can attack
        if (attackerInfo.value === 1 || attackerInfo.value === 3 || attackerInfo.value === 5) {
            return; // Workers can't attack
        }

        if (this.actionsLeft <= 0) return;

        const originalDefenderValue = defenderInfo.value;

        if (attackerInfo.value > defenderInfo.value) {
            // Successful attack
            // Remove defender
            targetUnit.remove();
            this.units.delete(targetUnit);

            // Reduce attacker's value by defender's original value
            const newAttackerValue = Math.max(1, attackerInfo.value - originalDefenderValue);
            this.selectedUnit.textContent = newAttackerValue;
            attackerInfo.value = newAttackerValue;
            
            // Move attacker to defender's position
            this.moveUnit(row, col);
        } else {
            // Failed attack - attacker is destroyed and defender is reduced to value 1
            this.selectedUnit.remove();
            this.units.delete(this.selectedUnit);
            
            // Reduce defender to value 1
            targetUnit.textContent = '1';
            defenderInfo.value = 1;
        }
        
        this.actionsLeft--;
        this.updateGameInfo();
        this.deselectUnit();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    console.log('Starting new game - latest version');
    window.game = new Game(2); // Start with 2 players
});
