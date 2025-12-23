// Content Script - Runs on every page to track interactions

let scrollDepth = 0;
let keystrokes = 0;
let clicks = 0;
let isTracking = false;

// Listen for tracking start from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TRACKING') {
    startTracking();
    sendResponse({ success: true });
  }
  return true;
});

function startTracking() {
  isTracking = true;
  scrollDepth = 0;
  keystrokes = 0;
  clicks = 0;
  
  console.log('Content script: Started tracking interactions');
}

// Track scroll depth
let maxScrollDepth = 0;
window.addEventListener('scroll', () => {
  if (!isTracking) return;
  
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
  if (!isTracking) return;
  keystrokes++;
  
  // Send update every 50 keystrokes
  if (keystrokes % 50 === 0) {
    sendInteractionData();
  }
});

// Track clicks
document.addEventListener('click', () => {
  if (!isTracking) return;
  clicks++;
  
  // Send update every 10 clicks
  if (clicks % 10 === 0) {
    sendInteractionData();
  }
});

// Send interaction data to background
function sendInteractionData() {
  chrome.runtime.sendMessage({
    type: 'CONTENT_INTERACTION',
    data: {
      scrollDepth: Math.round(scrollDepth),
      keystrokes: keystrokes,
      clicks: clicks
    }
  }).catch(() => {
    // Background might not be ready
  });
}

// Send final data before page unload
window.addEventListener('beforeunload', () => {
  if (isTracking) {
    sendInteractionData();
  }
});

console.log('TaskFlow content script loaded');
