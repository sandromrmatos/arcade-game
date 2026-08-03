// VGC Game Engine
// Core classes for creatures, moves, abilities, field effects, and battle management

// Type effectiveness chart
const TYPE_CHART = {
    'Mystic': { superEffective: ['Wind'], notEffective: [] },
    'Wind': { superEffective: ['Celestial'], notEffective: [] },
    'Celestial': { superEffective: ['Mystic'], notEffective: [] },
    'Mechanic': { superEffective: ['Neutral'], notEffective: [] },
    'Neutral': { superEffective: [], notEffective: [] }
};

// Battle Creature Instance
class BattleCreature {
    constructor(creatureData, selectedMoves, selectedAbility, allocatedStats) {
        this.name = creatureData.name;
        this.type = creatureData.type;
        this.sprite = creatureData.sprite;
        
        // Base stats + allocated stats
        this.baseStats = { ...creatureData.baseStats };
        this.allocatedStats = allocatedStats || { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
        
        // Calculate final base stats (base + allocated)
        this.maxStats = {
            hp: this.baseStats.hp + this.allocatedStats.hp,
            attack: this.baseStats.attack + this.allocatedStats.attack,
            defense: this.baseStats.defense + this.allocatedStats.defense,
            specialAttack: this.baseStats.specialAttack + this.allocatedStats.specialAttack,
            specialDefense: this.baseStats.specialDefense + this.allocatedStats.specialDefense,
            speed: this.baseStats.speed + this.allocatedStats.speed
        };
        
        // Current HP
        this.currentHP = this.maxStats.hp;
        
        // Stat modifiers (multipliers)
        this.statModifiers = {
            attack: 1.0,
            defense: 1.0,
            specialAttack: 1.0,
            specialDefense: 1.0,
            speed: 1.0
        };
        
        // Selected moves (4 out of 12)
        this.moves = selectedMoves.map(moveName => {
            const moveData = gameData.getMoveByName(moveName);
            return moveData ? { ...moveData } : null;
        }).filter(m => m !== null);
        
        // Selected ability
        this.abilityName = selectedAbility;
        this.ability = gameData.getAbilityByName(selectedAbility);
        
        // Battle state
        this.isFainted = false;
        this.isActive = false;
        this.switchedInThisTurn = false;
        this.abilityActivated = false; // For switch-in abilities
        
        // Secondary effect tracking
        this.isProtected = false; // Shield/Double Guard protection
        this.cantAttackNextTurn = false; // Move restrictions (Huge Recovery)
        this.usedMoves = new Set(); // Track which moves were used this turn (for Shield)
        this.usedMovesInBattle = new Set(); // Track which moves can't be used again (for Double Guard)
    }

    // Get current stat with modifiers applied
    getCurrentStat(statName) {
        if (statName === 'hp') {
            return this.currentHP;
        }
        
        const baseStat = this.maxStats[statName];
        const modifier = this.statModifiers[statName] || 1.0;
        return Math.round(baseStat * modifier);
    }

    // Apply stat change (percentage)
    applyStatChange(statName, percentChange) {
        if (!(statName in this.statModifiers)) return;
        
        const currentModifier = this.statModifiers[statName];
        const newModifier = currentModifier * (1 + percentChange / 100);
        
        // Cap at 0.2x to 1.8x (80% reduction to 80% increase)
        this.statModifiers[statName] = Math.max(0.2, Math.min(1.8, newModifier));
    }

    // Reset stat modifiers (on switch out)
    resetStatModifiers() {
        this.statModifiers = {
            attack: 1.0,
            defense: 1.0,
            specialAttack: 1.0,
            specialDefense: 1.0,
            speed: 1.0
        };
        this.abilityActivated = false;
        this.isProtected = false;
        this.cantAttackNextTurn = false;
        this.usedMoves.clear(); // Clear this turn's used moves
        // Note: usedMovesInBattle persists for moves like Double Guard that can't be used again
    }

    // Take damage
    takeDamage(damage) {
        this.currentHP = Math.max(0, this.currentHP - damage);
        if (this.currentHP === 0) {
            this.isFainted = true;
        }
    }

    // Heal HP
    heal(amount) {
        this.currentHP = Math.min(this.maxStats.hp, this.currentHP + amount);
    }

    // Check if creature is alive
    isAlive() {
        return !this.isFainted && this.currentHP > 0;
    }
}

// Field Effect
class FieldEffect {
    constructor(name, side, duration, effectData) {
        this.name = name;
        this.side = side; // 'player' or 'opponent'
        this.duration = duration; // turns remaining
        this.effectData = effectData; // custom data for the effect
    }

