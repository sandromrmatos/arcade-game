# Quick Setup Guide - 5 Minutes

## You're seeing a Firebase error because Realtime Database isn't enabled yet.

Follow these steps to fix it:

---

## 🔥 Step 1: Enable Firebase Realtime Database (2 minutes)

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click on **arcade-sandro** project
3. Click **"Build"** → **"Realtime Database"** in left sidebar
4. Click **"Create Database"**
5. Choose location: **us-central1** (recommended)
6. Select **"Start in test mode"**
7. Click **"Enable"**

✅ Done! Database is now active.

---

## 🔒 Step 2: Set Security Rules (1 minute)

1. In **Realtime Database**, click the **"Rules"** tab
2. Replace the content with:

```json
{
  "rules": {
    "ticTacToe": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Click **"Publish"**

✅ Done! Players can now read/write game data.

---

## 🔗 Step 3: Verify Database URL (1 minute)

1. In Firebase Console, look at the top of Realtime Database page
2. You'll see a URL like: `https://arcade-sandro-default-rtdb.firebaseio.com`
3. This should match the URL in your `game.js` file (line 7)

**If the URL is different:**
- Open `game.js`
- Find line 7: `databaseURL: "..."`
- Replace with your actual URL

✅ Done! URL is configured correctly.

---

## 🧪 Step 4: Test It (1 minute)

1. **Refresh your game page**
2. Open browser console (press F12)
3. Look for: `"Firebase Realtime Database initialized successfully"`
4. Click **"Multiplayer"**
5. Click **"Create Room"**
6. **Check Firebase Console** → you should see data appear under `ticTacToe/rooms`

✅ If you see data in Firebase, it's working!

---

## 🎮 Step 5: Play Multiplayer!

**To test by yourself:**
1. Open game in one browser window
2. Click **"Multiplayer"** → **"Create Room"** → note the room code (e.g., "ABC123")
3. Open game in another browser window (or incognito tab)
4. Click **"Multiplayer"** → enter the room code → **"Join Room"**
5. Both windows: Click **"Ready"**
6. Game starts! ✨

**To play with a friend:**
1. Create room
2. Share the room code with your friend (text, email, chat, etc.)
3. Friend enters the same code and joins
4. Both click Ready
5. Play!

---

## ❌ Still Getting Errors?

### "Permission denied"
→ Check Step 2 - Security rules must allow read/write

### "Database URL not configured"
→ Check Step 1 - Database must be enabled in Firebase Console

### "Can't connect"
→ Check internet connection and try refreshing page

### "Room is full"
→ Each room allows 2 players only. Create a new room.

---

## 📖 More Info

- **Detailed setup:** See `MULTIPLAYER_SETUP.md`
- **Troubleshooting:** See `FIREBASE_TROUBLESHOOTING.md`
- **Game flow:** See `GAME_FLOW.md`
- **Features:** See `README.md`

---

## 🎯 That's It!

Once Firebase Realtime Database is enabled (Step 1), everything else works automatically. The whole setup takes about 5 minutes total.

**Current Status:**
- ✅ Code is ready
- ⏳ Firebase Realtime Database needs to be enabled (Step 1)
- ⏳ Security rules need to be set (Step 2)

After Steps 1 & 2, multiplayer will work perfectly! 🚀
