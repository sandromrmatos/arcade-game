# Tic Tac Toe Multiplayer Setup Instructions

## What I've Implemented

Your Tic Tac Toe game now has:

1. **Mode Selection Screen**: Choose between Single Player (vs AI) and Multiplayer
2. **Single Player Mode**: The original game experience against the computer
3. **Multiplayer Mode**: Real-time PvP using Firebase Realtime Database
   - Create or join rooms with room codes
   - Wait for another player to join
   - Both players click "Ready" to start
   - Turn-based gameplay showing "{Player Name}'s turn"
   - Automatic win/loss/draw detection
   - Leaderboard integration

## What You Need to Do

### Step 1: Enable Firebase Realtime Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **arcade-sandro**
3. In the left sidebar, click **"Build"** → **"Realtime Database"**
4. Click **"Create Database"**
5. Choose a location (e.g., `us-central1`)
6. Start in **"Test mode"** for now (we'll secure it later)
7. Click **"Enable"**

### Step 2: Configure Security Rules (Important!)

After enabling the database, set up proper security rules:

1. In the Realtime Database section, click on the **"Rules"** tab
2. Replace the default rules with these:

```json
{
  "rules": {
    "ticTacToe": {
      "rooms": {
        "$roomId": {
          ".read": true,
          ".write": true,
          "players": {
            "$playerId": {
              ".validate": "newData.hasChildren(['name', 'ready'])"
            }
          },
          "gameState": {
            ".validate": "newData.hasChildren(['status', 'board', 'currentTurn', 'players', 'gameOver'])"
          }
        }
      }
    }
  }
}
```

3. Click **"Publish"**

### Step 3: Verify Database URL

The code uses this database URL:
```
https://arcade-sandro-default-rtdb.firebaseio.com
```

Make sure this matches your actual Firebase Realtime Database URL. You can find it in the Firebase Console under:
- **Realtime Database** → Look at the top for the URL

If your URL is different, update it in `game.js` line 7:
```javascript
databaseURL: "https://your-actual-database-url.firebaseio.com",
```

### Step 4: Test the Game

1. Open the game in your browser
2. Click **"Multiplayer"**
3. Enter your name (from parent window)
4. Click **"Create Room"** - this generates a random room code
5. Open another browser tab/window (or incognito/another browser)
6. Click **"Multiplayer"** → enter the same room code → **"Join Room"**
7. Both players click **"Ready"**
8. Game starts! The first player to join is X, second is O

## How It Works

### Room System
- Room codes are 6-character alphanumeric codes (e.g., "ABC123")
- Each room can have exactly 2 players
- Rooms auto-cleanup when empty

### Game Flow
1. **Lobby Phase**: Players join and mark themselves ready
2. **Playing Phase**: Turn-based gameplay, only current player can move
3. **Game Over**: Winner/draw detected, result saved to leaderboard
4. **New Game**: Option to play again in the same room

### Real-time Sync
- All game state is stored in Firebase Realtime Database
- Changes are instantly synced to both players
- Disconnections are handled (player removed from room)

### Turn Indicator
- Shows "{Player Name}'s turn" for the opponent's turn
- Shows "Your turn!" when it's your turn to play
- Uses the player names from your existing authentication system

## Data Structure in Firebase

```
ticTacToe/
  rooms/
    ABC123/
      players/
        player_123.../
          name: "Anna"
          ready: true
          joinedAt: timestamp
        player_456.../
          name: "Bob"
          ready: true
          joinedAt: timestamp
      gameState/
        status: "playing"
        board: ["X", "", "O", ...]
        currentTurn: "player_123..."
        players: {...}
        winner: null
        gameOver: false
```

## Troubleshooting

### "Room is full"
- Each room only allows 2 players
- Create a new room or use a different code

### "Game already in progress"
- The room code is being used by an active game
- Wait for that game to finish or use a different room code

### Players not syncing
- Check browser console for errors
- Verify Firebase Realtime Database is enabled
- Check that security rules are published
- Verify database URL matches your project

### Player names not showing
- The game reads player names from `window.parent.playerName` or `localStorage.getItem("arcadePlayerName")`
- Make sure players have entered their names in your main arcade interface

## Future Enhancements (Optional)

You could add:
- **Rematch button**: Quick rematch without rejoining lobby
- **Chat system**: Players can send messages
- **Spectator mode**: Watch ongoing games
- **Ranked matchmaking**: Automatic pairing based on skill
- **Friend system**: Play with specific friends
- **Game history**: Review past games
- **Timer per turn**: Add time pressure
- **Private rooms**: Password-protected rooms

## Security Considerations

The current rules allow anyone to read/write to the database. For production, consider:

1. **Authenticated writes only**:
```json
{
  "rules": {
    "ticTacToe": {
      "rooms": {
        "$roomId": {
          ".read": true,
          "players": {
            "$playerId": {
              ".write": "auth != null && auth.uid == $playerId"
            }
          }
        }
      }
    }
  }
}
```

2. **Rate limiting**: Prevent abuse with Firebase App Check
3. **Room expiration**: Auto-delete old rooms (use Cloud Functions)

---

## Questions?

If you encounter any issues:
1. Check the browser console for errors
2. Verify Firebase Realtime Database is enabled
3. Check security rules are published
4. Make sure database URL is correct

The game is fully functional once Firebase Realtime Database is enabled!
