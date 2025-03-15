import Board from './Board.js';
import Unit from './Unit.js';
import CombatSystem from './CombatSystem.js';

describe('Base Actions', () => {
    let board;
    let base;
    let actionsLeft;

    beforeEach(() => {
        board = new Board();
        base = new Unit(6, 1);
        board.placeUnit(base, 3, 3);
        actionsLeft = base.getActions(); // Base provides 3 actions
    });

    describe('Worker Creation', () => {
        test('Base can create value 1 worker in adjacent empty tile', () => {
            const emptyPos = [3, 4];
            expect(board.getUnit(emptyPos[0], emptyPos[1])).toBe(null);
            
            // Simulate creating worker
            const newWorker = new Unit(1, 1);
            expect(board.placeUnit(newWorker, emptyPos[0], emptyPos[1])).toBe(true);
            actionsLeft--;
            
            expect(actionsLeft).toBe(2);
            expect(board.getUnit(emptyPos[0], emptyPos[1])).toBe(newWorker);
            expect(newWorker.value).toBe(1);
            expect(newWorker.player).toBe(1);
        });

        test('Base cannot create worker in occupied tile', () => {
            const existingUnit = new Unit(1, 1);
            board.placeUnit(existingUnit, 3, 4);
            
            // Attempt to create worker in occupied space
            const newWorker = new Unit(1, 1);
            expect(board.placeUnit(newWorker, 3, 4)).toBe(false);
            expect(actionsLeft).toBe(3); // Action not consumed
        });

        test('Base cannot create worker without actions', () => {
            actionsLeft = 0;
            const emptyPos = [3, 4];
            
            const newWorker = new Unit(1, 1);
            expect(board.placeUnit(newWorker, emptyPos[0], emptyPos[1])).toBe(false);
        });
    });

    describe('Base Combat', () => {
        test('Base can attack adjacent enemy unit', () => {
            const enemyUnit = new Unit(2, 2);
            board.placeUnit(enemyUnit, 3, 4);
            
            const result = CombatSystem.handleCombat(base, enemyUnit);
            actionsLeft--;
            
            expect(result.success).toBe(true);
            expect(result.defenderReduced).toBe(true);
            expect(result.newDefenderValue).toBe(1);
            expect(actionsLeft).toBe(2);
        });

        test('Base cannot attack non-adjacent enemy unit', () => {
            const enemyUnit = new Unit(2, 2);
            board.placeUnit(enemyUnit, 5, 5); // Not adjacent
            
            expect(board.getAdjacentPositions(3, 3)).not.toContainEqual([5, 5]);
            expect(actionsLeft).toBe(3); // Action not consumed
        });
    });

    describe('Base Starting Positions', () => {
        test('Bases start in correct positions per game rules', () => {
            const newBoard = new Board();
            const positions = newBoard.getStartingPositions();
            
            // D3, F4, E4, C5 in chess notation
            expect(positions).toEqual([
                [5, 3], // D3 (Player 1)
                [3, 5], // F4 (Player 2)
                [3, 4], // E4 (Player 3)
                [4, 2]  // C5 (Player 4)
            ]);
        });
    });

    describe('Base Upgrades', () => {
        test('Base can upgrade adjacent friendly unit', () => {
            const worker = new Unit(1, 1);
            board.placeUnit(worker, 3, 4);
            
            // Simulate upgrading worker to super worker
            const upgradedUnit = new Unit(3, 1); // Value 3 = Super Worker
            board.removeUnit(worker);
            board.placeUnit(upgradedUnit, 3, 4);
            actionsLeft--;
            
            expect(actionsLeft).toBe(2);
            expect(board.getUnit(3, 4).value).toBe(3);
        });

        test('Base cannot upgrade enemy units', () => {
            const enemyWorker = new Unit(1, 2);
            board.placeUnit(enemyWorker, 3, 4);
            
            // Attempt to upgrade enemy unit
            expect(enemyWorker.player).not.toBe(base.player);
            expect(actionsLeft).toBe(3); // Action not consumed
        });
    });
});
