// Background Service Worker - Tracks tabs, windows, and sends data to backend

const API_URL = 'http://localhost:5000/api';
let currentActivity = null;
let activityStartTime = null;
let currentTabId = null;
let idleCheckInterval = null;
let token = null;

// Configuration
const IDLE_THRESHOLD = 60; // seconds
const SYNC_INTERVAL = 10000; // 10 seconds
const HEARTBEAT_INTERVAL = 5000; // 5 seconds

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('TaskFlow Productivity Tracker installed');
  
  // Set up idle detection
  chrome.idle.setDetectionInterval(IDLE_THRESHOLD);
  
  // Set up periodic sync alarm
  chrome.alarms.create('syncActivities', { periodInMinutes: 1 });
  
  // Load saved token
  chrome.storage.local.get(['authToken'], (result) => {
    if (result.authToken) {
      token = result.authToken;
      console.log('Token loaded from storage');
    }
  });
});

// Listen for token from popup and unified tracking messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_TOKEN') {
    token = message.token;
    chrome.storage.local.set({ authToken: token });
    console.log('✅ Token saved');
    sendResponse({ success: true });
  } else if (message.type === 'GET_STATUS') {
    sendResponse({ 
      isTracking: currentActivity !== null,
      currentSite: currentActivity?.domain || 'None',
      isAuthenticated: !!token
    });
  } else if (message.type === 'CONTENT_INTERACTION') {
    // Update metadata from content script
    if (currentActivity) {
      currentActivity.metadata = {
        ...currentActivity.metadata,
        ...message.data
      };
    }
    sendResponse({ success: true });
  } else if (message.type === 'START_TASK_TRACKING') {
    // Unified tracking started - add task context to activities
    console.log('🎯 Unified tracking started for task:', message.taskTitle);
    if (currentActivity) {
      currentActivity.metadata = {
        ...currentActivity.metadata,
        taskId: message.taskId,
        taskTitle: message.taskTitle,
        isUnifiedTracking: true
      };
    }
    sendResponse({ success: true });
  } else if (message.type === 'PAUSE_TRACKING') {
    // Idle detected - pause tracking
    console.log('⏸️ Tracking paused (idle)');
    endCurrentActivity();
    sendResponse({ success: true });
  } else if (message.type === 'RESUME_TRACKING') {
    // User active again - resume tracking
    console.log('▶️ Tracking resumed');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        handleTabSwitch(tabs[0]);
      }
    });
    sendResponse({ success: true });
  } else if (message.type === 'STOP_TASK_TRACKING') {
    // Unified tracking stopped
    console.log('⏹️ Unified tracking stopped');
    if (currentActivity && currentActivity.metadata) {
      currentActivity.metadata.isUnifiedTracking = false;
      delete currentActivity.metadata.taskId;
      delete currentActivity.metadata.taskTitle;
    }
    sendResponse({ success: true });
  }
  return true;
});

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleTabSwitch(tab);
  } catch (error) {
    console.error('Error getting tab:', error);
  }
});

// Track tab updates (URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    handleTabSwitch(tab);
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    endCurrentActivity();
  } else {
    // Browser gained focus
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs[0]) {
        handleTabSwitch(tabs[0]);
      }
    });
  }
});

// Track idle state
chrome.idle.onStateChanged.addListener((newState) => {
  console.log('Idle state changed:', newState);
  
  if (newState === 'idle' || newState === 'locked') {
    endCurrentActivity();
  } else if (newState === 'active') {
    // Resume tracking
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        handleTabSwitch(tabs[0]);
      }
    });
  }
});

// Periodic sync alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncActivities') {
    syncCurrentActivity();
  }
});

// Handle tab switch
function handleTabSwitch(tab) {
  if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    endCurrentActivity();
    return;
  }
  
  // End previous activity
  endCurrentActivity();
  
  // Start new activity
  const url = new URL(tab.url);
  const domain = url.hostname;
  
  currentActivity = {
    type: 'website',
    title: tab.title,
    url: tab.url,
    domain: domain,
    startTime: new Date().toISOString(),
    metadata: {
      tabCount: 0,
      tabSwitches: 0,
      scrollDepth: 0,
      keystrokes: 0,
      clicks: 0
    }
  };
  
  activityStartTime = Date.now();
  currentTabId = tab.id;
  
  console.log('Started tracking:', domain);
  
  // Notify content script
  chrome.tabs.sendMessage(tab.id, { type: 'START_TRACKING' }).catch(() => {
    // Content script might not be loaded yet
  });
}

// End current activity
function endCurrentActivity() {
  if (currentActivity) {
    currentActivity.endTime = new Date().toISOString();
    currentActivity.duration = Math.floor((Date.now() - activityStartTime) / 1000);
    
    // Save activity to backend
    saveActivity(currentActivity);
    
    console.log('Ended tracking:', currentActivity.domain, currentActivity.duration + 's');
    
    currentActivity = null;
    activityStartTime = null;
    currentTabId = null;
  }
}

// Sync current activity (update duration)
function syncCurrentActivity() {
  if (currentActivity && activityStartTime) {
    const duration = Math.floor((Date.now() - activityStartTime) / 1000);
    
    // Only sync if significant time has passed (10+ seconds)
    if (duration >= 10) {
      const activityUpdate = {
        ...currentActivity,
        duration: duration,
        endTime: new Date().toISOString(),
        isActive: true
      };
      
      saveActivity(activityUpdate);
    }
  }
}

// Save activity to backend
async function saveActivity(activity) {
  if (!token) {
    console.log('No auth token, skipping save');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(activity)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Activity saved:', data._id);
    } else {
      const error = await response.json();
      console.error('Failed to save activity:', error);
      
      // If unauthorized, clear token
      if (response.status === 401) {
        token = null;
        chrome.storage.local.remove('authToken');
      }
    }
  } catch (error) {
    console.error('Error saving activity:', error);
  }
}

// Handle extension unload (save current activity)
chrome.runtime.onSuspend.addListener(() => {
  endCurrentActivity();
});

// Get tab count
chrome.tabs.query({}, (tabs) => {
  if (currentActivity) {
    currentActivity.metadata.tabCount = tabs.length;
  }
});

console.log('TaskFlow Productivity Tracker background script loaded');