    decrementDuration() {
        this.duration--;
        return this.duration <= 0;
    }
}

// Battle Action
class BattleAction {
    constructor(creature, actionType, target = null, moveIndex = null, switchIndex = null) {
        this.creature = creature;
        this.actionType = actionType; // 'move' or 'switch'
        this.target = target; // For moves: target creature or position
        this.moveIndex = moveIndex; // Index of move in creature's move list
        this.switchIndex = switchIndex; // Index of bench creature to switch to
    }
}

// Battle Manager
class Battle {
    constructor(playerTeam, opponentTeam) {
        // Teams (4 creatures each)
        this.playerTeam = playerTeam; // Array of 4 BattleCreature
        this.opponentTeam = opponentTeam; // Array of 4 BattleCreature
        
        // Active creatures (2 each)
        this.playerActive = [playerTeam[0], playerTeam[1]];
        this.opponentActive = [opponentTeam[0], opponentTeam[1]];
        
        // Bench creatures (2 each)
        this.playerBench = [playerTeam[2], playerTeam[3]];
        this.opponentBench = [opponentTeam[2], opponentTeam[3]];
        
        // Mark active creatures
        this.playerActive.forEach(c => c.isActive = true);
        this.opponentActive.forEach(c => c.isActive = true);
        
        // Field effects
        this.playerFieldEffects = [];
        this.opponentFieldEffects = [];
        
        // Battle state
        this.turnNumber = 0;
        this.maxTurns = 30;
        this.battleLog = [];
        this.battleOver = false;
        this.winner = null; // 'player', 'opponent', or 'draw'
        
        // Activate switch-in abilities for starting creatures
        this.activateSwitchInAbilities(this.playerActive);
        this.activateSwitchInAbilities(this.opponentActive);
    }

    // Add message to battle log
    log(message) {
        this.battleLog.push(message);
        console.log(message);
    }

    // Activate switch-in abilities
    activateSwitchInAbilities(creatures) {
        // Note: Ability effects are NOT implemented in this phase
        // This is a placeholder for future implementation
        creatures.forEach(creature => {
            if (!creature.abilityActivated && creature.ability) {
                creature.abilityActivated = true;
                this.log(`${creature.name}'s ${creature.abilityName} activated!`);
            }
        });
    }

    // Get all alive creatures for a side
    getAliveCreatures(side) {
        if (side === 'player') {
            return [...this.playerActive, ...this.playerBench].filter(c => c !== null && c.isAlive());
        } else {
            return [...this.opponentActive, ...this.opponentBench].filter(c => c !== null && c.isAlive());
        }
    }

    // Check if battle should end
    checkBattleEnd() {
        const playerAlive = this.getAliveCreatures('player').length > 0;
        const opponentAlive = this.getAliveCreatures('opponent').length > 0;
        
        if (!playerAlive && !opponentAlive) {
            this.battleOver = true;
            this.winner = 'draw';
            this.log('Battle ended in a draw!');
            return true;
        } else if (!playerAlive) {
            this.battleOver = true;
            this.winner = 'opponent';
            this.log('Opponent wins!');
            return true;
        } else if (!opponentAlive) {
            this.battleOver = true;
            this.winner = 'player';
            this.log('Player wins!');
            return true;
        }
        
        if (this.turnNumber >= this.maxTurns) {
            this.battleOver = true;
            this.winner = 'draw';
            this.log('Battle ended after 30 turns - Draw!');
            return true;
        }
        
        return false;
    }

