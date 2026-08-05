# VGC - 2v2 Creature Battle System Development Guide

## Project Overview
VGC is a comprehensive turn-based 2v2 creature battle system featuring team building, stat customization, strategic combat, and CSV-driven data management.

## Core Architecture

### File Structure
- `index.html` - Main HTML structure
- `style.css` - Complete styling
- `main.js` - Game controller and initialization
- `gameData.js` - CSV parsing and data loading
- `gameEngine.js` - Core battle logic and mechanics
- `teamBuilder.js` - Team building UI
- `battleUI.js` - Battle interface and rendering
- `Creatures.csv` - Creature data (10 creatures)
- `Moves.csv` - Move data (120 moves)
- `Abilities.csv` - Ability data (20 abilities)
- `images/` - Creature sprites (10 PNG files)

### Modular Architecture Pattern

#### Module Responsibilities
1. **main.js**: Entry point, state management, game flow
2. **gameData.js**: CSV loading, data parsing, data access
3. **gameEngine.js**: Battle mechanics, damage calculation, turn execution
4. **teamBuilder.js**: Team creation UI, stat allocation, move/ability selection
5. **battleUI.js**: Battle rendering, animations, user input

**Pattern Rule**: Keep modules focused. Don't mix battle logic with UI code.

## Data Management

### CSV-Driven Design
All game content is defined in CSV files for easy editing:

**Creatures.csv Format:**
```
Name,Type,BaseHP,BaseAttack,BaseDefense,BaseSpAttack,BaseSpDefense,BaseSpeed,Learnable Moves,Abilities
Zenquaza,Mystic,110,95,90,120,100,105,"Move1,Move2,...","Ability1,Ability2"
```

**Moves.csv Format:**
```
Name,Type,Category,Power,Priority,Description,SecondaryEffect
Psycho Blast,Mystic,Special,90,0,A powerful psychic attack,None
```

**Abilities.csv Format:**
```
Name,Description,Effect Type
Mystic Aura,Boosts Special Attack by 20% when HP is below 50%,Conditional Stat Boost
```

### Data Loading Pattern
```javascript
// Asynchronous CSV loading
async function loadGameData() {
  const creatures = await parseCSV('Creatures.csv');
  const moves = await parseCSV('Moves.csv');
  const abilities = await parseCSV('Abilities.csv');
  
  return { creatures, moves, abilities };
}
```

**Pattern Rule**: Load all data before game starts. Parse CSVs once, cache results.

## Battle System Design

### 2v2 Battle Structure
```javascript
battleState = {
  playerTeam: {
    active: [creature1, creature2],  // 2 active positions
    bench: [creature3, creature4]    // 2 bench positions
  },
  opponentTeam: { /* same structure */ },
  turn: 0,
  maxTurns: 30,
  fieldEffects: []
}
```

### Turn Sequence
1. **Player Selection Phase**
   - Choose action for active1 (Fight/Switch)
   - Choose action for active2 (Fight/Switch)
   - Confirm selections

2. **Turn Resolution Phase**
   - Sort all actions by priority, then speed
   - Execute actions in order
   - Apply damage, effects, switches
   - Check for knockouts
   - Replace fainted creatures

3. **Turn End Phase**
   - Increment turn counter
   - Update field effects
   - Check win conditions

**Pattern Rule**: All actions resolve in speed order, not player-first.

### Damage Calculation Formula

#### Physical Moves
```javascript
damage = movePower * (attacker.attack / defender.defense)
```

#### Special Moves
```javascript
damage = movePower * (attacker.spAttack / defender.spDefense)
```

#### Type Effectiveness Modifiers
- **Super Effective**: ×1.25 damage
- **Same Type Attack Bonus (STAB)**: ×1.2 damage

