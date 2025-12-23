# 🔧 Fix Electron GPU Warnings on Linux

## ⚠️ **Error You're Seeing:**

```
[20508:1223/102035.251041:ERROR:gl_surface_presentation_helper.cc(260)] GetVSyncParametersIfAvailable() failed for 1 times!
[20508:1223/102038.488274:ERROR:gl_surface_presentation_helper.cc(260)] GetVSyncParametersIfAvailable() failed for 2 times!
```

## ✅ **The Good News:**

**These errors are HARMLESS!** 

- ✅ Desktop agent still works perfectly
- ✅ Window tracking works
- ✅ Data is saved correctly
- ✅ UI renders fine

These are just **warnings** from Electron's GPU rendering system.

---

## 🔧 **Fix Options:**

### **Option 1: Disable GPU Acceleration (Recommended)**

Edit `packages/desktop-agent/main.js`:

```javascript
// Around line 10-15, find the BrowserWindow creation
const mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    // Add these lines:
    enableRemoteModule: false,
    disableHardwareAcceleration: true  // ← Add this
  },
  // ... rest of config
});

// Or add before app.whenReady():
app.disableHardwareAcceleration();  // ← Add this line
```

---

### **Option 2: Use Software Rendering**

Start the desktop agent with flags:

```bash
# Method 1: Environment variable
ELECTRON_DISABLE_GPU=1 npm start

# Method 2: Command line flag
npm start -- --disable-gpu

# Method 3: Both (belt and suspenders)
ELECTRON_DISABLE_GPU=1 npm start -- --disable-gpu --disable-software-rasterizer
```

---

### **Option 3: Suppress Error Messages**

Keep GPU enabled but hide warnings:

```bash
# Redirect stderr to null
npm start 2>/dev/null

# Or filter specific errors
npm start 2>&1 | grep -v "GetVSyncParametersIfAvailable"
```

---

### **Option 4: Update Graphics Drivers**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt upgrade

# Update Mesa drivers (for Intel/AMD)
sudo apt install mesa-utils

# Check current driver
glxinfo | grep "OpenGL version"

# For NVIDIA
sudo apt install nvidia-driver-535  # or latest version
```

---

## 🛠️ **Automatic Fix (Recommended):**

I'll update the desktop agent to disable GPU by default on Linux:

### **Updated main.js:**

```javascript
const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const ActivityTracker = require('./tracker');
const ApiClient = require('./api-client');

// Disable GPU acceleration on Linux to avoid VSync errors
if (process.platform === 'linux') {
  app.disableHardwareAcceleration();
}

// ... rest of the code
```

---

## 📊 **Why This Happens:**

### **Root Causes:**

1. **Wayland vs X11:** Electron expects X11, but you might be on Wayland
2. **Graphics Drivers:** Intel/AMD open-source drivers sometimes have VSync issues
3. **Virtual Display:** Running in VM or headless mode
4. **Compositor:** Window manager compositor conflicts

### **Technical Details:**

- `gl_surface_presentation_helper.cc` = GPU rendering helper
- `GetVSyncParametersIfAvailable()` = VSync timing query
- Error = Can't get refresh rate from GPU
- Impact = None (Electron falls back to software rendering)

---

## ✅ **Quick Fix Script:**

```bash
# Create a wrapper script
cat > packages/desktop-agent/start.sh << 'EOF'
#!/bin/bash

# Disable GPU acceleration
export ELECTRON_DISABLE_GPU=1

# Suppress VSync errors
exec npm start 2>&1 | grep -v "GetVSyncParametersIfAvailable"
EOF

chmod +x packages/desktop-agent/start.sh

# Run it
./packages/desktop-agent/start.sh
```

---

## 🔍 **Verify the Fix:**

After applying any fix:

```bash
cd packages/desktop-agent
npm start

# Should see:
✅ Activity tracker initialized
🚀 Activity tracking started
📊 Tracking: Google Chrome

# Should NOT see:
❌ GetVSyncParametersIfAvailable errors
```

---

## 🎯 **Best Practice (Production):**

For production, add to `package.json`:

```json
{
  "scripts": {
    "start": "electron . --disable-gpu --no-sandbox",
    "start:dev": "electron .",
    "start:safe": "ELECTRON_DISABLE_GPU=1 electron . --disable-gpu"
  }
}
```

Then use:
```bash
npm run start:safe  # No GPU errors
```

---

## 🐛 **Alternative Issues:**

### **If you see different errors:**

**"Failed to connect to X server":**
```bash
export DISPLAY=:0
npm start
```

**"GPU process launch failed":**
```bash
npm start -- --disable-gpu --disable-software-rasterizer
```

**"SharedArrayBuffer is not defined":**
```bash
npm start -- --enable-features=SharedArrayBuffer
```

---

## 📝 **Summary:**

| Fix Method | Difficulty | Effectiveness |
|------------|------------|---------------|
| Add `app.disableHardwareAcceleration()` | Easy | ✅ Best |
| Use `--disable-gpu` flag | Easy | ✅ Good |
| Update drivers | Medium | ⚠️ Maybe |
| Suppress warnings | Easy | ⚠️ Cosmetic only |

**Recommended:** Add `app.disableHardwareAcceleration()` to main.js

---

## 🚀 **Want Me to Fix It Automatically?**

I can update the package to:
1. Auto-detect Linux
2. Disable GPU acceleration
3. Add start scripts
4. Suppress warnings

Let me know if you want the automatic fix! 🔧