    // Handle creature fainting and forced switches
    handleFainting() {
        // Check player active creatures (don't log - already logged when they fainted)
        this.playerActive.forEach((creature, index) => {
            if (creature && !creature.isAlive()) {
                creature.isActive = false;
                this.playerActive[index] = null;
            }
        });
        
        // Check opponent active creatures (don't log - already logged when they fainted)
        this.opponentActive.forEach((creature, index) => {
            if (creature && !creature.isAlive()) {
                creature.isActive = false;
                this.opponentActive[index] = null;
            }
        });
        
        // Auto-switch from bench if needed (happens immediately)
        this.autoSwitchFainted('player');
        this.autoSwitchFainted('opponent');
    }

    // Auto-switch fainted creatures from bench
    autoSwitchFainted(side) {
        const active = side === 'player' ? this.playerActive : this.opponentActive;
        const bench = side === 'player' ? this.playerBench : this.opponentBench;
        
        // Only auto-switch for opponent
        if (side === 'opponent') {
            for (let i = 0; i < active.length; i++) {
                if (active[i] === null || !active[i].isAlive()) {
                    // Find first alive bench creature
                    const aliveBench = bench.find(c => c && c.isAlive());
                    if (aliveBench) {
                        // Switch in
                        active[i] = aliveBench;
                        active[i].isActive = true;
                        // Don't set switchedInThisTurn for replacements - they can act immediately next turn
                        active[i].switchedInThisTurn = false;
                        
                        // Remove from bench
                        const benchIndex = bench.indexOf(aliveBench);
                        bench[benchIndex] = null;
                        
                        this.log(`${aliveBench.name} was sent out!`);
                        this.activateSwitchInAbilities([aliveBench]);
                    }
                }
            }
        }
        // Player switches will be handled in UI
    }

    // Manual switch for player (called from UI)
    manualSwitchFainted(slotIndex, benchIndex) {
        const benchCreature = this.playerBench[benchIndex];
        if (benchCreature && benchCreature.isAlive()) {
            // Switch in
            this.playerActive[slotIndex] = benchCreature;
            this.playerActive[slotIndex].isActive = true;
            // Don't set switchedInThisTurn for replacements - they can act immediately next turn
            this.playerActive[slotIndex].switchedInThisTurn = false;
            
            // Remove from bench
            this.playerBench[benchIndex] = null;
            
            this.log(`${benchCreature.name} was sent out!`);
            this.activateSwitchInAbilities([benchCreature]);
        }
    }

    // Execute turn with actions from both sides (DEPRECATED - use executeTurnWithAnimation in UI)
    executeTurn(playerActions, opponentActions) {
        this.turnNumber++;
        this.log(`\n=== Turn ${this.turnNumber} ===`);
        
        // Reset turn flags
        [...this.playerActive, ...this.opponentActive].forEach(c => {
            if (c) {
                c.switchedInThisTurn = false;
                c.isProtected = false; // Protection only lasts one turn
                c.usedMoves.clear(); // Clear last turn's used moves (Shield can be used again)
            }
        });
        
        // Process switches first
        this.processSwitches(playerActions, opponentActions);
        
        // Collect all move actions
        const allActions = [];
        
        playerActions.forEach(action => {
            if (action && action.actionType === 'move' && action.creature && action.creature.isAlive()) {
                allActions.push({ ...action, side: 'player' });
            }
        });
        
        opponentActions.forEach(action => {
            if (action && action.actionType === 'move' && action.creature && action.creature.isAlive()) {
                allActions.push({ ...action, side: 'opponent' });
            }
        });
        
        // Sort by priority then speed
        allActions.sort((a, b) => {
            const moveA = a.creature.moves[a.moveIndex];
            const moveB = b.creature.moves[b.moveIndex];
            
            // Priority first
            if (moveB.priority !== moveA.priority) {
                return moveB.priority - moveA.priority;
            }
            
            // Speed second
            const speedA = a.creature.getCurrentStat('speed');
            const speedB = b.creature.getCurrentStat('speed');
            if (speedB !== speedA) {
                return speedB - speedA;
            }
            
            // Random tiebreaker
            return Math.random() - 0.5;
        });
        
        // Execute moves in order
        allActions.forEach(action => {
            if (action.creature.isAlive()) {
                this.executeMove(action);
            }
        });
        
        // Handle fainting
        this.handleFainting();
        
        // Apply field effect healing (Nebula Veil)
        this.applyEndOfTurnFieldEffects();
        
        // Update field effects
        this.updateFieldEffects();
        
        // Check battle end
        this.checkBattleEnd();
    }
    
