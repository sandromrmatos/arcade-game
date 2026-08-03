# Firebase Realtime Database Troubleshooting

## Error: Firebase Database URL Not Configured

If you see this error:
```
FIREBASE WARNING: Firebase error. Please ensure that you have the URL of your Firebase Realtime Database instance configured correctly.
```

This means the **Firebase Realtime Database is not enabled yet** or the URL is incorrect.

---

## Solution: Enable Firebase Realtime Database

### Step 1: Go to Firebase Console

1. Open [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click on your project: **arcade-sandro**

### Step 2: Enable Realtime Database

1. In the left sidebar, click **"Build"** (or **"Develop"**)
2. Click **"Realtime Database"**
3. Click the **"Create Database"** button

### Step 3: Choose Location

You'll be asked to choose a location:
- **us-central1** (United States) - Most common
- **europe-west1** (Belgium)
- **asia-southeast1** (Singapore)

Choose the one closest to your users.

### Step 4: Set Security Rules

Choose **"Start in test mode"** for now. This allows read/write access for 30 days.

Click **"Enable"**.

### Step 5: Get Your Database URL

After creation, you'll see your database with a URL at the top. It will be one of these formats:

**Format 1 (newer projects):**
```
https://arcade-sandro-default-rtdb.firebaseio.com
```

**Format 2 (US Central):**
```
https://arcade-sandro.firebaseio.com
```

**Format 3 (other regions):**
```
https://arcade-sandro-default-rtdb.europe-west1.firebasedatabase.app
```
or
```
https://arcade-sandro-default-rtdb.asia-southeast1.firebasedatabase.app
```

### Step 6: Update game.js (if needed)

If your database URL is different from the default, update line 7 in `game.js`:

```javascript
databaseURL: "https://YOUR-ACTUAL-DATABASE-URL",
```

Replace with your actual URL from Step 5.

---

## How to Find Your Database URL

### Method 1: From Firebase Console

1. Go to Firebase Console
2. Click your project
3. Go to **Realtime Database**
4. Look at the top - you'll see the URL like: `https://arcade-sandro-default-rtdb.firebaseio.com`

### Method 2: From Project Settings

1. Click the gear icon ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"**
4. Look for `databaseURL` in the Firebase SDK snippet

### Method 3: Check Browser Console

Open the browser console (F12) and look for the full error message. It will show the URL Firebase is trying to reach.

---

## Common Issues

### Issue 1: "Permission Denied"

**Symptoms:** Database enabled but getting permission errors

**Solution:**
1. Go to **Realtime Database** → **Rules** tab
2. Use these rules for testing:

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

⚠️ **Warning:** These rules allow anyone to read/write. For production, use more restrictive rules (see MULTIPLAYER_SETUP.md).

### Issue 2: "Network Error"

**Symptoms:** Can't connect to Firebase

**Solution:**
- Check your internet connection
- Disable browser extensions (especially ad blockers)
- Try a different browser
- Check if Firebase is down: [https://status.firebase.google.com/](https://status.firebase.google.com/)

### Issue 3: Wrong Region URL

**Symptoms:** Database exists but wrong URL format

**Solution:**
If your database is in a different region, the URL format changes:

- **US Central (default):** `.firebaseio.com`
- **Europe/Asia:** `.europe-west1.firebasedatabase.app` or `.asia-southeast1.firebasedatabase.app`

Update the `databaseURL` in `game.js` to match your actual region.

### Issue 4: Multiple Firebase Apps Error

**Symptoms:** "Firebase app named '[DEFAULT]' already exists"

**Solution:**
This shouldn't happen with our setup, but if it does:
1. Refresh the page
2. Clear browser cache
3. Check if Firebase is initialized elsewhere

---

## Testing Connection

After enabling the database, test the connection:

1. Open the game
2. Open browser console (F12)
3. Look for: `"Firebase Realtime Database initialized successfully"`
4. Click **"Multiplayer"**
5. Click **"Create Room"**
6. Check console - no errors means it's working!

---

## Verify Database is Working

### Check in Firebase Console

1. Go to **Realtime Database** in Firebase Console
2. Click **"Create Room"** in your game
3. In Firebase Console, you should see:
   ```
   ticTacToe
     └─ rooms
          └─ ABC123 (your room code)
               └─ players
                    └─ player_xxxxx
                         ├─ name: "Your Name"
                         ├─ ready: false
                         └─ joinedAt: timestamp
   ```

If you see this data appear in real-time, it's working!

---

## Database URL by Region

| Region | URL Format | Example |
|--------|------------|---------|
| US Central (default) | `https://PROJECT-ID-default-rtdb.firebaseio.com` | `https://arcade-sandro-default-rtdb.firebaseio.com` |
| US Central (older) | `https://PROJECT-ID.firebaseio.com` | `https://arcade-sandro.firebaseio.com` |
| Europe West | `https://PROJECT-ID-default-rtdb.europe-west1.firebasedatabase.app` | `https://arcade-sandro-default-rtdb.europe-west1.firebasedatabase.app` |
| Asia Southeast | `https://PROJECT-ID-default-rtdb.asia-southeast1.firebasedatabase.app` | `https://arcade-sandro-default-rtdb.asia-southeast1.firebasedatabase.app` |

---

## Quick Checklist

✅ Firebase Realtime Database is enabled in console  
✅ Database URL in `game.js` matches console URL  
✅ Security rules are set (test mode or custom)  
✅ No browser console errors  
✅ Internet connection working  
✅ Firebase SDK loaded (check Network tab)  

---

## Still Having Issues?

### Check These Files

1. **game.js** line 7 - Correct `databaseURL`?
2. **index.html** - Firebase SDK scripts loading?
3. Browser console - Any error messages?

### Get Help

1. Check Firebase Status: [https://status.firebase.google.com/](https://status.firebase.google.com/)
2. Share console errors for debugging
3. Verify database appears in Firebase Console

---

## Expected Behavior After Setup

1. **Open game** → No Firebase errors in console
2. **Click Multiplayer** → Shows lobby
3. **Create Room** → Room appears in Firebase Console
4. **Another player joins** → Both see each other
5. **Both click Ready** → Game starts
6. **Make moves** → Syncs instantly to other player

If all these work, your setup is complete! 🎉
