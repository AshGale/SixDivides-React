class GameUI {
    constructor(containerId = 'board') {
        this.container = document.getElementById(containerId);
        this.cells = [];
        this.selectedCell = null;
    }

    createBoard() {
        this.container.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            this.cells[row] = [];
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.container.appendChild(cell);
                this.cells[row][col] = cell;
            }
        }
    }

    createUnitElement(unit) {
        const element = document.createElement('div');
        element.className = `unit player${unit.player}`;
        element.textContent = unit.value;
        return element;
    }

    updateCell(row, col, unit) {
        const cell = this.cells[row][col];
        cell.innerHTML = '';
        if (unit) {
            cell.appendChild(this.createUnitElement(unit));
        }
    }

    highlightValidMoves(positions, type = 'move') {
        positions.forEach(([row, col]) => {
            const cell = this.cells[row][col];
            cell.classList.add(`valid-${type}`);
        });
    }

    clearHighlights() {
        document.querySelectorAll('.valid-move, .valid-attack, .valid-combine').forEach(cell => {
            cell.classList.remove('valid-move', 'valid-attack', 'valid-combine');
        });
    }

    selectCell(row, col) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }
        this.selectedCell = this.cells[row][col];
        this.selectedCell.classList.add('selected');
    }

    deselectCell() {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
            this.selectedCell = null;
        }
        this.clearHighlights();
    }

    updateGameInfo(currentPlayer, actionsLeft) {
        const gameInfo = document.getElementById('game-info');
        if (gameInfo) {
            gameInfo.textContent = `Player ${currentPlayer}'s turn | Actions left: ${actionsLeft}`;
        }
    }
}

export default GameUI;
