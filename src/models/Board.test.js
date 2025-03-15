import Board from './Board.js';
import Unit from './Unit.js';

describe('Board', () => {
    let board;

    beforeEach(() => {
        board = new Board();
    });

    test('Initial board is empty', () => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                expect(board.getUnit(row, col)).toBe(null);
            }
        }
    });

    test('Starting positions match game rules', () => {
        const positions = board.getStartingPositions();
        const expectedPositions = [
            [5, 3], // D3 (Player 1)
            [3, 5], // F4 (Player 2)
            [3, 4], // E4 (Player 3)
            [4, 2]  // C5 (Player 4)
        ];
        expect(positions).toEqual(expectedPositions);
    });

    test('Can place and retrieve unit', () => {
        const unit = new Unit(1, 1);
        const row = 3, col = 3;
        
        expect(board.placeUnit(unit, row, col)).toBe(true);
        expect(board.getUnit(row, col)).toBe(unit);
        
        const pos = board.units.get(unit);
        expect(pos.row).toBe(row);
        expect(pos.col).toBe(col);
    });

    test('Cannot place unit outside board', () => {
        const unit = new Unit(1, 1);
        expect(board.placeUnit(unit, -1, 0)).toBe(false);
        expect(board.placeUnit(unit, 0, 8)).toBe(false);
    });

    test('Can move unit to empty position', () => {
        const unit = new Unit(1, 1);
        board.placeUnit(unit, 3, 3);
        
        expect(board.moveUnit(unit, 3, 4)).toBe(true);
        expect(board.getUnit(3, 3)).toBe(null);
        expect(board.getUnit(3, 4)).toBe(unit);
    });

    test('Get adjacent positions', () => {
        const positions = board.getAdjacentPositions(3, 3);
        const expected = [[2, 3], [4, 3], [3, 2], [3, 4]];
        expect(positions).toEqual(expect.arrayContaining(expected));
        expect(positions.length).toBe(4);
    });

    test('Get adjacent positions on edge', () => {
        const positions = board.getAdjacentPositions(0, 0);
        const expected = [[1, 0], [0, 1]];
        expect(positions).toEqual(expect.arrayContaining(expected));
        expect(positions.length).toBe(2);
    });
});
