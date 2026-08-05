# TCG Game - Galactic Adventures Development Guide

## Project Overview
TCG Game (Galactic Adventures expansion) is a browser-based trading card game with 170 cards across 2 sets, featuring creature battles, evolution chains, status conditions, and special abilities.

## Core Architecture

### File Structure
- `index.html` - Main HTML structure
- `style.css` - All styling (~500 lines)
- `script.js` - Game logic (~7200 lines)
- `cards/` - Card images (170 PNG files)
- `Galactic Adventures.csv` - Expansion card data
- `Tcg game - Elemental Awakening.csv` - Base set data

### Two Card Sets
1. **Elemental Awakening**: 84 cards (base set)
   - 79 creatures + 5 items
   - Files: `Elemental Awakening_01.png` through `_84.png`

2. **Galactic Adventures**: 86 cards (expansion)
   - 76 creatures + 10 items  
   - Files: `Galactic Adventures_001.png` through `_086.png`

**Pattern Rule**: Players can mix cards from both sets in one deck.

## Card Database Pattern

### Card Object Structure
```javascript
{
  id: "Elemental Awakening_XX.png" or "Galactic Adventures_XXX.png",
  name: "Card Name",
  stage: "Stage 1/2/3" or "Item",
  type: "Mystic/Wind/Celestial/Mechanic/Neutral/Item",
  hp: Number,
  retreat: Number,
  move1Cost: "MMN",  // Energy string
  move1Name: "Move Name",
  move1Damage: Number,
  move1Effect: "effectName" or null,
  move2Cost: "Energy string" or null,
  move2Name: "Move Name" or null,
  move2Damage: Number or null,
  move2Effect: "effectName" or null,
  prevStage: "Previous evolution name" or null
}
```

**Pattern Rule**: Card ID determines which set (filename format), not a separate field.

## Game State Management

### Central gameState Object
```javascript
gameState = {
  player: {
    deck: [],
    hand: [],
    active: null,
    bench: [null, null, null],  // 3 slots
    points: 0,
    discardPile: [],
    energyAttachedThisTurn: false,
    hasAttacked: false,
    itemUsedThisTurn: false,
    boosterActive: false
  },
  opponent: { /* same structure */ },
  currentTurn: 'player' | 'opponent',
  turnNumber: 0,
  phase: 'deckSelection' | 'setup' | 'playing' | 'gameOver'
}
```

### Turn Tracker Pattern
```javascript
turnTracker = {
  playedThisTurn: Set,    // Cards that can't evolve this turn
  evolvedThisTurn: Set    // Cards that can't evolve again
}
```

**Pattern Rule**: Use Sets for O(1) lookups. Clear at turn end.

## Evolution System

### Evolution Chain Tracking
```javascript
creature.evolutionChain = ['Stage1Name', 'Stage2Name', 'Stage3Name']
```

When a Stage 3 is knocked out, ALL 3 cards go to discard pile.

**Pattern Rule**: Track full evolution history for proper discard behavior.

### Evolution Restrictions
- Cannot evolve before turn 3
- Cannot evolve creature played this turn (tracked in `turnTracker.playedThisTurn`)
- Cannot evolve same creature twice per turn (tracked in `turnTracker.evolvedThisTurn`)
- Damage and energy persist through evolution

## Status Conditions System

### Three Status Conditions
1. **Hallucination** (😵)
   - When attacking: Flip coin
   - Heads: +10 damage
   - Tails: Take 40 self-damage

2. **Flux** (⚡)
   - When attaching energy: Flip 2 coins
   - Both tails: Energy attachment blocked

3. **Lock** (🔒)
   - When using items: Flip coin
   - Tails: Item returns to hand (not consumed)

**Pattern Rule**: Status effects trigger on actions, not at turn start/end.

## Universal Healing System

