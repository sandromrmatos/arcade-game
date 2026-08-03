# Tic Tac Toe - Game Flow Diagram

## Mode Selection Flow

```
┌─────────────────────────────────┐
│     TIC TAC TOE HOME PAGE       │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Choose Game Mode       │   │
│  │                         │   │
│  │  [Single Player]        │   │
│  │  [Multiplayer]          │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
         │                │
         │                │
    ┌────┘                └────┐
    │                          │
    ▼                          ▼
```

## Single Player Flow

```
┌──────────────────────────┐
│   SINGLE PLAYER MODE     │
├──────────────────────────┤
│  • Play vs AI            │
│  • Random first player   │
│  • AI tries to win/block │
└──────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│      GAME BOARD          │
│  ┌───┬───┬───┐           │
│  │ X │   │ O │           │
│  ├───┼───┼───┤           │
│  │   │ X │   │           │
│  ├───┼───┼───┤           │
│  │ O │   │   │           │
│  └───┴───┴───┘           │
│  "Your turn!" / "PC's turn" │
└──────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│      GAME OVER           │
│  "You win!" / "PC wins!" │
│  "Draw!"                 │
│                          │
│  [New Game]              │
│  [Back to Menu]          │
└──────────────────────────┘
```

## Multiplayer Flow

```
┌─────────────────────────────────┐
│    MULTIPLAYER LOBBY            │
│                                 │
│  Welcome, Anna!                 │
│                                 │
│  Room Code: [______]            │
│                                 │
│  [Create Room] [Join Room]      │
│  [Back]                         │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│    WAITING IN ROOM: ABC123      │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Anna - ✓ Ready          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Bob - Not Ready         │   │
│  └─────────────────────────┘   │
│                                 │
│  [Ready] ← Click to toggle      │
└─────────────────────────────────┘
           │
           │ (Both players ready)
           ▼
┌─────────────────────────────────┐
│    GAME STARTING...             │
│  • Anna is X (joined first)     │
│  • Bob is O (joined second)     │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│      MULTIPLAYER GAME           │
│  ┌───┬───┬───┐                  │
│  │ X │   │ O │                  │
│  ├───┼───┼───┤                  │
│  │   │ X │   │                  │
│  ├───┼───┼───┤                  │
│  │ O │   │   │                  │
│  └───┴───┴───┘                  │
│                                 │
│  Anna's turn  ← If you're Bob   │
│  Your turn!   ← If you're Anna  │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│      GAME OVER                  │
│  "You win!" / "Bob wins!"       │
│  "Draw!"                        │
│                                 │
│  [New Game] ← Resets lobby      │
│  [Back to Menu]                 │
└─────────────────────────────────┘
```

## Player Interaction Timeline

### Creating a Room

```
Player 1 (Anna):
  1. Click "Multiplayer"
  2. Click "Create Room" → generates "ABC123"
  3. Click "Ready"
  4. ⏳ Waiting for Player 2...

Player 2 (Bob):
  1. Click "Multiplayer"
  2. Enter "ABC123"
  3. Click "Join Room"
  4. Click "Ready"

System:
  ✓ Both ready → Game starts!
  • Anna = X (first player)
  • Bob = O (second player)
  • Anna's turn first
```

### During Game

```
Turn 1 (Anna's turn):
  Anna's screen: "Your turn!"
  Bob's screen: "Anna's turn"
  → Anna clicks cell [0] → places X

Turn 2 (Bob's turn):
  Anna's screen: "Bob's turn"
  Bob's screen: "Your turn!"
  → Bob clicks cell [4] → places O

... continues until win/draw
```

### Game End

```
Anna wins:
  Anna's screen: "You win!"
  Bob's screen: "Anna wins!"

Both players:
  • Result saved to leaderboard
  • Can click "New Game" to play again
  • Or "Back to Menu" to leave
```

## Firebase Database Structure

```
ticTacToe/
  rooms/
    ABC123/                           ← Room Code
      players/
        player_1234_abc/              ← Auto-generated Player ID
          name: "Anna"
          ready: true
          joinedAt: 1672531200000
        player_5678_def/
          name: "Bob"
          ready: false
          joinedAt: 1672531210000
      gameState/
        status: "playing"
        board: ["X","O","","","X","","O","",""]
        currentTurn: "player_1234_abc"
        players:
          player_1234_abc:
            name: "Anna"
            symbol: "X"
          player_5678_def:
            name: "Bob"
            symbol: "O"
        winner: null
        gameOver: false
```

## Real-time Sync Events

```
Player joins room:
  → players/[playerId] created
  → Other player sees update
  → Lobby status refreshed

Player clicks Ready:
  → players/[playerId]/ready = true
  → Other player sees checkmark
  → System checks if both ready

Both ready:
  → gameState created
  → Both players' screens switch to game board
  → Turn indicator appears

Player makes move:
  → gameState/board updated
  → gameState/currentTurn switches
  → Both players see updated board
  → Turn indicator updates

Game ends:
  → gameState/winner set
  → gameState/gameOver = true
  → Both players see end screen
  → Result saved to leaderboard

Player disconnects:
  → players/[playerId] removed
  → Other player sees "waiting for player"
  → Empty room auto-deleted
```

## State Management

### Lobby States
- **Empty**: Waiting for first player
- **One Player**: Waiting for second player
- **Both Present, Not Ready**: Waiting for ready clicks
- **Both Ready**: Starting game...

### Game States
- **playing**: Game in progress
- **finished**: Game over (winner or draw)

### Turn States
- **Your turn**: Can click cells
- **Opponent's turn**: Cannot click, watching

## Error Handling

```
Room Full:
  → Alert: "Room is full!"
  → Stay in lobby entry screen

Game in Progress:
  → Alert: "Game already in progress!"
  → Can't join this room

No Room Code:
  → Alert: "Please enter a room code"
  → Stay in lobby entry screen

Player Disconnects Mid-Game:
  → Other player can click "Back to Menu"
  → Room cleaned up automatically
```

## Tips for Testing

1. **Local Testing**: Open two browser windows/tabs
2. **Remote Testing**: Share room code with friend
3. **Incognito Mode**: Test with different player names
4. **Mobile Testing**: One phone, one computer

## Performance Notes

- Real-time updates: < 100ms latency typical
- Room codes: 6 characters = 2.1 billion combinations
- Auto-cleanup: Disconnected players removed immediately
- Database reads: Optimized with listeners
- No polling: Event-driven updates only
