# TCG Game - Galactic Adventures

## 🎮 What is This Game?

**Galactic Adventures** is a browser-based trading card game (TCG) where you battle against an AI opponent using creature cards and strategic item cards. Think Pokémon TCG meets cosmic creatures!

## 🚀 Quick Start

1. Open `index.html` in your browser
2. Select a deck (or create your own)
3. Place your starting creature
4. Battle the AI by playing creatures, attaching energy, and attacking!

## 🎯 How to Win

- **Knock out 3 opponent creatures** to win immediately
- OR have **more points after 30 turns**

## 📚 Core Game Concepts

### The Basics
- **Active Creature**: Your front-line fighter (attacks and defends)
- **Bench**: Up to 3 backup creatures waiting to battle
- **Energy**: Generic resource you attach to power creature attacks
- **HP (Hit Points)**: When damage ≥ HP, creature is knocked out
- **Evolution**: Upgrade creatures from Stage 1 → Stage 2 → Stage 3

### Card Types
1. **Creatures** - Your battlers (79 in Elemental Awakening + 76 in Galactic Adventures)
2. **Items** - Special one-time effects (5 + 10 across both sets)

### Creature Types & Strategy
- **Mystic** (Purple 🟣) - Psychic/mind powers
- **Wind** (Blue 🔵) - Flying/air creatures  
- **Celestial** (Green 🟢) - Nature/plant creatures
- **Mechanic** (Orange 🟠) - Metal/robot creatures
- **Neutral** (Gray ⚪) - Universal type, mixes with any deck

## 🎴 Turn Structure

Each turn you can:
1. **Use 1 Item Card** (optional) - Healing, energy, or special effects
2. **Play Stage 1 Creatures** to empty bench slots
3. **Evolve Creatures** (not before turn 3, not same turn as played)
4. **Attach 1 Energy** to any creature
5. **Attack** with your active creature (ends turn) OR **Retreat** (swap active with bench)

## 🌟 Key Features

### Status Conditions
- **Hallucination** (😵) - Coin flip: heads = +10 damage, tails = 40 self-damage
- **Flux** (⚡) - When attaching energy, flip 2 coins - both tails = energy blocked
- **Lock** (🔒) - When using items, flip coin - tails = item returns to hand

### Creature Abilities
Many creatures have special abilities you can activate:
- **Guardian Mode** (Meerkool) - Reduce all damage taken by 10 next turn
- **Warrior Mode** (Meerkool) - Add +20 damage to attacks this turn
- **Absorb Energy** (Lumifloris) - When healed, attach +1 energy
- **Mirage Shield** (Planterdon) - Opponent can't use items next turn
- And many more! (See NEW_ABILITIES_GUIDE.md)

### Universal Healing Function
The game uses `healCreature(card, amount)` for all healing:
- Automatically triggers Absorb Energy if active
- Consistent across items, abilities, and move effects
- Returns true if Absorb Energy triggered

### Evolution System
- **Evolution Chain Tracking**: When creatures evolve, all previous forms are tracked
- **Discard Pile**: When a Stage 3 is knocked out, all 3 cards (Stage 1, 2, and 3) go to discard
- **Damage & Energy Persist**: Evolved creatures keep damage and energy from previous form
- **One Evolution Per Turn**: Can't evolve the same creature twice in one turn (tracked by unique evolutionId)

## 🏗️ Deck Building

### Rules
- **Exactly 20 cards** per deck
- **Max 2 copies** of any single card
- **At least 1 Stage 1** creature required
- **One primary type** (Mystic OR Wind OR Celestial OR Mechanic)
- **Neutral & Items** can mix with any type

### Two Card Sets Available
1. **Elemental Awakening** - Original 84 cards
2. **Galactic Adventures** - Expansion with 86 new cards
3. You can **mix cards from both sets** in one deck!

## 🤖 AI Opponent

The AI follows these priorities:
1. Retreat if active creature is low HP
2. Use items strategically (Potion if damaged, Booster before attacking)
3. Play Stage 1 creatures to bench
4. Evolve creatures when possible
5. Attach energy (to active if needed, otherwise bench)
6. Attack if possible

## 🐛 Recent Bug Fixes

