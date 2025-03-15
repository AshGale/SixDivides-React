import Board from './Board.js';
import Unit from './Unit.js';

describe('Movement Rules', () => {
    let board;

    beforeEach(() => {
        board = new Board();
    });

    describe('Adjacent Movement', () => {
        test('Unit can only move to adjacent empty tiles', () => {
            const worker = new Unit(1, 1);
            board.placeUnit(worker, 3, 3);

            // Check all adjacent positions
            const validMoves = [
                [2, 3], // up
                [4, 3], // down
                [3, 2], // left
                [3, 4]  // right
            ];

            validMoves.forEach(([row, col]) => {
                expect(board.isValidPosition(row, col)).toBe(true);
                expect(board.getUnit(row, col)).toBe(null);
            });

            // Check invalid diagonal moves
            const invalidMoves = [
                [2, 2], // up-left
                [2, 4], // up-right
                [4, 2], // down-left
                [4, 4]  // down-right
            ];

            invalidMoves.forEach(([row, col]) => {
                expect(board.isValidPosition(row, col)).toBe(true);
                expect(board.moveUnit(worker, row, col)).toBe(false);
            });
        });

        test('Unit cannot move to occupied friendly tile', () => {
            const worker1 = new Unit(1, 1);
            const worker2 = new Unit(1, 1);
            board.placeUnit(worker1, 3, 3);
            board.placeUnit(worker2, 3, 4);

            expect(board.moveUnit(worker1, 3, 4)).toBe(false);
        });
    });

    describe('Base Movement Restrictions', () => {
        test('Base cannot move', () => {
            const base = new Unit(6, 1);
            board.placeUnit(base, 3, 3);

            const adjacentPositions = [
                [2, 3], [4, 3], [3, 2], [3, 4]
            ];

            adjacentPositions.forEach(([row, col]) => {
                expect(board.moveUnit(base, row, col)).toBe(false);
            });
        });

        test('Base can create worker in adjacent empty tile', () => {
            const base = new Unit(6, 1);
            board.placeUnit(base, 3, 3);
            const pos = board.units.get(base);

            const adjacentPositions = board.getAdjacentPositions(pos.row, pos.col);
            adjacentPositions.forEach(([row, col]) => {
                expect(board.isValidPosition(row, col)).toBe(true);
                expect(board.getUnit(row, col)).toBe(null);
            });
        });
    });

    describe('Combat Movement Rules', () => {
        test('Soldier can move to enemy-occupied adjacent tile', () => {
            const soldier = new Unit(2, 1);
            const enemyWorker = new Unit(1, 2);
            board.placeUnit(soldier, 3, 3);
            board.placeUnit(enemyWorker, 3, 4);

            expect(soldier.canAttack()).toBe(true);
            const pos = board.units.get(enemyWorker);
            expect(board.isValidPosition(pos.row, pos.col)).toBe(true);
        });

        test('Worker cannot move to enemy-occupied tile', () => {
            const worker = new Unit(1, 1);
            const enemySoldier = new Unit(2, 2);
            board.placeUnit(worker, 3, 3);
            board.placeUnit(enemySoldier, 3, 4);

            expect(worker.canAttack()).toBe(false);
            expect(board.moveUnit(worker, 3, 4)).toBe(false);
        });

        test('Super Soldier can attack enemy base', () => {
            const superSoldier = new Unit(4, 1);
            const enemyBase = new Unit(6, 2);
            board.placeUnit(superSoldier, 3, 3);
            board.placeUnit(enemyBase, 3, 4);

            expect(superSoldier.canAttack()).toBe(true);
            const pos = board.units.get(enemyBase);
            expect(board.isValidPosition(pos.row, pos.col)).toBe(true);
        });
    });

    describe('Action Point Movement', () => {
        test('Unit cannot move without actions', () => {
            const worker = new Unit(1, 1);
            board.placeUnit(worker, 3, 3);
            let actionsLeft = 0;

            expect(actionsLeft).toBe(0);
            expect(board.moveUnit(worker, 3, 4)).toBe(false);
        });

        test('Moving costs one action point', () => {
            const worker = new Unit(1, 1);
            board.placeUnit(worker, 3, 3);
            let actionsLeft = 1;

            expect(board.moveUnit(worker, 3, 4)).toBe(true);
            actionsLeft--;
            expect(actionsLeft).toBe(0);
        });

        test('Super Worker can make multiple moves with its actions', () => {
            const superWorker = new Unit(3, 1);
            board.placeUnit(superWorker, 3, 3);
            let actionsLeft = superWorker.getActions();

            expect(actionsLeft).toBe(2);
            
            // First move
            expect(board.moveUnit(superWorker, 3, 4)).toBe(true);
            actionsLeft--;
            expect(actionsLeft).toBe(1);

            // Second move
            expect(board.moveUnit(superWorker, 3, 5)).toBe(true);
            actionsLeft--;
            expect(actionsLeft).toBe(0);
        });
    });
});
