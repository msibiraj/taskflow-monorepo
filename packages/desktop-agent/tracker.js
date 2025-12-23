const EventEmitter = require('events');
const activeWin = require('active-win');

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
  }
  
  async initialize() {
    try {
      // active-win@8.0.0 - secure, maintained by Sindre Sorhus
      console.log('✅ Activity tracker initialized');
      console.log(`   Platform: ${process.platform}`);
      console.log('   Using active-win@8.0.0 (secure, maintained)');
    } catch (error) {
      console.error('❌ Failed to initialize tracker:', error.message);
      throw error;
    }
  }
  
  async start() {
    if (this.isTracking) {
      console.log('⚠️  Already tracking');
      return;
    }
    
    await this.initialize();
    
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
      // active-win returns a Promise
      const window = await activeWin();
      
      if (!window || !window.owner) {
        this.endActivity();
        return;
      }
      
      // Extract app name
      const appName = window.owner.name || window.owner.processName || 'Unknown';
      const title = window.title || '';
      
      if (appName !== this.currentApp) {
        this.endActivity();
        this.startActivity(appName, title);
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
      console.log('💾 Activity saved:', activity.application, `(${activity.duration}s)`);
    } catch (error) {
      console.error('Save error:', error.message);
      this.emit('error', error);
    }
  }
}

module.exports = ActivityTracker;