```javascript
// Type chart
const typeChart = {
  Mystic: { superEffective: ['Wind'], notVeryEffective: ['Celestial'] },
  Wind: { superEffective: ['Celestial'], notVeryEffective: ['Mystic'] },
  Celestial: { superEffective: ['Mystic'], notVeryEffective: ['Wind'] },
  Mechanic: { superEffective: ['Neutral'], notVeryEffective: [] }
}
```

**Pattern Rule**: Apply STAB before type effectiveness.

## Team Building System

### Stat Allocation Pattern
Each creature gets 30 stat points to allocate:
- Min 0 per stat
- Max 20 per stat
- Total must equal 30

```javascript
creature.stats = {
  hp: baseHP + allocated.hp,
  attack: baseAttack + allocated.attack,
  defense: baseDefense + allocated.defense,
  spAttack: baseSpAttack + allocated.spAttack,
  spDefense: baseSpDefense + allocated.spDefense,
  speed: baseSpeed + allocated.speed
}
```

### Move Selection Pattern
- Each creature learns 12 moves (from CSV)
- Player selects 4 moves for battle
- Moves sorted by power for easier selection

### Ability Selection Pattern
- Each creature has 2 ability options
- Player selects 1 ability per creature
- Abilities are shown but NOT implemented

**Pattern Rule**: Show ability info in UI, but note "NOT IMPLEMENTED" status.

## AI Opponent System

### AI Decision Making
```javascript
function aiSelectAction(creature, targetOptions) {
  // Priority 1: Can creature attack?
  const canAttack = creature.moves.some(move => canUseMove(creature, move));
  
  if (canAttack) {
    // Choose highest power move that can be used
    return { action: 'fight', move: selectBestMove(creature) };
  } else {
    // Switch to bench creature
    return { action: 'switch', target: selectBenchCreature() };
  }
}
```

**AI Strategy:**
1. Always attack if possible
2. Choose move with highest power
3. Random target selection
4. Switch if cannot attack

**Pattern Rule**: Keep AI simple but functional. No complex prediction logic.

## Implementation Status Tracking

### ✅ Fully Implemented
- Team building with stat allocation
- Move selection (4 from 12)
- Ability selection UI
- 2v2 battle format
- Turn-based combat
- Priority and speed ordering
- Damage calculation with STAB
- Type effectiveness
- HP management
- Switching mechanics
- Battle log
- AI opponent

### 🚧 Not Implemented (Intentional)
- **Secondary Move Effects**: Stat changes, status conditions, healing
- **Ability Effects**: Abilities selected but don't activate
- **Field Effects**: Weather/terrain effects

**Why**: These features were explicitly excluded per requirements to keep initial implementation focused.

**Pattern Rule**: Document what's NOT implemented to set clear expectations.

## Code Organization Principles

### 1. Pure Functions
Battle calculations should be pure functions:
```javascript
// ✅ Good: Pure function
function calculateDamage(attacker, defender, move) {
  const baseDamage = move.power * (attacker.attack / defender.defense);
  return Math.floor(baseDamage);
}

// ❌ Bad: Side effects
function calculateDamage(attacker, defender, move) {
  const damage = move.power * (attacker.attack / defender.defense);
  defender.currentHP -= damage;  // Modifies state!
  return damage;
}
```

### 2. Event-Driven UI
```javascript
// Attach event listeners once
document.getElementById('selectMove1').addEventListener('click', () => {
  handleMoveSelection(0);
});

// Update UI via render functions
function renderBattleState() {
  updateCreatureDisplay();
  updateMoveButtons();
  updateBattleLog();
}
```

### 3. State Management
Centralized battle state:
```javascript
const battleState = {
  // All battle data here
};

function updateBattleState(changes) {
  Object.assign(battleState, changes);
  renderBattleState();
}
```

## Testing Strategies

### Unit Testing Checklist
- [ ] Damage calculation correctness
- [ ] Type effectiveness multipliers
- [ ] STAB bonus application
- [ ] Speed ordering
- [ ] Priority move ordering
- [ ] Switching mechanics
- [ ] Knockout detection
- [ ] Win condition checks