- ✅ Fixed Guardian Mode not lasting through opponent's turn
- ✅ Fixed Mirage Shield being cleared too early
- ✅ Fixed Sprout Boost countdown
- ✅ Fixed secondary move effects not triggering when attack knocks out opponent
- ✅ Fixed evolution allowing same creature to evolve twice per turn
- ✅ Fixed evolution chain discard (all forms now go to discard pile on knockout)
- ✅ Fixed lock indicator rendering error
- ✅ Fixed Coffee Heal and Bean Blast to allow player choice of bench target

## 📖 Documentation Files

### For Players
- **README.md** (this file) - Game overview and quick start
- **NEW_ABILITIES_GUIDE.md** - Detailed ability explanations with examples

### For Developers
- **TCG Game Specs.md** - Complete technical specification (2500+ lines)
  - All 170 cards documented
  - Complete move effects reference
  - Data structures and code organization
  - AI implementation details
  
- **GALACTIC_ADVENTURES_IMPLEMENTATION_SUMMARY.md** - Expansion implementation details
  - Status conditions (Flux, Lock)
  - New abilities and items
  - Deck builder UI updates
  - Healing system documentation

- **ABILITY_TEST_REPORT.md** - Testing documentation for abilities
- **GALACTIC_ADVENTURES_TEST_CHECKLIST.md** - QA checklist for expansion

## 🎨 Card Image Format

All card images are located in the `cards/` folder:
- **Elemental Awakening**: `Elemental Awakening_XX.png` (01-84)
- **Galactic Adventures**: `Galactic Adventures_XXX.png` (001-086)

## 💾 Technical Stack

- **Pure HTML/CSS/JavaScript** - No frameworks or libraries
- **LocalStorage** - Custom deck persistence
- **Client-side only** - No server required
- **~2500 lines** of JavaScript

## 🔧 Key Code Locations

### In `script.js`:
- **Lines 1-160**: Card databases (Elemental Awakening)
- **Lines 558-561**: Turn tracker (evolution restrictions)
- **Lines 1595-1660**: Evolution system with chain tracking
- **Lines 2269-3000**: Player attack and move effects
- **Lines 3365-3620**: Move effects that work when defender is knocked out
- **Lines 4077-4150**: Coffee Heal and Bean Blast with player selection
- **Lines 4520-4570**: Bench heal modal for player choice
- **Lines 4487-4508**: Universal `healCreature()` function
- **Lines 4571-4630**: Knockout system with evolution chain discard
- **Lines 5389-5610**: Turn management and effect clearing
- **Lines 6363-7200**: AI attack and decision-making

## 🎯 Game Balance

### Damage Ranges
- **Low**: 10-30 damage (early game moves)
- **Medium**: 40-60 damage (mid game)
- **High**: 70-100 damage (late game, evolved forms)
- **Special**: 0-160 damage (coin flip/dice moves)

### HP Ranges
- **Stage 1**: 30-120 HP
- **Stage 2**: 60-130 HP  
- **Stage 3**: 90-140 HP

### Energy Costs
- Most moves cost 1-4 energy
- More powerful moves cost more energy
- Neutral energy (N) can substitute for any type

## 🚧 Known Limitations

1. **No Multiplayer** - Only vs AI
2. **AI Strategy** - Basic decision-making (no complex planning)
3. **No Animations** - Instant state changes
4. **Auto-target Selection** - Some abilities/items auto-select targets
5. **No Sound** - Visual feedback only

## 🔮 Future Enhancement Ideas

- Multiplayer support (online or local)
- Advanced AI with strategic planning
- Smooth animations for attacks and effects
- Card collection system with unlockables
- Tournament/league mode
- More card sets and expansions
- Sound effects and music
- Mobile-optimized UI

## 🤝 Contributing

This is a personal project, but suggestions for balance changes, new card ideas, or bug reports are welcome!

## 📞 Support

If you encounter bugs or have questions:
1. Check the documentation files first
2. Look at the browser console (F12) for error messages
3. Verify all card images are in the `cards/` folder
4. Clear localStorage if deck builder acts strange

## 🎉 Credits

- **Game Design**: Based on classic TCG mechanics (Pokémon TCG, Magic: The Gathering)
- **Implementation**: Kiro AI & User collaboration
- **Card Art**: All cards designed and illustrated
- **Balancing**: Ongoing iterative process

---

**Enjoy battling in the Galactic Adventures universe!** 🌌✨

*Last Updated: 2026-08-01*
*Version: 1.5 (Galactic Adventures Expansion + Bug Fixes)*