### healCreature() Function
```javascript
function healCreature(card, amount) {
  if (!card) return false;
  
  // Reduce damage
  card.damage = Math.max(0, card.damage - amount);
  
  // Check for Absorb Energy ability
  if (card.ability === 'Absorb Energy' && card.damage < card.data.hp) {
    card.energy++;
    showMessage(`${card.data.name}'s Absorb Energy activated! +1 energy attached.`);
    return true;  // Indicates Absorb Energy triggered
  }
  
  return false;
}
```

**Pattern Rule**: ALL healing must use this function for Absorb Energy consistency.

## Ability System

### Ability Types
1. **Passive Abilities**: Active mode toggles
   - Guardian Mode (Meerkool) - Reduce damage by 10
   - Warrior Mode (Meerkool) - +20 damage
   - Mirage Shield (Planterdon) - Opponent can't use items

2. **Triggered Abilities**: Automatic on conditions
   - Absorb Energy (Lumifloris) - +1 energy when healed
   - Sprout Boost (Planterdon) - Start with 1 energy

3. **Turn-Based Abilities**: Duration tracking
   - Guardian Mode lasts through opponent's turn
   - Mirage Shield lasts 1 opponent turn
   - Sprout Boost countdown (3 turns)

**Pattern Rule**: Clear ability states at appropriate times (switch, faint, turn end).

## Move Effects System

### Pre-Damage Effects
Modify damage BEFORE applying to defender:
```javascript
if (effect === 'dizzyShot') {
  if (flipCoin() === 'heads') {
    baseDamage += 20;
  }
}
```

### Post-Damage Effects  
Apply AFTER main damage, even if defender KO'd:
```javascript
if (effect === 'mysticBlaze') {
  // Deal 30 to all opponent creatures
  opponentCreatures.forEach(creature => {
    if (creature) creature.damage += 30;
  });
}
```

**Pattern Rule**: Post-damage effects in `handleMoveEffectBeforeKnockout()` for KO scenarios.

## Item Cards Pattern

### Item Usage Flow
1. Check if item already used this turn
2. Apply item effect
3. Set `itemUsedThisTurn = true`
4. Move item to discard pile
5. Check for Lock status (if present, may return to hand)

### Available Items
**Elemental Awakening:**
- Potion - Heal 20 HP
- Card Draw - Draw 2 cards
- Booster - +20 damage next attack

**Galactic Adventures:**
- Coffee Heal - Heal bench creature (player choice)
- Stellar Sip - Heal 30 HP active + draw 1 card
- Energy Capsule - Attach energy to bench
- Plus more...

**Pattern Rule**: Booster flag must be checked during attack calculation.

## Deck Building System

### Deck Composition Rules
1. Exactly 20 cards
2. Maximum 2 copies per card
3. At least 1 Stage 1 creature required
4. One primary type (Mystic OR Wind OR Celestial OR Mechanic)
5. Neutral and Item cards mix with any type

### Validation Pattern
```javascript
function validateDeck(cards) {
  // Check card count
  if (cards.length !== 20) return { valid: false, error: "Deck must have 20 cards" };
  
  // Check duplicate count
  const counts = {};
  cards.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
    if (counts[id] > 2) {
      return { valid: false, error: `Max 2 copies of ${getCardName(id)}` };
    }
  });
  
  // Check type mixing
  const types = cards.map(id => getCardData(id).type).filter(t => t !== 'Neutral' && t !== 'Item');
  const uniqueTypes = [...new Set(types)];
  if (uniqueTypes.length > 1) {
    return { valid: false, error: "Cannot mix creature types" };
  }
  
  return { valid: true };
}
```

## AI Behavior Pattern

### AI Turn Sequence (with delays)
1. **Consider Retreat** (0ms) - Check if active HP low
2. **Use Items** (1000ms) - Potion if damaged, Booster if can attack
3. **Play Stage 1** (1000ms) - Fill empty bench slots
4. **Evolve** (1000ms) - Loop until no more evolutions
5. **Attach Energy** (1000ms) - To active if needs it, else bench
6. **Attack** (1000ms) - Choose highest damage affordable move

**Pattern Rule**: Use setTimeout chain for delays, not setInterval.

### AI Retreat Logic
```javascript
function aiConsiderRetreat() {
  const active = gameState.opponent.active;
  const hpPercent = (active.data.hp - active.damage) / active.data.hp;
  const isLowHP = (hpPercent < 0.4) || ((active.data.hp - active.damage) < 30);
  
  if (isLowHP && active.energy >= active.data.retreat) {
    // Find best bench creature to swap
    const benchCreatures = gameState.opponent.bench.filter(c => c !== null);
    // Sort by HP% * 100 + attack power
    // Retreat if good swap found
  }
}
```

**Pattern Rule**: AI only uses Booster if it can attack same turn.

## Knockout System

### Knockout Flow
1. Check if creature damage >= HP
2. Add ALL evolution chain cards to discard
3. Increment attacker's points
4. Clear active slot
5. Force defender to select new active from bench
6. If no bench creatures, defender loses immediately

**Pattern Rule**: Evolution chains go to discard together, not individually.

## Code Organization

### Function Naming Conventions
- `handle*()` - User actions (handleAttack, handleRetreat)
- `render*()` - UI updates (renderGame, renderHand)
- `ai*()` - AI logic (aiTurn, aiAttack, aiEvolveAll)
- `show*()` - Modal/UI display (showDeckSelection, showBenchHealModal)
- `use*()` - Item/ability activation (useItemCard, useAbility)

### Location Reference (script.js)
- Lines 1-160: Card databases
- Lines 558-561: Turn tracker
- Lines 1595-1660: Evolution system
- Lines 2269-3000: Player attack logic
- Lines 3365-3620: Move effects (KO scenarios)
- Lines 4077-4150: Coffee Heal & Bean Blast (player choice)
- Lines 4487-4508: Universal healCreature() function
- Lines 4571-4630: Knockout with evolution chain
- Lines 5389-5610: Turn management
- Lines 6363-7200: AI logic

## Common Patterns

### Coin Flip Pattern
```javascript
function flipCoin() {
  return Math.random() < 0.5 ? 'heads' : 'tails';
}
```

### Dice Roll Pattern
```javascript
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}
```

### Message Display Pattern
```javascript
function showMessage(text) {
  alert(text);  // Simple for now
  // Future: Use toast notifications
}
```

### LocalStorage Pattern
```javascript
// Save custom decks
localStorage.setItem('tcg_customDecks', JSON.stringify(decks));

