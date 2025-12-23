// Content Script - Runs on every page to track interactions

let scrollDepth = 0;
let keystrokes = 0;
let clicks = 0;
let isTracking = false;
let extensionValid = true;

// Check if extension context is still valid
function isExtensionValid() {
  try {
    // Try to access chrome.runtime - will throw if context invalidated
    if (chrome.runtime && chrome.runtime.id) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

// Listen for tracking start from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isExtensionValid()) {
    console.log('Extension context invalidated - please reload page');
    return false;
  }

  if (message.type === 'START_TRACKING') {
    startTracking();
    sendResponse({ success: true });
  } else if (message.type === 'PAUSE_TRACKING') {
    pauseTracking();
    sendResponse({ success: true });
  } else if (message.type === 'RESUME_TRACKING') {
    resumeTracking();
    sendResponse({ success: true });
  } else if (message.type === 'STOP_TASK_TRACKING') {
    stopTracking();
    sendResponse({ success: true });
  }
  return true;
});

function startTracking() {
  isTracking = true;
  scrollDepth = 0;
  keystrokes = 0;
  clicks = 0;
  
  console.log('✅ Content script: Started tracking interactions');
}

function pauseTracking() {
  isTracking = false;
  console.log('⏸️ Content script: Paused tracking (idle)');
}

function resumeTracking() {
  isTracking = true;
  console.log('▶️ Content script: Resumed tracking');
}

function stopTracking() {
  if (isTracking) {
    sendInteractionData();
  }
  isTracking = false;
  scrollDepth = 0;
  keystrokes = 0;
  clicks = 0;
  console.log('⏹️ Content script: Stopped tracking');
}

// Track scroll depth
let maxScrollDepth = 0;
window.addEventListener('scroll', () => {
  if (!isTracking || !extensionValid) return;
  
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  
  const currentScrollDepth = ((scrollTop + windowHeight) / documentHeight) * 100;
  maxScrollDepth = Math.max(maxScrollDepth, currentScrollDepth);
  
  // Send update every 10%
  if (Math.floor(maxScrollDepth / 10) > Math.floor(scrollDepth / 10)) {
    scrollDepth = maxScrollDepth;
    sendInteractionData();
  }
});

// Track keystrokes
document.addEventListener('keydown', () => {
  if (!isTracking || !extensionValid) return;
  keystrokes++;
  
  // Send update every 50 keystrokes
  if (keystrokes % 50 === 0) {
    sendInteractionData();
  }
});

// Track clicks
document.addEventListener('click', () => {
  if (!isTracking || !extensionValid) return;
  clicks++;
  
  // Send update every 10 clicks
  if (clicks % 10 === 0) {
    sendInteractionData();
  }
});

// Send interaction data to background
function sendInteractionData() {
  if (!isExtensionValid()) {
    extensionValid = false;
    console.log('⚠️ Extension context invalidated - data not sent. Please reload page.');
    return;
  }

  try {
    chrome.runtime.sendMessage({
      type: 'CONTENT_INTERACTION',
      data: {
        scrollDepth: Math.round(scrollDepth),
        keystrokes: keystrokes,
        clicks: clicks
      }
    }).catch((error) => {
      // Check if it's the context invalidated error
      if (error.message && error.message.includes('Extension context invalidated')) {
        extensionValid = false;
        console.log('⚠️ Extension was reloaded. Please refresh this page to continue tracking.');
      }
    });
  } catch (error) {
    if (error.message && error.message.includes('Extension context invalidated')) {
      extensionValid = false;
      console.log('⚠️ Extension was reloaded. Please refresh this page to continue tracking.');
    }
  }
}

// Send final data before page unload
window.addEventListener('beforeunload', () => {
  if (isTracking && extensionValid) {
    sendInteractionData();
  }
});

// Detect when extension is reloaded
chrome.runtime.connect().onDisconnect.addListener(() => {
  extensionValid = false;
  console.log('⚠️ Extension disconnected. Please reload this page.');
});

console.log('✅ TaskFlow content script loaded');
