class Board {
    constructor() {
        this.cells = Array(8).fill(null).map(() => Array(8).fill(null));
        this.units = new Map();
    }

    getStartingPositions() {
        return [
            [5, 3], // D3 (Player 1)
            [3, 5], // F4 (Player 2)
            [3, 4], // E4 (Player 3)
            [4, 2]  // C5 (Player 4)
        ];
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getUnit(row, col) {
        return this.cells[row][col];
    }

    placeUnit(unit, row, col) {
        if (!this.isValidPosition(row, col)) return false;
        this.cells[row][col] = unit;
        this.units.set(unit, { row, col });
        return true;
    }

    moveUnit(unit, newRow, newCol) {
        const pos = this.units.get(unit);
        if (!pos) return false;

        this.cells[pos.row][pos.col] = null;
        this.cells[newRow][newCol] = unit;
        this.units.set(unit, { row: newRow, col: newCol });
        return true;
    }

    removeUnit(unit) {
        const pos = this.units.get(unit);
        if (!pos) return false;

        this.cells[pos.row][pos.col] = null;
        this.units.delete(unit);
        return true;
    }

    getAdjacentPositions(row, col) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        return directions
            .map(([dRow, dCol]) => [row + dRow, col + dCol])
            .filter(([r, c]) => this.isValidPosition(r, c));
    }
}

export default Board;
