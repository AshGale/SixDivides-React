import Unit from './Unit.js';

describe('Unit', () => {
    describe('Unit Properties', () => {
        test('Worker (value 1) provides 1 action', () => {
            const worker = new Unit(1, 1);
            expect(worker.getActions()).toBe(1);
            expect(worker.canMove()).toBe(true);
            expect(worker.canAttack()).toBe(false);
            expect(worker.canProvideActions()).toBe(true);
        });

        test('Soldier (value 2) provides 0 actions but can attack', () => {
            const soldier = new Unit(2, 1);
            expect(soldier.getActions()).toBe(0);
            expect(soldier.canMove()).toBe(true);
            expect(soldier.canAttack()).toBe(true);
            expect(soldier.canProvideActions()).toBe(false);
        });

        test('Super Worker (value 3) provides 2 actions', () => {
            const superWorker = new Unit(3, 1);
            expect(superWorker.getActions()).toBe(2);
            expect(superWorker.canMove()).toBe(true);
            expect(superWorker.canAttack()).toBe(false);
            expect(superWorker.canProvideActions()).toBe(true);
        });

        test('Super Soldier (value 4) provides 0 actions but can attack', () => {
            const superSoldier = new Unit(4, 1);
            expect(superSoldier.getActions()).toBe(0);
            expect(superSoldier.canMove()).toBe(true);
            expect(superSoldier.canAttack()).toBe(true);
            expect(superSoldier.canProvideActions()).toBe(false);
        });

        test('Elite Worker (value 5) provides 3 actions', () => {
            const eliteWorker = new Unit(5, 1);
            expect(eliteWorker.getActions()).toBe(3);
            expect(eliteWorker.canMove()).toBe(true);
            expect(eliteWorker.canAttack()).toBe(false);
            expect(eliteWorker.canProvideActions()).toBe(true);
        });

        test('Base (value 6) provides 3 actions and cannot move', () => {
            const base = new Unit(6, 1);
            expect(base.getActions()).toBe(3);
            expect(base.canMove()).toBe(false);
            expect(base.canAttack()).toBe(true);
            expect(base.isBase).toBe(true);
            expect(base.canProvideActions()).toBe(true);
        });
    });

    describe('Unit Type Classifications', () => {
        test('Workers are units with values 1, 3, and 5', () => {
            const workers = [new Unit(1, 1), new Unit(3, 1), new Unit(5, 1)];
            workers.forEach(worker => {
                expect(worker.canProvideActions()).toBe(true);
                expect(worker.canAttack()).toBe(false);
            });
        });

        test('Soldiers are units with values 2 and 4', () => {
            const soldiers = [new Unit(2, 1), new Unit(4, 1)];
            soldiers.forEach(soldier => {
                expect(soldier.canProvideActions()).toBe(false);
                expect(soldier.canAttack()).toBe(true);
            });
        });
    });
});
