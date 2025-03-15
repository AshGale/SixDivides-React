import CombatSystem from './CombatSystem.js';
import Unit from './Unit.js';

describe('CombatSystem', () => {
    describe('Combat Rules', () => {
        test('Attacker with higher value reduces defender to value 1', () => {
            const attacker = new Unit(4, 1); // Super Soldier
            const defender = new Unit(2, 2); // Soldier
            const result = CombatSystem.handleCombat(attacker, defender);
            
            expect(result.success).toBe(true);
            expect(result.defenderReduced).toBe(true);
            expect(result.newDefenderValue).toBe(1);
            expect(result.attackerReduced).toBe(true);
            expect(result.newAttackerValue).toBe(2); // 4 - 2 = 2
        });

        test('Attacker with equal/lower value is destroyed', () => {
            const attacker = new Unit(2, 1); // Soldier
            const defender = new Unit(3, 2); // Super Worker
            const result = CombatSystem.handleCombat(attacker, defender);
            
            expect(result.success).toBe(false);
            expect(result.attackerDestroyed).toBe(true);
        });
    });

    describe('Unit Combination Rules', () => {
        test('Units can combine up to value 6', () => {
            const unit1 = new Unit(2, 1);
            const unit2 = new Unit(4, 1);
            expect(CombatSystem.canCombineUnits([unit1, unit2])).toBe(true);
            
            const result = CombatSystem.combineUnits([unit1, unit2]);
            expect(result.value).toBe(6);
            expect(result.player).toBe(1);
        });

        test('Cannot combine units above value 6', () => {
            const unit1 = new Unit(4, 1);
            const unit2 = new Unit(3, 1);
            expect(CombatSystem.canCombineUnits([unit1, unit2])).toBe(false);
            
            const result = CombatSystem.combineUnits([unit1, unit2]);
            expect(result).toBe(null);
        });

        test('Cannot combine units from different players', () => {
            const unit1 = new Unit(2, 1);
            const unit2 = new Unit(3, 2);
            expect(CombatSystem.canCombineUnits([unit1, unit2])).toBe(false);
        });
    });
});
