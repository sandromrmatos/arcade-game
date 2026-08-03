# Tic Tac Toe - Single Player & Multiplayer

## Overview

This Tic Tac Toe game now supports two modes:
- **Single Player**: Play against an AI opponent
- **Multiplayer**: Play in real-time against another player online

## Quick Start

### For Players

1. **Single Player**: Click "Single Player" to play against the computer immediately
2. **Multiplayer**: 
   - Click "Multiplayer"
   - Create a new room or enter an existing room code
   - Share the room code with a friend
   - Both players click "Ready"
   - Game starts automatically!

### For Developers

See `MULTIPLAYER_SETUP.md` for complete Firebase Realtime Database setup instructions.

## Features

### Single Player Mode
- Play against smart AI
- AI blocks your winning moves
- AI tries to win when possible
- Random first player selection
- Wins/losses tracked in leaderboard

### Multiplayer Mode
- Real-time synchronization
- Room-based matchmaking with 6-character codes
- Player names displayed (e.g., "Anna's turn")
- Ready system - both players must be ready
- Automatic turn management
- Win/loss/draw detection
- Leaderboard integration
- Disconnect handling
- Auto-cleanup of empty rooms

## Technical Details

### Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase Realtime Database
- **Real-time sync**: Firebase Database listeners

### Files
- `index.html` - Game interface with mode selection and multiplayer lobby
- `game.js` - Complete game logic for both single and multiplayer modes
- `MULTIPLAYER_SETUP.md` - Setup instructions for Firebase
- `README.md` - This file

## Game Rules

1. Players take turns placing their symbol (X or O) on a 3×3 grid
2. First player to get 3 in a row (horizontal, vertical, or diagonal) wins
3. If all 9 squares are filled with no winner, the game is a draw
4. In multiplayer, the first player to join is X, second player is O

## How Multiplayer Works

1. **Room Creation**: Player creates a room with a unique 6-character code
2. **Room Joining**: Second player enters the code and joins
3. **Ready Phase**: Both players see each other and click "Ready"
4. **Game Start**: Once both ready, game begins automatically
5. **Turn System**: Players alternate, with current player's name displayed
6. **Game End**: Winner declared, result saved to leaderboard
7. **New Game**: Option to play again in the same room

## Leaderboard

Both modes track:
- **Wins**: Games won
- **Losses**: Games lost  
- **Win Rate**: wins / (wins + losses) - used for ranking

Higher win rate = better leaderboard position!

## Tips

### Single Player
- Watch the AI's patterns
- Think ahead to block potential wins
- Try to create multiple winning opportunities

### Multiplayer
- Use descriptive room codes for private games
- Share room codes through chat, email, or messages
- Be patient waiting for the other player to move
- Use the "Back to Menu" if you want to leave mid-game

## Troubleshooting

**Can't join room**: Room might be full (2 players max) or game in progress  
**Players not syncing**: Check internet connection and browser console  
**Name not showing**: Make sure you entered your name in the main arcade menu  
**Game stuck**: Click "Back to Menu" and rejoin or create a new room

## Future Ideas

- Chat between players
- Timer per turn
- Game history
- Spectator mode
- Ranked matchmaking
- Friend system
- Tournament brackets
