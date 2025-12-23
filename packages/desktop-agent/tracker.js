const EventEmitter = require('events');

class ActivityTracker extends EventEmitter {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
    this.isTracking = false;
    this.currentActivity = null;
    this.activityStartTime = null;
    this.checkInterval = null;
    this.syncInterval = null;
    this.currentApp = null;
    this.activeWin = null;
  }
  
  async initialize() {
    try {
      // Dynamic import for ESM module (active-win v9+)
      const activeWinModule = await import('active-win');
      this.activeWin = activeWinModule.default;
      console.log('✅ Activity tracker initialized');
    } catch (error) {
      console.error('❌ Failed to load active-win:', error.message);
      throw error;
    }
  }
  
  async start() {
    if (this.isTracking) {
      console.log('⚠️  Already tracking');
      return;
    }
    
    // Initialize if needed
    if (!this.activeWin) {
      await this.initialize();
    }
    
    this.isTracking = true;
    console.log('🚀 Activity tracking started');
    
    // Check active window every 2 seconds
    this.checkInterval = setInterval(() => this.checkActiveWindow(), 2000);
    
    // Sync activity every 30 seconds
    this.syncInterval = setInterval(() => this.syncActivity(), 30000);
    
    // Initial check
    this.checkActiveWindow();
  }
  
  stop() {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    console.log('⏹️  Activity tracking stopped');
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.endActivity();
  }
  
  async checkActiveWindow() {
    try {
      if (!this.activeWin) return;

      const window = await this.activeWin();
      
      if (!window) {
        this.endActivity();
        return;
      }
      
      const appName = window.owner.name;
      
      if (appName !== this.currentApp) {
        this.endActivity();
        this.startActivity(appName, window.title);
      }
    } catch (error) {
      console.error('Error checking window:', error.message);
      this.emit('error', error);
    }
  }
  
  startActivity(appName, title) {
    this.currentApp = appName;
    this.activityStartTime = Date.now();
    
    this.currentActivity = {
      type: 'application',
      application: appName,
      title: title,
      startTime: new Date().toISOString()
    };
    
    console.log('📊 Tracking:', appName);
    this.emit('activity', { type: 'start', app: appName });
  }
  
  endActivity() {
    if (this.currentActivity) {
      const duration = Math.floor((Date.now() - this.activityStartTime) / 1000);
      
      this.currentActivity.duration = duration;
      this.currentActivity.endTime = new Date().toISOString();
      
      // Only save if duration >= 5 seconds
      if (duration >= 5) {
        this.saveActivity(this.currentActivity);
      }
      
      this.emit('activity', { type: 'end', app: this.currentApp, duration });
      
      this.currentActivity = null;
      this.currentApp = null;
      this.activityStartTime = null;
    }
  }
  
  syncActivity() {
    if (this.currentActivity && this.activityStartTime) {
      const duration = Math.floor((Date.now() - this.activityStartTime) / 1000);
      
      if (duration >= 30) {
        this.saveActivity({
          ...this.currentActivity,
          duration,
          endTime: new Date().toISOString(),
          isActive: true
        });
      }
    }
  }
  
  async saveActivity(activity) {
    try {
      await this.apiClient.saveActivity(activity);
      console.log('💾 Activity saved');
    } catch (error) {
      console.error('Save error:', error.message);
      this.emit('error', error);
    }
  }
}

module.exports = ActivityTracker;