    // Apply field effects at end of turn
    applyEndOfTurnFieldEffects() {
        // Player field effects
        this.playerFieldEffects.forEach(effect => {
            if (effect.name === 'Nebula Veil' && effect.effectData.healPerTurn) {
                this.playerActive.forEach(creature => {
                    if (creature && creature.isAlive()) {
                        creature.heal(effect.effectData.healPerTurn);
                        this.log(`${this.getCreatureLabel(creature, 'player')} healed ${effect.effectData.healPerTurn} HP from Nebula Veil!`);
                    }
                });
            }
        });
        
        // Opponent field effects
        this.opponentFieldEffects.forEach(effect => {
            if (effect.name === 'Nebula Veil' && effect.effectData.healPerTurn) {
                this.opponentActive.forEach(creature => {
                    if (creature && creature.isAlive()) {
                        creature.heal(effect.effectData.healPerTurn);
                        this.log(`${this.getCreatureLabel(creature, 'opponent')} healed ${effect.effectData.healPerTurn} HP from Nebula Veil!`);
                    }
                });
            }
        });
    }

    // Process switch actions
    processSwitches(playerActions, opponentActions) {
        // Player switches
        playerActions.forEach((action, actionIndex) => {
            if (action && action.actionType === 'switch' && action.creature) {
                const activeIndex = this.playerActive.indexOf(action.creature);
                if (activeIndex !== -1) {
                    const benchCreature = this.playerBench[action.switchIndex];
                    if (benchCreature && benchCreature.isAlive()) {
                        // Switch out
                        action.creature.isActive = false;
                        action.creature.resetStatModifiers();
                        this.playerBench[action.switchIndex] = action.creature;
                        
                        // Switch in
                        benchCreature.isActive = true;
                        benchCreature.switchedInThisTurn = true;
                        this.playerActive[activeIndex] = benchCreature;
                        
                        this.log(`Your ${action.creature.name} switched out! Your ${benchCreature.name} switched in!`);
                        this.activateSwitchInAbilities([benchCreature]);
                    }
                }
            }
        });
        
        // Opponent switches
        opponentActions.forEach((action, actionIndex) => {
            if (action && action.actionType === 'switch' && action.creature) {
                const activeIndex = this.opponentActive.indexOf(action.creature);
                if (activeIndex !== -1) {
                    const benchCreature = this.opponentBench[action.switchIndex];
                    if (benchCreature && benchCreature.isAlive()) {
                        // Switch out
                        action.creature.isActive = false;
                        action.creature.resetStatModifiers();
                        this.opponentBench[action.switchIndex] = action.creature;
                        
                        // Switch in
                        benchCreature.isActive = true;
                        benchCreature.switchedInThisTurn = true;
                        this.opponentActive[activeIndex] = benchCreature;
                        
                        this.log(`Opponent's ${action.creature.name} switched out! Opponent's ${benchCreature.name} switched in!`);
                        this.activateSwitchInAbilities([benchCreature]);
                    }
                }
            }
        });
    }

    // Execute a single move action
    executeMove(action) {
        const attacker = action.creature;
        const move = attacker.moves[action.moveIndex];
        const attackerSide = action.side;
        
        // Can't act if switched in this turn
        if (attacker.switchedInThisTurn) {
            this.log(`${this.getCreatureLabel(attacker, attackerSide)} can't move this turn!`);
            return;
        }
        
        // Can't attack if restricted by previous move (Huge Recovery)
        if (attacker.cantAttackNextTurn) {
            this.log(`${this.getCreatureLabel(attacker, attackerSide)} can't move this turn!`);
            attacker.cantAttackNextTurn = false; // Reset for next turn
            return;
        }
        
        // Check if attacker is still alive
        if (!attacker.isAlive()) {
            return;
        }
        
        // Check if move was used this turn (Shield can't be used consecutively)
        if (attacker.usedMoves.has(move.name)) {
            this.log(`${this.getCreatureLabel(attacker, attackerSide)} can't use ${move.name} again this turn!`);
            return;
        }
        
        // Check if move is permanently restricted (Double Guard can only be used once per battle)
        if (attacker.usedMovesInBattle.has(move.name)) {
            this.log(`${this.getCreatureLabel(attacker, attackerSide)} can't use ${move.name} again!`);
            return;
        }
        
        this.log(`${this.getCreatureLabel(attacker, attackerSide)} used ${move.name}!`);
        
        // Check accuracy
        const accuracyRoll = Math.random() * 100;
        if (accuracyRoll > move.accuracy) {
            this.log(`${move.name} missed!`);
            return;
        }
        
        // Determine targets based on targeting type
        const targets = this.determineTargets(action, move);
        
        // If no valid targets, move does nothing
        if (targets.length === 0) {
            this.log(`But there was no target!`);
            return;
        }
        
        // Execute move on each target
        targets.forEach(target => {
            if (target && target.isAlive()) {
                this.applyMoveEffect(attacker, target, move, action.side);
            }
        });
    }

