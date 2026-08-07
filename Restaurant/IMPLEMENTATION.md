# Restaurant Game - Implementation Documentation

## Overview
A restaurant management game where players must earn coins by serving customers before the timer runs out. Built with vanilla JavaScript, HTML, and CSS with Firebase for leaderboards.

## Game Mechanics

### Core Gameplay Loop
1. Customers arrive requesting specific dishes
2. Player adds ingredients to appliances
3. Player starts cooking recipes
4. When ready, player serves the dish to the correct customer
5. Customer pays based on wait time
6. Customer leaves after 2 seconds, new customer spawns after 5 seconds
7. Level completes when goal is reached or timer expires

### Level Progression
- **Level 1**: Unlock Coffee Machine, make Black Americanos (3 minutes, £15 goal)
- **Level 2**: Add Chopping Board, make Tomato Salads (3 minutes, £30 goal)
- **Level 3**: Coffee Machine gets 2nd slot, add Milk, make Lattes (3 minutes, £50 goal)

Players must complete previous level to unlock next level.

## Technical Architecture

### File Structure
```
Restaurant/
├── index.html          # Game structure with modals
├── style.css           # Complete styling (~500 lines)
├── script.js           # Game logic (~900 lines)
└── IMPLEMENTATION.md   # This file
```

### Key Data Structures

#### Recipes
```javascript
{
    id: 'blackAmericano',
    nameKey: 'blackAmericano',  // Translation key
    icon: '☕',
    ingredients: { coffeeBeans: 1 },
    appliance: 'coffeeMachine',
    prepTime: 5,  // seconds
    burnTime: null,  // Future feature
    price: 3
}
```

#### Appliances
```javascript
{
    id: 'coffeeMachine',
    nameKey: 'coffeeMachine',
    icon: '☕',
    recipes: ['blackAmericano', 'latte']
}
```

#### Level Configuration
```javascript
{
    id: 1,
    timer: 120,  // seconds
    goal: 15,    // coins
    appliances: [{ type: 'coffeeMachine', slots: 1 }],
    ingredients: ['coffeeBeans'],
    recipes: ['blackAmericano'],
    customerSlots: 2,
    customerArrival: [3, 5],  // spawn at 3s, 5s
    customerInterval: 5,  // respawn after serving
    orderDistribution: { blackAmericano: 1.0 }
}
```

### Game State Management
Single `gameState` object tracks:
- Current level
- Time remaining
- Coins earned
- Customer array (12 slots max)
- Appliance array with cooking slots
- Selected ingredient/appliance/dish
- Game active status
- Player name and best scores

### Payment System
Customer payment based on wait time:
- **< 20s**: 100% (😊 Happy)
- **20-30s**: 75% (🙂 Smile)
- **30-40s**: 50% (😐 Neutral)
- **40-50s**: 25% (☹️ Sad)
- **> 50s**: 0% (😠 Angry)

Customers never leave, they just pay less.

## User Interaction Flow

### Making a Dish
1. Click ingredient (e.g., Coffee Beans)
2. Click appliance (Coffee Machine) → Ingredient added
3. Click appliance again → Opens appliance modal
4. Click "Cook" on empty slot → Opens recipe modal
5. Select recipe (if ingredients match)
6. Recipe starts cooking (timer shows countdown)
7. When ready, "Serve" button appears

### Serving a Customer
1. Click appliance with ready dish
2. Click "Serve" on ready slot → Opens customer selection modal
3. Click customer with matching order
4. Customer receives dish and shows emotion
5. Customer consumes for 2 seconds
6. Customer leaves, slot becomes empty
7. New customer spawns after 5 seconds

### Ingredient Tossing
- Ingredients added to appliance can be tossed after 5 seconds
- Prevents accidental waste
- Use toss button (×) in appliance modal

## Firebase Integration

### Collections
**restaurantPlayers** collection:
```javascript
{
    playerName: "Player1",
    bestScores: {
        1: 18,  // Level 1 best score
        2: 35,  // Level 2 best score
        3: 55   // Level 3 best score
    },
    timestamp: serverTimestamp
}
```

