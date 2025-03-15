class Unit {
    constructor(value, player) {
        this.value = value;
        this.player = player;
        this.isBase = value === 6;
    }

    getActions() {
        switch(this.value) {
            case 1: return 1;  // Worker
            case 2: return 0;  // Soldier
            case 3: return 2;  // Super Worker
            case 4: return 0;  // Super Soldier
            case 5: return 3;  // Elite Worker
            case 6: return 3;  // Base
            default: return 0;
        }
    }

    canMove() {
        return !this.isBase;
    }

    canAttack() {
        return this.isBase || [2, 4].includes(this.value);  // Base and Soldiers can attack
    }

    canProvideActions() {
        return this.isBase || [1, 3, 5].includes(this.value);  // Base and Workers provide actions
    }
}

export default Unit;