    // Get creature label with owner prefix
    getCreatureLabel(creature, side) {
        if (side === 'player') {
            return `Your ${creature.name}`;
        } else {
            return `Opponent's ${creature.name}`;
        }
    }

    // Get defender side based on attacker side
    getDefenderSide(attackerSide) {
        return attackerSide === 'player' ? 'opponent' : 'player';
    }

    // Determine targets for a move
    determineTargets(action, move) {
        const targets = [];
        const isPlayerMove = action.side === 'player';
        const opponentSide = isPlayerMove ? this.opponentActive : this.playerActive;
        const allySide = isPlayerMove ? this.playerActive : this.opponentActive;
        
        switch (move.targetingType) {
            case 'Single':
                // Target specified opponent
                let targetCreature = null;
                
                if (action.target !== null && opponentSide[action.target]) {
                    targetCreature = opponentSide[action.target];
                }
                
                // If target is null or fainted, redirect to another alive opponent
                if (!targetCreature || !targetCreature.isAlive()) {
                    // Find first alive opponent
                    targetCreature = opponentSide.find(c => c && c.isAlive());
                }
                
                if (targetCreature && targetCreature.isAlive()) {
                    targets.push(targetCreature);
                }
                break;
                
            case 'Double':
                // Hit both opponents
                opponentSide.forEach(c => {
                    if (c && c.isAlive()) targets.push(c);
                });
                break;
                
            case 'Self':
                targets.push(action.creature);
                break;
                
            case 'Self and Partner':
                allySide.forEach(c => {
                    if (c && c.isAlive()) targets.push(c);
                });
                break;
        }
        
        return targets;
    }

    // Calculate and apply damage
    calculateDamage(attacker, defender, move) {
        // Status moves with 0 power don't deal damage
        if (move.power === 0) {
            return 0;
        }
        
        // Determine offensive and defensive stats based on move category
        let offensiveStat, defensiveStat;
        if (move.category === 'Physical') {
            offensiveStat = attacker.getCurrentStat('attack');
            defensiveStat = defender.getCurrentStat('defense');
        } else { // Special
            offensiveStat = attacker.getCurrentStat('specialAttack');
            defensiveStat = defender.getCurrentStat('specialDefense');
        }
        
        // Start with base power
        let power = move.power;
        
        // Apply STAB (Same Type Attack Bonus)
        if (move.type === attacker.type) {
            power = Math.floor(power * 1.2);
        }
        
        // Calculate base damage
        let damage = power * (offensiveStat / defensiveStat);
        
        // Apply type effectiveness
        const effectiveness = this.getTypeEffectiveness(move.type, defender.type);
        if (effectiveness === 'super') {
            damage = Math.round(damage * 1.25);
        }
        
        // Apply field effect damage reduction (Iron Barrier)
        const defenderFieldEffects = this.getFieldEffectsForCreature(defender);
        defenderFieldEffects.forEach(effect => {
            if (effect.name === 'Iron Barrier' && effect.effectData.damageReduction) {
                damage = Math.round(damage * (1 - effect.effectData.damageReduction));
            }
        });
        
        // Round final damage
        damage = Math.round(damage);
        
        return Math.max(1, damage); // Minimum 1 damage
    }
    
