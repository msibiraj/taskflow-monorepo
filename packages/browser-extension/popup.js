// Popup Script

const API_URL = 'http://localhost:5000/api';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const trackingSection = document.getElementById('trackingSection');
const messageDiv = document.getElementById('message');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const trackingStatus = document.getElementById('trackingStatus');
const currentSite = document.getElementById('currentSite');
const todayTime = document.getElementById('todayTime');
const tabCount = document.getElementById('tabCount');
const sitesCount = document.getElementById('sitesCount');

// Check authentication status on load
chrome.storage.local.get(['authToken'], async (result) => {
  if (result.authToken) {
    // Verify token is still valid
    const isValid = await verifyToken(result.authToken);
    if (isValid) {
      showTrackingSection();
      loadStats();
    } else {
      showLoginSection();
    }
  } else {
    showLoginSection();
  }
});

// Login
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showMessage('Please enter email and password', 'error');
    return;
  }
  
  loginBtn.textContent = 'Logging in...';
  loginBtn.disabled = true;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Save token
      chrome.storage.local.set({ authToken: data.token });
      
      // Send token to background script
      chrome.runtime.sendMessage({ 
        type: 'SET_TOKEN', 
        token: data.token 
      });
      
      showMessage('Login successful!', 'success');
      setTimeout(() => {
        showTrackingSection();
        loadStats();
      }, 1000);
    } else {
      showMessage(data.error || 'Login failed', 'error');
      loginBtn.textContent = 'Login';
      loginBtn.disabled = false;
    }
  } catch (error) {
    showMessage('Connection error. Is the server running?', 'error');
    loginBtn.textContent = 'Login';
    loginBtn.disabled = false;
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  chrome.storage.local.remove('authToken');
  chrome.runtime.sendMessage({ type: 'SET_TOKEN', token: null });
  showLoginSection();
  showMessage('Logged out successfully', 'success');
});

// Open dashboard
dashboardBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000/analytics' });
});

// Show/hide sections
function showLoginSection() {
  loginSection.classList.remove('hidden');
  trackingSection.classList.add('hidden');
}

function showTrackingSection() {
  loginSection.classList.add('hidden');
  trackingSection.classList.remove('hidden');
}

// Show message
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message message-${type}`;
  messageDiv.classList.remove('hidden');
  
  setTimeout(() => {
    messageDiv.classList.add('hidden');
  }, 3000);
}

// Verify token
async function verifyToken(token) {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Load stats
async function loadStats() {
  // Get current status from background
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response) {
      if (response.isTracking) {
        trackingStatus.textContent = 'Tracking';
        trackingStatus.className = 'badge badge-success';
        currentSite.textContent = response.currentSite;
      } else {
        trackingStatus.textContent = 'Idle';
        trackingStatus.className = 'badge badge-warning';
        currentSite.textContent = 'No active site';
      }
    }
  });
  
  // Get tab count
  chrome.tabs.query({}, (tabs) => {
    tabCount.textContent = tabs.length;
  });
  
  // Load today's stats from API
  chrome.storage.local.get(['authToken'], async (result) => {
    if (!result.authToken) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_URL}/activities?startDate=${today}&endDate=${today}`,
        {
          headers: { 'Authorization': `Bearer ${result.authToken}` }
        }
      );
      
      if (response.ok) {
        const activities = await response.json();
        
        // Calculate total time
        let totalSeconds = 0;
        const uniqueDomains = new Set();
        
        activities.forEach(activity => {
          totalSeconds += activity.duration || 0;
          if (activity.domain) {
            uniqueDomains.add(activity.domain);
          }
        });
        
        // Format time
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        todayTime.textContent = `${hours}h ${minutes}m`;
        
        sitesCount.textContent = uniqueDomains.size;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  });
}

// Refresh stats periodically
setInterval(loadStats, 10000); // Every 10 seconds
