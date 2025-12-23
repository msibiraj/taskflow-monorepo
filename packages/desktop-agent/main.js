const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const ActivityTracker = require('./tracker');
const ApiClient = require('./api-client');

// Fix GPU warnings on Linux
if (process.platform === 'linux') {
  app.disableHardwareAcceleration();
  console.log('🔧 GPU acceleration disabled (Linux fix)');
}

const store = new Store();
let tray = null;
let mainWindow = null;
let tracker = null;
let apiClient = null;

// Create tray icon
function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png')); // You'll need to add an icon
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'TaskFlow Agent', 
      type: 'normal', 
      enabled: false 
    },
    { type: 'separator' },
    { 
      label: 'Open Dashboard', 
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      }
    },
    { 
      label: tracker && tracker.isTracking ? 'Pause Tracking' : 'Start Tracking',
      click: () => {
        if (tracker) {
          if (tracker.isTracking) {
            tracker.stop();
          } else {
            tracker.start();
          }
          updateTrayMenu();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Settings', 
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('show-settings');
          mainWindow.show();
        }
      }
    },
    { 
      label: 'Quit', 
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('TaskFlow Productivity Tracker');
  tray.setContextMenu(contextMenu);
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'TaskFlow Agent', 
      type: 'normal', 
      enabled: false 
    },
    { type: 'separator' },
    { 
      label: 'Open Dashboard', 
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      }
    },
    { 
      label: tracker && tracker.isTracking ? 'Pause Tracking' : 'Start Tracking',
      click: () => {
        if (tracker) {
          if (tracker.isTracking) {
            tracker.stop();
          } else {
            tracker.start();
          }
          updateTrayMenu();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Settings', 
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('show-settings');
          mainWindow.show();
        }
      }
    },
    { 
      label: 'Quit', 
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'icon.png')
  });
  
  mainWindow.loadFile('index.html');
  
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ready
app.whenReady().then(() => {
  createTray();
  createWindow();
  
  // Initialize API client
  const token = store.get('authToken');
  if (token) {
    apiClient = new ApiClient(token);
    initializeTracker();
  }
});

// Initialize tracker
function initializeTracker() {
  if (apiClient) {
    tracker = new ActivityTracker(apiClient);
    tracker.start();
    
    tracker.on('activity', (activity) => {
      if (mainWindow) {
        mainWindow.webContents.send('activity-update', activity);
      }
    });
    
    tracker.on('error', (error) => {
      console.error('Tracker error:', error);
      if (mainWindow) {
        mainWindow.webContents.send('tracker-error', error.message);
      }
    });
  }
}

// IPC Handlers
ipcMain.handle('login', async (event, credentials) => {
  try {
    const tempClient = new ApiClient();
    const result = await tempClient.login(credentials);
    
    store.set('authToken', result.token);
    apiClient = new ApiClient(result.token);
    
    initializeTracker();
    
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('logout', async () => {
  if (tracker) {
    tracker.stop();
    tracker = null;
  }
  
  store.delete('authToken');
  apiClient = null;
  
  return { success: true };
});

ipcMain.handle('get-status', async () => {
  const token = store.get('authToken');
  return {
    isAuthenticated: !!token,
    isTracking: tracker ? tracker.isTracking : false,
    currentApp: tracker ? tracker.currentApp : null
  };
});

ipcMain.handle('get-stats', async () => {
  if (!apiClient) {
    return { error: 'Not authenticated' };
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const activities = await apiClient.getActivities(today, today);
    
    // Calculate stats
    let totalTime = 0;
    const appMap = {};
    
    activities.forEach(activity => {
      totalTime += activity.duration || 0;
      if (activity.application) {
        if (!appMap[activity.application]) {
          appMap[activity.application] = 0;
        }
        appMap[activity.application] += activity.duration || 0;
      }
    });
    
    const topApps = Object.entries(appMap)
      .map(([name, time]) => ({ name, time }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
    
    return { totalTime, topApps };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('toggle-tracking', async () => {
  if (tracker) {
    if (tracker.isTracking) {
      tracker.stop();
    } else {
      tracker.start();
    }
    updateTrayMenu();
    return { isTracking: tracker.isTracking };
  }
  return { error: 'Tracker not initialized' };
});

// Quit handler
app.on('before-quit', () => {
  app.isQuiting = true;
  if (tracker) {
    tracker.stop();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  // Don't quit on window close (run in background)
});

console.log('TaskFlow Desktop Agent started');