### Integration Testing
- [ ] Team builder → Battle transition
- [ ] Complete battle from start to finish
- [ ] AI takes valid actions
- [ ] Battle log updates correctly
- [ ] All 10 creatures usable
- [ ] Move selection works for all creatures

## Common Patterns

### CSV Parsing Pattern
```javascript
async function parseCSV(filename) {
  const response = await fetch(filename);
  const text = await response.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim();
    });
    return obj;
  });
}
```

### Move Validation Pattern
```javascript
function canUseMove(creature, move) {
  // Check if creature knows this move
  if (!creature.selectedMoves.includes(move.name)) return false;
  
  // Future: Check PP, status conditions, etc.
  return true;
}
```

### Speed Ordering Pattern
```javascript
function sortActionsBySpeed(actions) {
  return actions.sort((a, b) => {
    // First compare priority
    if (a.move.priority !== b.move.priority) {
      return b.move.priority - a.move.priority;
    }
    
    // Then compare speed
    if (a.creature.speed !== b.creature.speed) {
      return b.creature.speed - a.creature.speed;
    }
    
    // Random tiebreaker
    return Math.random() - 0.5;
  });
}
```

## Type System

### 5 Types
1. **Mystic** (Purple) - Psychic/magical
2. **Wind** (Blue) - Flying/air
3. **Celestial** (Green) - Star/cosmic  
4. **Mechanic** (Orange) - Robot/mechanical
5. **Neutral** (Gray) - Balanced

### Type Effectiveness
- Mystic → Wind (Super Effective)
- Wind → Celestial (Super Effective)
- Celestial → Mystic (Super Effective)
- Mechanic → Neutral (Super Effective)

**Pattern**: Rock-paper-scissors for Mystic/Wind/Celestial, Mechanic counters Neutral.

## Creature Roster

### 10 Creatures
1. **Zenquaza** (Mystic) - High Special Attack
2. **Harmoniqueon** (Mystic) - Balanced
3. **Zephyrquill** (Wind) - Fast
4. **Aeruffin** (Wind) - Physical attacker
5. **Dewmo** (Neutral) - High HP
6. **Galaktikreme** (Neutral) - Special tank
7. **Aerobloom** (Celestial) - Fast Special
8. **Rosalia** (Celestial) - Defensive
9. **Voltveil** (Mechanic) - Speedy
10. **Byteblade** (Mechanic) - Physical

**Pattern**: Each type has 2 creatures (except Neutral). Each creature has distinct stat spreads.

## Future Enhancement Ideas

### Phase 2 Features (Not Current Scope)
- Status conditions (Paralysis, Burn, etc.)
- Stat stage changes (+1 Attack, -2 Defense, etc.)
- Weather effects (Rain boosts Water moves)
- Terrain effects (Electric Terrain boosts Electric)
- Held items
- Recoil moves
- Healing moves
- Multi-hit moves
- Priority moves variations

**Pattern Rule**: Document future features but don't implement prematurely.

## Performance Considerations

- CSV files loaded once at startup
- Creature images cached by browser
- Battle calculations are lightweight
- Turn resolution is synchronous (no delays needed)
- Render only on state changes

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support (async/await, arrow functions, spread operator)
- Local file access for CSV loading
- No server required (client-side only)

## Summary

**Core Principles:**
1. **Modular**: Separate concerns across files
2. **Data-Driven**: CSV files for easy content editing
3. **Pure Functions**: Battle logic without side effects
4. **Type Safety**: Clear type effectiveness system
5. **AI Simplicity**: Functional but not complex
6. **Phase-Based**: Implement core first, advanced features later

**When Adding Content:**
- Update CSV files, not JavaScript
- Test with all 10 creatures
- Verify stat calculations
- Check AI interactions
- Update documentation

**Key Files to Modify:**
- Content changes: CSV files
- Battle logic: gameEngine.js
- UI changes: battleUI.js or teamBuilder.js
- Data access: gameData.js