    // Get field effects that apply to a creature
    getFieldEffectsForCreature(creature) {
        // Check which side the creature is on
        const isPlayer = this.playerActive.includes(creature) || this.playerBench.includes(creature);
        return isPlayer ? this.playerFieldEffects : this.opponentFieldEffects;
    }

    // Get type effectiveness
    getTypeEffectiveness(moveType, defenderType) {
        const typeData = TYPE_CHART[moveType];
        if (!typeData) return 'normal';
        
        if (typeData.superEffective.includes(defenderType)) {
            return 'super';
        }
        
        return 'normal';
    }

    // Apply move effect to target
    applyMoveEffect(attacker, defender, move, attackerSide) {
        // Check if attacker is protected
        if (defender.isProtected && move.power > 0) {
            this.log(`${this.getCreatureLabel(defender, this.getDefenderSide(attackerSide))} is protected!`);
            return;
        }
        
        // Calculate and apply damage (with potential modifiers from secondary effects)
        let damage = this.calculateDamage(attacker, defender, move);
        
        // Apply damage modifiers from secondary effects
        if (move.name === 'Tackle Gamble' && Math.random() < 0.5) {
            damage = Math.round(damage * 1.5);
            this.log(`Tackle Gamble dealt bonus damage!`);
        }
        
        if (damage > 0) {
            const defenderSide = this.getDefenderSide(attackerSide);
            defender.takeDamage(damage);
            
            const effectiveness = this.getTypeEffectiveness(move.type, defender.type);
            let effectMessage = '';
            if (effectiveness === 'super') {
                effectMessage = ' It\'s super effective!';
            }
            
            this.log(`${this.getCreatureLabel(attacker, attackerSide)}'s ${move.name} hit ${this.getCreatureLabel(defender, defenderSide)} for ${damage} damage!${effectMessage}`);
            
            if (!defender.isAlive()) {
                this.log(`${this.getCreatureLabel(defender, defenderSide)} fainted!`);
            }
        } else {
            // Status move - determine defender's side based on target type
            let defenderSide;
            if (move.targetingType === 'Self' || move.targetingType === 'Self and Partner') {
                // Self-targeting moves: defender is on attacker's side
                defenderSide = attackerSide;
            } else {
                // Enemy-targeting status moves
                defenderSide = this.getDefenderSide(attackerSide);
            }
            
            this.log(`${this.getCreatureLabel(attacker, attackerSide)} used ${move.name} on ${this.getCreatureLabel(defender, defenderSide)}!`);
        }
        
        // Apply secondary effects
        this.applySecondaryEffects(attacker, defender, move, damage, attackerSide);
    }
    
