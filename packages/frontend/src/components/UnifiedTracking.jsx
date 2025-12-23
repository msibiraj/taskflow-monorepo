import React, { useState, useEffect } from 'react';
import useIdleDetection, { IdleTimer, IdleSettings } from '../hooks/useIdleDetection';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './UnifiedTracking.css';

/**
 * Unified Tracking Component
 * Controls task timer, browser extension, and desktop agent with idle detection
 * Idle timeout: 5 minutes (default), configurable by admins only
 */
const UnifiedTracking = ({ task, onTrackingChange }) => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trackingStartTime, setTrackingStartTime] = useState(null);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [idleTimeout, setIdleTimeout] = useState(300000); // 5 minutes default (300,000 ms)
  const [pausedTime, setPausedTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Idle detection
  const { isIdle, getIdleDuration } = useIdleDetection(
    idleTimeout,
    handleIdleStart,
    handleIdleEnd
  );

  // Update current session time every second
  useEffect(() => {
    let interval;
    if (isTracking && !isPaused && trackingStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - trackingStartTime) / 1000);
        setCurrentSessionTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused, trackingStartTime]);

  // Auto-save every 30 seconds while tracking
  useEffect(() => {
    let saveInterval;
    if (isTracking && !isPaused) {
      saveInterval = setInterval(() => {
        saveTrackingSession(false);
      }, 30000); // Save every 30 seconds
    }
    return () => clearInterval(saveInterval);
  }, [isTracking, isPaused, currentSessionTime]);

  // Idle callbacks
  function handleIdleStart() {
    if (!isTracking) return;
    
    console.log('💤 User went idle (5 min) - pausing tracking');
    setIsPaused(true);
    setPausedTime(Date.now());
    
    // Pause browser extension
    sendMessageToExtension('PAUSE_TRACKING');
    
    // Pause desktop agent
    sendMessageToDesktopAgent('pause', { taskId: task._id });
    
    // Save current progress before pausing
    saveTrackingSession(false, true);
  }

  function handleIdleEnd() {
    if (!isTracking || !isPaused) return;
    
    const pauseDuration = Math.floor((Date.now() - pausedTime) / 1000);
    console.log(`👋 User is back - was idle for ${pauseDuration} seconds`);
    
    setIsPaused(false);
    
    // Resume browser extension
    sendMessageToExtension('RESUME_TRACKING');
    
    // Resume desktop agent
    sendMessageToDesktopAgent('resume', { taskId: task._id });
    
    // Adjust start time to exclude idle time
    setTrackingStartTime(Date.now() - (currentSessionTime * 1000));
  }

  const handleStartTracking = async () => {
    console.log('🚀 Starting unified tracking for:', task.title);
    
    const startTime = Date.now();
    setIsTracking(true);
    setIsPaused(false);
    setTrackingStartTime(startTime);
    setCurrentSessionTime(0);
    
    // Notify browser extension
    sendMessageToExtension('START_TASK_TRACKING', {
      taskId: task._id,
      taskTitle: task.title,
      startTime: new Date().toISOString()
    });
    
    // Notify desktop agent via backend
    sendMessageToDesktopAgent('start', {
      taskId: task._id,
      taskTitle: task.title,
      startTime: new Date().toISOString()
    });
    
    // Start task timer in backend
    try {
      await api.post(`/cards/${task._id}/timer/start`);
    } catch (error) {
      console.error('Failed to start backend timer:', error);
    }
    
    if (onTrackingChange) {
      onTrackingChange(true);
    }
  };

  const handleStopTracking = async () => {
    console.log('⏹️ Stopping unified tracking');
    
    // Save final session
    await saveTrackingSession(true, false);
    
    const finalDuration = currentSessionTime;
    
    setIsTracking(false);
    setIsPaused(false);
    setCurrentSessionTime(0);
    setTrackingStartTime(null);
    
    // Stop browser extension
    sendMessageToExtension('STOP_TASK_TRACKING', {
      taskId: task._id,
      duration: finalDuration
    });
    
    // Stop desktop agent
    sendMessageToDesktopAgent('stop', {
      taskId: task._id,
      duration: finalDuration
    });
    
    // Stop backend timer
    try {
      await api.post(`/cards/${task._id}/timer/stop`, {
        duration: finalDuration
      });
    } catch (error) {
      console.error('Failed to stop backend timer:', error);
    }
    
    if (onTrackingChange) {
      onTrackingChange(false);
    }
  };

  const saveTrackingSession = async (isFinal = false, isPausing = false) => {
    if (currentSessionTime < 5) return; // Don't save if less than 5 seconds
    
    try {
      await api.post('/activities', {
        type: 'task',
        taskId: task._id,
        title: task.title,
        duration: currentSessionTime,
        startTime: new Date(trackingStartTime).toISOString(),
        endTime: new Date().toISOString(),
        category: 'productive',
        isActive: !isFinal,
        metadata: {
          taskId: task._id,
          taskTitle: task.title,
          isPaused: isPausing,
          isFinal: isFinal
        }
      });
      console.log(`💾 Session saved (${currentSessionTime}s, ${isFinal ? 'final' : 'ongoing'})`);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const sendMessageToExtension = (type, data = {}) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        chrome.runtime.sendMessage({
          type,
          ...data
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('📱 Extension:', chrome.runtime.lastError.message);
          }
        });
      } catch (error) {
        console.log('📱 Browser extension not available');
      }
    }
  };

  const sendMessageToDesktopAgent = async (action, data = {}) => {
    try {
      await api.post('/tracking/desktop-agent', {
        action,
        ...data
      });
      console.log('💻 Desktop agent notified:', action);
    } catch (error) {
      console.log('💻 Desktop agent not available');
    }
  };

  const handleIdleTimeoutChange = (newTimeout) => {
    if (!isAdmin) return;
    setIdleTimeout(newTimeout);
    localStorage.setItem('idleTimeout', newTimeout);
    console.log('⏱️ Idle timeout changed to:', newTimeout / 60000, 'minutes');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="unified-tracking">
      {/* Idle Timer Overlay */}
      {isIdle && isTracking && (
        <IdleTimer 
          isIdle={isIdle}
          idleDuration={getIdleDuration()}
          onResume={handleIdleEnd}
        />
      )}

      {/* Tracking Control */}
      <div className="tracking-section">
        <div className="tracking-header">
          <h6 className="section-title">
            <i className="bi bi-broadcast me-2"></i>
            Unified Tracking
          </h6>
          {isAdmin && (
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowSettings(!showSettings)}
              title="Admin Settings"
            >
              <i className="bi bi-gear"></i>
            </button>
          )}
        </div>

        {/* Info Alert */}
        <div className="alert alert-info mb-3">
          <i className="bi bi-info-circle me-2"></i>
          <small>
            Controls task timer, browser extension, and desktop agent simultaneously.
            {isPaused && (
              <span className="badge bg-warning text-dark ms-2">
                <i className="bi bi-pause-fill me-1"></i>
                PAUSED (Idle)
              </span>
            )}
          </small>
        </div>

        {/* Admin Settings */}
        {isAdmin && showSettings && (
          <div className="admin-settings mb-3">
            <div className="settings-header">
              <i className="bi bi-shield-check me-2"></i>
              <strong>Admin Settings</strong>
            </div>
            <IdleSettings 
              idleTimeout={idleTimeout}
              onTimeoutChange={handleIdleTimeoutChange}
            />
            <small className="text-muted">
              <i className="bi bi-lock-fill me-1"></i>
              Only admins can change idle timeout
            </small>
          </div>
        )}

        {/* Current Session Display */}
        {isTracking && (
          <div className="session-display mb-3">
            <div className="session-time">
              <span className="time-label">Active Time:</span>
              <span className="time-value">{formatTime(currentSessionTime)}</span>
            </div>
            {isPaused && (
              <div className="idle-notice">
                <i className="bi bi-hourglass-split me-2"></i>
                Idle for: {formatTime(getIdleDuration())}
              </div>
            )}
          </div>
        )}

        {/* Tracking Button */}
        {!isTracking ? (
          <button 
            className="btn btn-success btn-lg w-100 tracking-btn"
            onClick={handleStartTracking}
          >
            <i className="bi bi-play-circle-fill me-2"></i>
            Start Tracking Everything
          </button>
        ) : (
          <button 
            className="btn btn-danger btn-lg w-100 tracking-btn"
            onClick={handleStopTracking}
          >
            <i className="bi bi-stop-circle-fill me-2"></i>
            Stop All Tracking
          </button>
        )}

        {/* What's Being Tracked */}
        <div className="tracking-info mt-3">
          <small className="text-muted d-block mb-2">
            <strong>Currently tracking:</strong>
          </small>
          <div className="tracking-items">
            <div className={`tracking-item ${isTracking && !isPaused ? 'active' : ''}`}>
              <i className="bi bi-stopwatch me-2"></i>
              Task Timer
            </div>
            <div className={`tracking-item ${isTracking && !isPaused ? 'active' : ''}`}>
              <i className="bi bi-globe me-2"></i>
              Websites
            </div>
            <div className={`tracking-item ${isTracking && !isPaused ? 'active' : ''}`}>
              <i className="bi bi-laptop me-2"></i>
              Applications
            </div>
          </div>
        </div>

        {/* Idle Info */}
        <div className="idle-info mt-3">
          <small className="text-muted">
            <i className="bi bi-moon me-1"></i>
            Auto-pause after <strong>{idleTimeout / 60000} minutes</strong> of inactivity
            {!isAdmin && <span className="ms-2">(Contact admin to change)</span>}
          </small>
        </div>
      </div>
    </div>
  );
};

export default UnifiedTracking;