### Player Identification
- Checks parent window for player name
- Falls back to localStorage
- Prompts user if not found
- Same name across browsers = same player

### Leaderboard System
- Separate leaderboard per level (3 tabs)
- Shows top 10 players
- Sorted by highest coins (descending)
- Updates on level completion with new best score

## Bilingual Support (EN/PT)

### Translation Pattern
- All UI text uses `data-translate` attributes
- Translation object with `en` and `pt` keys
- `t(key)` function for dynamic text
- Listens to parent window language changes
- Updates all text on language switch

### Translated Elements
- UI labels (timer, coins, customers, etc.)
- Customer types (young woman, older man, etc.)
- Appliance names (Coffee Machine, Chopping Board)
- Ingredient names (Coffee Beans, Tomato, Milk)
- Recipe names (Black Americano, Latte, Tomato Salad)
- Modal text (select level, level complete, etc.)

## Extensibility Design

### Adding New Recipes
1. Add to `RECIPES` object with ingredients, appliance, prep time, price
2. Add icon emoji
3. Add translation keys to EN and PT
4. Add to appliance's recipe list
5. Add to level configuration

### Adding New Appliances
1. Add to `APPLIANCES` object with recipes
2. Add icon emoji
3. Add translation keys
4. Add to level configuration with slot count
5. No code changes needed in core logic

### Adding New Ingredients
1. Add to `INGREDIENTS` object with icon
2. Add translation keys
3. Add to level configuration
4. Reference in recipe ingredient requirements

### Adding New Levels
1. Add to `LEVELS` object (key = level number)
2. Define timer, goal, appliances, ingredients, recipes
3. Set customer slots and spawn pattern
4. Define order distribution probabilities
5. Leaderboard automatically handles new levels

### Future Features (Not Implemented)
- **Burn Time**: Dishes burn if left too long (easy to add per recipe)
- **More Appliances**: Hob, Oven, Grill, Juicer (data structure ready)
- **Multi-Item Orders**: Customers request multiple dishes (array support ready)
- **More Ingredients**: Expandable via INGREDIENTS object
- **More Customer Types**: Add to CUSTOMER_TYPES array
- **More Levels**: Add to LEVELS object (up to any number)

## UI/UX Features

### Visual Feedback
- Selected state on ingredients/appliances (gold border + glow)
- Badge count on appliances with ready dishes
- Fire emoji (🔥) on appliances currently cooking
- Customer wait time in MM:SS format
- Red timer when wait time > 20 seconds
- Emoji reactions after serving
- Customer consuming state (opacity effect)

### Modal System
- Language selection (initial)
- Level selection (with best scores)
- Victory (with retry/next/menu options)
- Defeat (with retry/menu options)
- Appliance management (ingredients + slots)
- Recipe selection (shows ingredient availability)
- Customer serve selection (only shows valid targets)
- Leaderboard (3 tabs, top 10 per level)

### Responsive Design
- Adapts to mobile screens
- Grid layouts adjust columns
- Font sizes scale down
- Touch-friendly buttons
- Scrollable modals

## Performance Considerations

- Single game timer (1 second interval)
- Cooking timers calculated via timestamps (no interval per dish)
- Customer timers increment in main loop
- Re-render on state changes only
- Firebase queries minimized (load once, save on best score)
- No heavy animations (CSS transitions only)

## Code Organization

### Main Sections
1. **Translations** (lines 1-60): All text in EN/PT
2. **Language Management** (lines 61-100): Language sync with parent
3. **Game Data** (lines 101-200): Recipes, appliances, ingredients, levels
4. **Firebase** (lines 201-220): Configuration and initialization
5. **Game State** (lines 221-240): Central state object
6. **Initialization** (lines 241-250): DOMContentLoaded setup
7. **Level Selection** (lines 251-300): Level unlock and display
8. **Game Start** (lines 301-350): Level initialization
9. **Game Timer** (lines 351-400): Main game loop
10. **Customer Management** (lines 401-500): Spawn, serve, payment
11. **Appliance & Ingredients** (lines 501-600): Cooking logic
12. **Rendering** (lines 601-750): UI updates
13. **Modal Management** (lines 751-850): Modal open/close logic
14. **Game End** (lines 851-900): Victory/defeat handling
15. **Firebase/Player** (lines 901-950): Save/load player data
16. **Leaderboard** (lines 951-1000): Leaderboard display

