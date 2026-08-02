# VGC - 2v2 Creature Battle System

A comprehensive turn-based battle game featuring 2v2 creature battles with team building, stat customization, and strategic gameplay.

## Game Features

### Team Building
- Build a team of 6 unique creatures from 10 available species
- Allocate 30 stat points per creature (max 20 per individual stat)
- Choose 4 moves from 12 learnable moves per creature
- Select 1 ability from 2 options per creature

### Battle System
- **2v2 Format**: 2 active creatures + 2 bench creatures per side
- **Turn-Based Combat**: Choose actions for both active creatures each turn
- **Actions**: Fight (use moves) or Switch (swap with bench)
- **Move Priority**: Moves execute based on priority → speed → random
- **Maximum 30 Turns**: Battle ends in draw after turn limit

### Damage Calculation
- **Base Formula**: 
  - Physical: Damage = Power × (Attack / Defense)
  - Special: Damage = Power × (Special Attack / Special Defense)
- **STAB (Same Type Attack Bonus)**: +20% damage when move type matches creature type
- **Type Effectiveness**: +25% damage for super effective hits
  - Mystic → Wind
  - Wind → Celestial
  - Celestial → Mystic
  - Mechanic → Neutral

### Type System
- **Mystic**: Psychic/magical creatures
- **Wind**: Air-based creatures
- **Celestial**: Star/cosmic creatures
- **Mechanic**: Robot/mechanical creatures
- **Neutral**: Balanced creatures

### Creatures
1. **Zenquaza** (Mystic)
2. **Harmoniqueon** (Mystic)
3. **Zephyrquill** (Wind)
4. **Aeruffin** (Wind)
5. **Dewmo** (Neutral)
6. **Galaktikreme** (Neutral)
7. **Aerobloom** (Celestial)
8. **Rosalia** (Celestial)
9. **Voltveil** (Mechanic)
10. **Byteblade** (Mechanic)

## File Structure

```
VGC/
├── index.html          # Main HTML structure
├── style.css           # Complete styling
├── main.js            # Game controller and initialization
├── gameData.js        # CSV parsing and data loading
├── gameEngine.js      # Core battle logic and mechanics
├── teamBuilder.js     # Team building UI
├── battleUI.js        # Battle interface and rendering
├── Creatures.csv      # Creature data
├── Moves.csv          # Move data
├── Abilities.csv      # Ability data
├── images/            # Creature sprites (10 PNG files)
└── README.md          # This file
```

## How to Play

1. **Open `index.html`** in a web browser
2. **Team Building Phase**:
   - Click "Add Creature" to select creatures
   - Allocate 30 stat points for each creature
   - Select 4 moves from 12 available
   - Choose 1 ability from 2 options
   - Build a team of 6 creatures
3. **Pre-Battle Selection**:
   - View opponent's team
   - Select 4 creatures to bring into battle
   - First 2 selected start as active creatures
4. **Battle**:
   - Choose actions for both active creatures
   - Select moves and targets, or switch to bench
   - Watch the battle unfold turn by turn
   - Win by defeating all 4 opponent creatures

## Game Rules

### Switching
- Switching counts as the creature's action
- Switched-in creatures cannot act that turn
- Stat modifiers reset when switching out

### Knockouts
- Creatures reaching 0 HP faint
- Fainted creatures are automatically replaced from bench
- Battle ends when one side has no creatures left

### Stat Changes
- Some moves increase or decrease stats (NOT IMPLEMENTED YET)
- Changes persist until creature switches out or faints
- Maximum +80% increase or -80% decrease

### Field Effects
- Some moves create field effects (NOT IMPLEMENTED YET)
- Effects apply to all creatures on one side
- Last for a specified number of turns

### Abilities
- Each creature has one selected ability (NOT IMPLEMENTED YET)
- Abilities provide passive benefits or trigger on switch-in
- Effects vary by ability

## Implementation Status

### ✅ Fully Implemented
- Team building with stat allocation
- Move selection (4 from 12)
- Ability selection (1 from 2)
- Pre-battle creature selection
- 2v2 battle system
- Turn-based combat
- Move priority and speed ordering
- Damage calculation with STAB
- Type effectiveness
- HP management
- Switching mechanics
- Battle log and UI
- AI opponent

### 🚧 Not Implemented (Future Phase)
- **Secondary Effects of Moves**: Stat changes, healing, recoil, etc.
- **Ability Effects**: All abilities are selected but don't have active effects
- **Field Effects**: Terrain/weather effects from moves

These features were intentionally left out per user requirements to avoid overwhelming complexity in the initial implementation.

## Technical Details

- **Pure JavaScript**: No frameworks required
- **CSV Data Loading**: Dynamic data parsing from CSV files
- **Modular Architecture**: Separate files for different concerns
- **Responsive Design**: Works on desktop and tablet screens
- **Type Safety**: Object-oriented design with clear class structures

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support
- Local file access needed for CSV loading

## Credits

Created as a comprehensive VGC battle system implementation with complete game mechanics, data management, and user interface.
