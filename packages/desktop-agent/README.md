# 📊 TaskFlow Desktop Agent

Track your desktop application usage automatically and send data to TaskFlow analytics.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the agent
npm start

# 3. Login with your TaskFlow credentials
```

## ✨ Features

- **🔍 Automatic Tracking:** Detects active applications every 2 seconds
- **💾 Smart Saving:** Syncs activities every 30 seconds
- **🎨 Beautiful UI:** Brutalist design matching TaskFlow
- **📊 Real-time Stats:** See your activity as it happens
- **🔒 Secure:** JWT authentication with backend
- **⚡ Efficient:** Minimum 5-second activities to avoid noise
- **🌐 System Tray:** Runs in background, controlled from tray

## 📋 Requirements

- **Node.js** 16+ (for Electron 27)
- **Backend** running on port 5000 (or custom)
- **TaskFlow Account** (register in main app)

## 🔧 Configuration

### Custom Backend URL

Set environment variable before starting:

```bash
# Linux/Mac
export TASKFLOW_API_URL=http://192.168.1.100:5000/api
npm start

# Windows
set TASKFLOW_API_URL=http://192.168.1.100:5000/api
npm start
```

Or create `.env` file:
```bash
TASKFLOW_API_URL=http://your-backend:5000/api
```

### Tracking Intervals

Edit `tracker.js` to customize:

```javascript
// Line 43: Check active window
this.checkInterval = setInterval(() => this.checkActiveWindow(), 2000);
//                                                              ^^^^ 2 seconds

// Line 46: Sync activity
this.syncInterval = setInterval(() => this.syncActivity(), 30000);
//                                                         ^^^^^ 30 seconds
```

## 🎯 How It Works

### 1. **Window Detection**
```
Every 2 seconds →
  Check active window →
    If changed → End previous activity, Start new
```

### 2. **Activity Sync**
```
Every 30 seconds →
  If activity running →
    Send current state to backend
```

### 3. **Saving Logic**
```
Activity ends →
  Calculate duration →
    If >= 5 seconds → Save to backend
    If < 5 seconds → Discard (noise)
```

## 📊 Data Flow

```
Desktop App Running
    ↓
active-win detects window
    ↓
Tracker logs activity
    ↓
Every 30s OR on app switch
    ↓
POST /api/activities
    ↓
Backend saves to MongoDB
    ↓
Analytics shows in dashboard
```

## 🖥️ UI Features

### Login Screen
```
┌─────────────────────────┐
│ Login to TaskFlow       │
│ ───────────────────     │
│ Email: [__________]     │
│ Password: [________]    │
│ [      Login      ]     │
└─────────────────────────┘
```

### Dashboard
```
┌─────────────────────────────┐
│ Currently Tracking          │
│ ═══════════════════         │
│   Visual Studio Code        │
│                             │
│ Status: ● Active            │
│ Total Time: 2h 15m          │
│                             │
│ Top Applications:           │
│ • VS Code - 1h 30m          │
│ • Chrome - 45m              │
│ • Terminal - 15m            │
│                             │
│ [ Pause Tracking ]          │
│ [ Logout ]                  │
└─────────────────────────────┘
```

### System Tray
```
Right-click tray icon:
┌─────────────────────┐
│ TaskFlow Agent      │
│ ─────────────────── │
│ Open Dashboard      │
│ Pause Tracking      │
│ ─────────────────── │
│ Settings            │
│ Quit                │
└─────────────────────┘
```

## 🔍 Troubleshooting

### "Failed to load active-win"

**Cause:** ESM module loading issue  
**Fix:** Already applied! Uses dynamic import()

```javascript
// tracker.js uses:
await import('active-win');  ✅
// Not: require('active-win'); ❌
```

### "Cannot connect to backend"

**Check:**
1. Backend is running: `npm run dev` in packages/backend
2. Port is correct: Default is 5000
3. URL is correct: Set TASKFLOW_API_URL if needed

**Verify:**
```bash
curl http://localhost:5000/api/auth/login
# Should return 401 or login page, not connection error
```

### "Window stays blank"

**Cause:** index.html not found  
**Fix:** Already included in package!

**Verify:**
```bash
ls -la packages/desktop-agent/index.html
# Should exist
```

### "Activities not showing in analytics"

**Check:**
1. Wait 30 seconds after starting tracker
2. Check backend console for POST /api/activities
3. Check backend logs for "Activity saved"
4. Verify activity duration >= 5 seconds

**Debug:**
```bash
# Desktop agent console:
📊 Tracking: Chrome
💾 Activity saved

# Backend console:
📊 POST /api/activities received
✅ Activity saved
POST /api/activities 201
```

## 🛠️ Development

### Build for Distribution

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

### Debug Mode

```bash
# Enable Electron DevTools
# Edit main.js, line 133:
mainWindow.loadFile('index.html');
mainWindow.webContents.openDevTools();  // Add this
```

## 📝 API Endpoints Used

- `POST /api/auth/login` - Authenticate user
- `POST /api/activities` - Save activity
- `GET /api/activities?startDate=X&endDate=Y` - Get activities
- `GET /api/analytics/summary?date=X` - Get summary
- `GET /api/categories` - Get categories

## 🔒 Security

- JWT tokens stored in electron-store (encrypted)
- Tokens sent via Authorization header
- No passwords stored locally
- HTTPS support (change API URL to https://)

## 📊 Activity Data Format

```json
{
  "type": "application",
  "application": "Google Chrome",
  "title": "TaskFlow - Analytics",
  "startTime": "2024-12-19T12:30:00.000Z",
  "endTime": "2024-12-19T12:30:45.000Z",
  "duration": 45,
  "isActive": false
}
```

## 🎨 Customization

### Change UI Theme

Edit `index.html` CSS variables:

```css
/* Line ~20 */
background: linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%);
/* Change to your colors */
```

### Change Tracking Frequency

Edit `tracker.js`:

```javascript
// Faster updates (every 1 second)
this.checkInterval = setInterval(() => this.checkActiveWindow(), 1000);

// More frequent syncs (every 15 seconds)
this.syncInterval = setInterval(() => this.syncActivity(), 15000);
```

## 📦 Package Contents

```
desktop-agent/
├── main.js          - Electron main process
├── tracker.js       - Activity tracking logic
├── api-client.js    - HTTP client for backend
├── index.html       - UI renderer
├── icon.png         - App & tray icon
└── package.json     - Dependencies & scripts
```

## 🤝 Integration with TaskFlow

The desktop agent is part of the TaskFlow ecosystem:

1. **Main App** - Task management & boards
2. **Browser Extension** - Website tracking
3. **Desktop Agent** - Application tracking ← You are here
4. **Analytics** - Unified dashboard showing all data

All three tracking sources send to the same backend and appear in a unified analytics dashboard!

## 📞 Support

- Check backend is running on correct port
- Verify user account exists (register in main app)
- Check console logs for errors
- Review DESKTOP_AGENT_TEST.md for full test guide

## ⚡ Performance

- **RAM Usage:** ~100MB
- **CPU Usage:** <1% idle, <5% active
- **Network:** Only syncs every 30 seconds
- **Battery Impact:** Minimal (2-second intervals only)

## 🎯 Best Practices

1. **Keep backend running** - Agent requires active connection
2. **Login before tracking** - Activities need user context
3. **Check system tray** - Agent runs in background
4. **Review analytics daily** - See your productivity patterns
5. **Adjust intervals** - Customize to your needs

---

**Made with ❤️ for TaskFlow**

**Enjoy automated productivity tracking!** 📊✨