### Naming Conventions
- **Functions**: camelCase (e.g., `startLevel`, `serveCustomer`)
- **Constants**: UPPER_CASE (e.g., `RECIPES`, `LEVELS`)
- **Game State**: camelCase properties
- **Translation Keys**: camelCase
- **CSS Classes**: kebab-case (e.g., `customer-slot`, `appliance-icon`)

## Testing Checklist

### Core Mechanics
- [x] Timer counts down correctly
- [x] Customers spawn at correct times
- [x] Ingredients can be added to appliances (max 5)
- [x] Ingredients can be tossed after 5 seconds
- [x] Recipes can only be started with correct ingredients
- [x] Cooking completes after prep time
- [x] Dishes can only be served to customers with matching order
- [x] Payment calculates correctly based on wait time
- [x] Customers consume for 2 seconds then leave
- [x] New customers spawn 5 seconds after serving

### Level Progression
- [x] Level 1: Coffee Machine (1 slot), Black Americano only
- [x] Level 2: Add Chopping Board, Tomato Salad unlocked
- [x] Level 3: Coffee Machine (2 slots), Latte unlocked
- [x] Levels unlock sequentially (must beat previous)
- [x] Best scores save per level
- [x] Level 2+ locked until level 1 completed

### UI/UX
- [x] Language switches between EN/PT
- [x] All text translates correctly
- [x] Selected states show visually
- [x] Ready dishes show badge count
- [x] Cooking appliances show fire emoji
- [x] Customer wait times display correctly
- [x] Emoji reactions appear after serving
- [x] Victory/defeat modals show correct data
- [x] Leaderboard shows top 10 per level

### Firebase
- [x] Player name prompts if not set
- [x] Best scores save to Firestore
- [x] Best scores load on game start
- [x] Same name on different browsers = same player
- [x] Leaderboard queries work per level
- [x] Only best scores are saved (not worse scores)

### Edge Cases
- [x] Can't toss ingredients before 5 seconds
- [x] Can't cook recipe without ingredients
- [x] Can't serve dish to wrong customer
- [x] Timer stops at 0
- [x] Game ends correctly on timer expiry
- [x] Next level button hides on level 3 victory
- [x] Customers never leave (just pay 0 if > 30s)

## Known Limitations

1. **Single Player Only**: No multiplayer support
2. **Client-Side Timing**: Timer could be manipulated (no server validation)
3. **No Burn Mechanic**: Dishes don't burn (intentional for first 3 levels)
4. **No Multi-Item Orders**: Customers only order 1 dish
5. **Fixed Customer Slots**: Max 12 (not used in first 3 levels)
6. **Fixed Appliance Slots**: Max 12 appliances, 4 slots per appliance
7. **Fixed Ingredient Slots**: Max 24 ingredients (only 3 used currently)

## Compatibility

- **Browsers**: Chrome, Firefox, Safari, Edge (ES6+ required)
- **Mobile**: Responsive design, touch-friendly
- **Firebase**: Uses v9 compat mode
- **No Server**: Fully client-side (except Firebase)

## Summary

The Restaurant game implements a complete level-based progression system with:
- ✅ 3 playable levels with increasing complexity
- ✅ Data-driven design (easy to add content via objects)
- ✅ Firebase leaderboards (per-level, top 10)
- ✅ Bilingual support (EN/PT)
- ✅ Customer payment system based on wait time
- ✅ Cooking mechanics with ingredient management
- ✅ Responsive UI with modals
- ✅ Extensible architecture for future features

The game is production-ready and fully playable, with clear paths for adding more levels, recipes, appliances, and ingredients.
