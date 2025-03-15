class CombatSystem {
    static handleCombat(attacker, defender) {
        if (!attacker || !defender) return false;

        const result = {
            success: false,
            attackerDestroyed: false,
            defenderReduced: false,
            attackerReduced: false,
            newAttackerValue: attacker.value,
            newDefenderValue: defender.value
        };

        // Combat resolution based on unit values
        if (attacker.value > defender.value) {
            result.success = true;
            result.defenderReduced = true;
            result.newDefenderValue = 1;
            result.attackerReduced = true;
            result.newAttackerValue = Math.max(1, attacker.value - defender.value);
        } else {
            result.success = false;
            result.attackerDestroyed = true;
        }

        return result;
    }

    static canCombineUnits(units) {
        if (!Array.isArray(units) || units.length < 2) return false;
        
        // Check if all units belong to the same player
        const player = units[0].player;
        if (!units.every(unit => unit.player === player)) return false;

        // Calculate total value
        const totalValue = units.reduce((sum, unit) => sum + unit.value, 0);
        
        // Units can only combine up to value 6 (base)
        return totalValue <= 6;
    }

    static combineUnits(units) {
        if (!this.canCombineUnits(units)) return null;

        const totalValue = units.reduce((sum, unit) => sum + unit.value, 0);
        if (totalValue > 6) return null;

        // Create a new unit with combined value
        return {
            value: totalValue,
            player: units[0].player
        };
    }
}

export default CombatSystem;
