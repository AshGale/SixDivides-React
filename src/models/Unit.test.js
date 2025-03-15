import Unit from './Unit.js';

describe('Unit', () => {
    test('Worker (value 1) provides 1 action', () => {
        const worker = new Unit(1, 1);
        expect(worker.getActions()).toBe(1);
        expect(worker.canMove()).toBe(true);
        expect(worker.canAttack()).toBe(false);
    });

    test('Soldier (value 2) provides 0 actions but can attack', () => {
        const soldier = new Unit(2, 1);
        expect(soldier.getActions()).toBe(0);
        expect(soldier.canMove()).toBe(true);
        expect(soldier.canAttack()).toBe(true);
    });

    test('Super Worker (value 3) provides 2 actions', () => {
        const superWorker = new Unit(3, 1);
        expect(superWorker.getActions()).toBe(2);
        expect(superWorker.canMove()).toBe(true);
        expect(superWorker.canAttack()).toBe(false);
    });

    test('Base (value 6) provides 3 actions and cannot move', () => {
        const base = new Unit(6, 1);
        expect(base.getActions()).toBe(3);
        expect(base.canMove()).toBe(false);
        expect(base.canAttack()).toBe(true);
        expect(base.isBase).toBe(true);
    });
});