// Load custom decks
const saved = localStorage.getItem('tcg_customDecks');
const decks = saved ? JSON.parse(saved) : [];
```

## Bug Fix Patterns

### Common Bug: Guardian Mode Duration
**Problem**: Guardian Mode cleared too early (same turn)
**Solution**: Only clear at end of OPPONENT'S turn, not attacker's turn

### Common Bug: Evolution Twice Per Turn
**Problem**: Same creature evolved multiple times
**Solution**: Track evolutionId in turnTracker.evolvedThisTurn

### Common Bug: Lock Indicator
**Problem**: renderLockIndicator() not defined
**Solution**: Use showLockIndicator() or add function

### Common Bug: Move Effects After KO
**Problem**: Secondary effects don't trigger if defender KO'd
**Solution**: Use handleMoveEffectBeforeKnockout() for effects that should always trigger

## Testing Checklist

### Core Mechanics
- [ ] Cards from both sets load correctly
- [ ] Deck builder validates all rules
- [ ] Custom decks save/load from localStorage
- [ ] Setup phase requires Stage 1 in active
- [ ] Evolution respects turn 3 restriction
- [ ] Damage persists through evolution
- [ ] Energy persists through evolution

### Status Conditions
- [ ] Hallucination triggers on attack
- [ ] Flux triggers on energy attachment
- [ ] Lock triggers on item use
- [ ] Status icons display correctly

### Abilities
- [ ] Guardian Mode reduces damage by 10
- [ ] Warrior Mode adds 20 damage
- [ ] Absorb Energy triggers on any heal
- [ ] Mirage Shield blocks items for 1 turn
- [ ] Sprout Boost countdown works

### AI Behavior
- [ ] AI retreats when low HP
- [ ] AI doesn't use Booster if can't attack
- [ ] AI evolves creatures correctly
- [ ] AI attaches energy strategically
- [ ] AI doesn't use custom decks

## Performance Notes

- ~170 card images (~10-15MB total)
- Client-side only (no server)
- LocalStorage for deck persistence
- No animations (instant state changes)
- Render on state change only

## Win Conditions

1. **Knockout 3 creatures** (reach 3 points) - Primary win
2. **Turn 30 reached** - Higher points wins
3. **Opponent has no creatures** - Rare immediate win

## Summary

**Core Principles:**
1. **Two-Set System**: Mix cards from both sets
2. **Evolution Chains**: Track full history for discard
3. **Universal Healing**: Use healCreature() for consistency
4. **Status Effects**: Trigger on actions, not turns
5. **Ability States**: Clear at appropriate times
6. **AI Delays**: Use setTimeout chain for turn pacing

**When Adding Cards:**
1. Add to appropriate cardDatabase array
2. Create card image in cards/ folder
3. Follow naming convention
4. Add move effects if special
5. Test in deck builder and battle
6. Update documentation

**Key Files to Modify:**
- New cards: Add to cardDatabase in script.js
- Move effects: handleAttack() and aiAttack()
- UI changes: render*() functions
- Abilities: useAbility() function
- Items: useItemCard() function