    // Apply secondary effects of moves
    applySecondaryEffects(attacker, defender, move, damageDealt, attackerSide) {
        const moveName = move.name;
        const defenderSide = this.getDefenderSide(attackerSide);
        
        // Stat changes - Self buffs
        if (moveName === 'Arcane Pulse' && Math.random() < 0.5) {
            attacker.applyStatChange('specialAttack', 10);
            this.log(`${this.getCreatureLabel(attacker, attackerSide)}'s Special Attack increased!`);
        }
        
        if (moveName === 'Ether Bloom') {
            attacker.applyStatChange('defense', 10);
            attacker.applyStatChange('specialDefense', 10);
            this.log(`${this.getCreatureLabel(attacker, attackerSide)}'s Defense and Special Defense increased!`);
        }
        
        if (moveName === 'Windy Lash') {
            attacker.applyStatChange('speed', 10);
            this.log(`${this.getCreatureLabel(attacker, attackerSide)}'s Speed increased!`);
        }
        
        if (moveName === 'System Shock') {
            attacker.applyStatChange('defense', 10);
            attacker.applyStatChange('speed', -10);
            this.log(`${this.getCreatureLabel(attacker, attackerSide)}'s Defense increased and Speed decreased!`);
        }
        
        // Stat changes - Opponent debuffs
        if (moveName === 'Mindful Scream') {
            defender.applyStatChange('attack', -10);
            this.log(`${this.getCreatureLabel(defender, defenderSide)}'s Attack decreased!`);
        }
        
        if (moveName === 'Starfall Burst' && Math.random() < 0.25) {
            defender.applyStatChange('specialDefense', -20);
            this.log(`${this.getCreatureLabel(defender, defenderSide)}'s Special Defense fell sharply!`);
        }
        
        if (moveName === 'Scary Taunt') {
            defender.applyStatChange('speed', -10);
            this.log(`${this.getCreatureLabel(defender, defenderSide)}'s Speed decreased!`);
        }
        
        if (moveName === 'Rally Cry' && Math.random() < 0.25) {
            defender.applyStatChange('defense', -10);
            defender.applyStatChange('specialDefense', -10);
            this.log(`${this.getCreatureLabel(defender, defenderSide)}'s Defense and Special Defense decreased!`);
        }
        
        // Healing effects
        if (moveName === 'Cosmic Divide' && damageDealt > 0) {
            const healAmount = Math.floor(damageDealt / 2);
            attacker.heal(healAmount);
            this.log(`${this.getCreatureLabel(attacker, attackerSide)} healed ${healAmount} HP!`);
        }
        
        if (moveName === 'Stun Blessing') {
            // Heal self and partner
            const allies = attackerSide === 'player' ? this.playerActive : this.opponentActive;
            allies.forEach(ally => {
                if (ally && ally.isAlive()) {
                    ally.heal(20);
                    this.log(`${this.getCreatureLabel(ally, attackerSide)} healed 20 HP!`);
                }
            });
        }
        
        if (moveName === 'Huge Recovery') {
            attacker.heal(50);
            attacker.cantAttackNextTurn = true;
            this.log(`${this.getCreatureLabel(attacker, attackerSide)} healed 50 HP but can't attack next turn!`);
        }
        
        // Recoil damage
        if (moveName === 'Gale Strike') {
            attacker.takeDamage(20);
            this.log(`${this.getCreatureLabel(attacker, attackerSide)} took 20 HP recoil damage!`);
            if (!attacker.isAlive()) {
                this.log(`${this.getCreatureLabel(attacker, attackerSide)} fainted from recoil!`);
            }
        }
        
        // Field effects
        if (moveName === 'Nebula Veil') {
            const fieldEffects = attackerSide === 'player' ? this.playerFieldEffects : this.opponentFieldEffects;
            fieldEffects.push(new FieldEffect('Nebula Veil', attackerSide, 4, { healPerTurn: 10 }));
            this.log(`Nebula Veil surrounds ${attackerSide === 'player' ? 'your' : 'the opponent\'s'} team!`);
        }
        
        if (moveName === 'Iron Barrier') {
            const fieldEffects = attackerSide === 'player' ? this.playerFieldEffects : this.opponentFieldEffects;
            fieldEffects.push(new FieldEffect('Iron Barrier', attackerSide, 4, { damageReduction: 0.1 }));
            this.log(`Iron Barrier protects ${attackerSide === 'player' ? 'your' : 'the opponent\'s'} team!`);
        }
        
        // Protection effects
        if (moveName === 'Shield') {
            attacker.isProtected = true;
            attacker.usedMoves.add('Shield'); // Can't use Shield again this turn (next turn it resets)
            this.log(`${this.getCreatureLabel(attacker, attackerSide)} is protected!`);
        }
        
        if (moveName === 'Double Guard') {
            const allies = attackerSide === 'player' ? this.playerActive : this.opponentActive;
            allies.forEach(ally => {
                if (ally && ally.isAlive()) {
                    ally.isProtected = true;
                    ally.usedMovesInBattle.add('Double Guard'); // Can never use Double Guard again in this battle
                    this.log(`${this.getCreatureLabel(ally, attackerSide)} is protected!`);
                }
            });
        }
    }

    // Update field effects (decrement duration)
    updateFieldEffects() {
        this.playerFieldEffects = this.playerFieldEffects.filter(effect => {
            effect.decrementDuration();
            if (effect.duration <= 0) {
                this.log(`${effect.name} wore off!`);
                return false;
            }
            return true;
        });
        
        this.opponentFieldEffects = this.opponentFieldEffects.filter(effect => {
            effect.decrementDuration();
            if (effect.duration <= 0) {
                this.log(`${effect.name} wore off!`);
                return false;
            }
            return true;
        });
    }
}
