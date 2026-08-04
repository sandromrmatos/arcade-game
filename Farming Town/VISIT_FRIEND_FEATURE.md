# Visit a Friend Feature

## Overview
Players can now visit other players' farms in read-only mode to see their progress, farm layout, and stats.

## How It Works

### 1. Access the Feature
- Click the "Visit a Friend" button in the top panel (next to Help button)
- Available in both English and Portuguese

### 2. Select a Player
- A dropdown menu shows all registered players except yourself
- Each player is listed with their name and level: `PlayerName (Level X)`
- If no other players exist, shows message: "No other players found"

### 3. Visit Their Farm
- Click the "Visit" button to load the selected player's farm
- The game loads their complete farm state from Firebase:
  - Grid tiles and layout
  - Crops, trees, and buildings
  - Player stats (name, level, XP, coins)

### 4. View-Only Mode
- **Yellow banner** appears at top: "Visiting [PlayerName] - (View Only - You cannot interact)"
- All tiles are visible but **not clickable**
- Action buttons (Inventory, Marketplace, Create Plot) are **hidden**
- Only Help and Language Selector remain available
- Friend's stats shown in modal and top panel

### 5. Return to Your Farm
- Click "Return to My Farm" button in the modal
- Your original game state is restored completely
- All action buttons reappear
- Resume normal gameplay

## Technical Implementation

### Frontend (HTML)
- Added "Visit a Friend" button in top panel
- New modal with:
  - Player dropdown selector
  - Visit button
  - Return to My Farm button
  - Friend's stats display

### Styling (CSS)
- `.visit-friend-content` - Modal styling
- `.friend-selector` - Dropdown styling
- `.viewing-mode` - Disables tile interactions
- `.viewing-mode-banner` - Yellow notification banner
- `.btn-secondary` - Grey button for Return action

### Backend (JavaScript)

#### State Management
```javascript
let originalGameState = null;  // Stores your farm before visiting
let isVisitingFriend = false;  // Tracks viewing mode
```

#### Key Functions

1. **showVisitFriendModal()**
   - Queries Firebase for all players: `db.collection('farmingTownPlayers').get()`
   - Excludes current player from list
   - Populates dropdown with player names and levels

2. **visitPlayerFarm(friendPlayerId, friendData)**
   - Saves current game state to `originalGameState`
   - Loads friend's grid tiles from Firebase
   - Reconstructs friend's farm (sparse grid with proper bounds)
   - Updates display with friend's stats
   - Enables viewing mode (disables interactions)
   - Shows yellow banner notification

3. **returnToMyFarm()**
   - Restores original game state from backup
   - Re-enables all interactions
   - Hides viewing banner
   - Restores action buttons
   - Closes modal

### Database Queries

**Load all players:**
```javascript
db.collection('farmingTownPlayers').get()
```

**Load friend's grid:**
```javascript
db.collection('farmingTownGrids')
  .where('playerId', '==', friendPlayerId)
  .get()
```

## User Experience

### Normal Flow
1. Player A clicks "Visit a Friend"
2. Sees dropdown with: Player B (Level 5), Player C (Level 3)
3. Selects Player B and clicks "Visit"
4. Screen shows Player B's farm with all their crops/trees/buildings
5. Top shows: "Visiting Player B - (View Only)"
6. Player A can look around but not interact
7. Clicks "Return to My Farm"
8. Back to their own farm, can play normally

### Edge Cases Handled
- **No other players**: Dropdown shows "No other players found", Visit button disabled
- **Loading errors**: Shows error notification, doesn't change state
- **Already visiting**: Can visit different player without returning first
- **State preservation**: Deep copy ensures original farm state is perfectly restored

## Bilingual Support

### English
- Visit a Friend
- Select a player
- Loading players...
- Visit
- Return to My Farm
- Visiting
- No other players found
- (View Only - You cannot interact)

### Portuguese
- Visitar um Amigo
- Selecione um jogador
- Carregando jogadores...
- Visitar
- Voltar para Minha Fazenda
- Visitando
- Nenhum outro jogador encontrado
- (Apenas Visualização - Você não pode interagir)

## Benefits

### For Players
- ✅ See friends' farm designs for inspiration
- ✅ Compare progress and levels
- ✅ Learn building layouts and strategies
- ✅ Safe viewing (can't accidentally modify anything)

### For Game
- ✅ Social feature increases engagement
- ✅ Read-only mode prevents griefing
- ✅ No additional database writes needed
- ✅ Works with existing Firebase structure

## Security & Safety

### Read-Only Enforcement
- **CSS**: `.viewing-mode .grid-tile { pointer-events: none !important; }`
- **JavaScript**: All action buttons hidden during visit
- **No saves**: Game doesn't save while in viewing mode
- **Deep copy**: Original state can't be modified while viewing

### Data Privacy
- Only shows publicly visible farm data (grid, stats)
- Doesn't expose inventory details
- Doesn't show production queues
- Friend can't see your farm unless they visit you too

## Future Enhancements (Optional)

### Possible Additions
- 🔮 "Recent Visitors" log
- 🔮 "Send Gift" feature (coins/items)
- 🔮 "Friend List" to save favorites
- 🔮 "Like" or "Comment" on farms
- 🔮 Leaderboard integration (click player to visit)
- 🔮 Screenshot/Share farm layout

## Testing Checklist

- [ ] Visit button appears in top panel
- [ ] Modal opens with player list
- [ ] Current player excluded from dropdown
- [ ] Friend's farm loads correctly
- [ ] All tiles visible (crops, trees, buildings)
- [ ] Tiles not clickable in viewing mode
- [ ] Stats display correctly (name, level, XP, coins)
- [ ] Yellow banner shows at top
- [ ] Action buttons hidden during visit
- [ ] Return button works
- [ ] Original farm state restored perfectly
- [ ] Can visit multiple friends without issues
- [ ] Handles empty player list gracefully
- [ ] Works in both English and Portuguese
- [ ] Responsive on mobile devices
