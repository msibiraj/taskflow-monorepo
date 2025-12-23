import { useEffect, useRef, useState } from 'react';

/**
 * Idle Detection Hook
 * Detects when user is idle (no mouse/keyboard activity)
 * @param {number} idleTimeout - Milliseconds before considering user idle (default: 300000 = 5 minutes)
 * @param {function} onIdle - Callback when user becomes idle
 * @param {function} onActive - Callback when user becomes active again
 */
export const useIdleDetection = (idleTimeout = 300000, onIdle, onActive) => {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const resetIdleTimer = () => {
      // Clear existing timer
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      // If was idle and now active, trigger onActive callback
      if (isIdle) {
        setIsIdle(false);
        if (onActive) {
          onActive();
        }
        console.log('👋 User is back! Resuming tracking...');
      }

      // Update last activity time
      lastActivityRef.current = Date.now();

      // Set new idle timer
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
        if (onIdle) {
          onIdle();
        }
        console.log('💤 User is idle. Pausing tracking...');
      }, idleTimeout);
    };

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Throttle mousemove to avoid too many calls
    let mouseMoveThrottle = null;
    const throttledMouseMove = () => {
      if (!mouseMoveThrottle) {
        mouseMoveThrottle = setTimeout(() => {
          resetIdleTimer();
          mouseMoveThrottle = null;
        }, 1000); // Only reset once per second for mousemove
      }
    };

    // Add event listeners
    events.forEach(event => {
      if (event === 'mousemove') {
        window.addEventListener(event, throttledMouseMove);
      } else {
        window.addEventListener(event, resetIdleTimer);
      }
    });

    // Initialize timer
    resetIdleTimer();

    // Cleanup
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (mouseMoveThrottle) {
        clearTimeout(mouseMoveThrottle);
      }
      events.forEach(event => {
        if (event === 'mousemove') {
          window.removeEventListener(event, throttledMouseMove);
        } else {
          window.removeEventListener(event, resetIdleTimer);
        }
      });
    };
  }, [idleTimeout, isIdle, onIdle, onActive]);

  // Get idle duration in seconds
  const getIdleDuration = () => {
    if (!isIdle) return 0;
    return Math.floor((Date.now() - lastActivityRef.current) / 1000);
  };

  return {
    isIdle,
    getIdleDuration,
    lastActivity: lastActivityRef.current
  };
};

/**
 * Idle Timer Component
 * Visual indicator showing idle status
 */
export const IdleTimer = ({ isIdle, idleDuration, onResume }) => {
  if (!isIdle) return null;

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="idle-timer-overlay">
      <div className="idle-timer-card">
        <div className="idle-timer-icon">💤</div>
        <h3>You're Idle</h3>
        <p className="idle-timer-message">
          Tracking paused due to inactivity
        </p>
        <div className="idle-timer-duration">
          Idle for: <strong>{formatDuration(idleDuration)}</strong>
        </div>
        <button 
          className="btn btn-primary btn-lg"
          onClick={onResume}
        >
          <i className="bi bi-play-fill me-2"></i>
          Resume Tracking
        </button>
        <small className="text-muted mt-3 d-block">
          Or move your mouse / press any key
        </small>
      </div>
    </div>
  );
};

/**
 * Idle Detection Settings Component
 */
export const IdleSettings = ({ idleTimeout, onTimeoutChange }) => {
  const timeoutOptions = [
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' },
    { value: 120000, label: '2 minutes' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' },
    { value: 900000, label: '15 minutes' },
    { value: 0, label: 'Never' }
  ];

  return (
    <div className="idle-settings">
      <label className="form-label">
        <i className="bi bi-hourglass-split me-2"></i>
        Idle Timeout
      </label>
      <select 
        className="form-select form-select-custom"
        value={idleTimeout}
        onChange={(e) => onTimeoutChange(Number(e.target.value))}
      >
        {timeoutOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <small className="text-muted">
        Tracking will pause after this period of inactivity
      </small>
    </div>
  );
};

// CSS for IdleTimer component (add to a separate CSS file)
export const IdleTimerStyles = `
.idle-timer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.idle-timer-card {
  background: #fff;
  border: 4px solid #000;
  padding: 48px;
  max-width: 500px;
  text-align: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.idle-timer-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.idle-timer-card h3 {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 8px;
}

.idle-timer-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.idle-timer-duration {
  font-size: 24px;
  font-weight: 700;
  padding: 16px;
  background: #f8f9fa;
  border: 2px solid #000;
  margin-bottom: 24px;
}

.idle-timer-duration strong {
  font-size: 32px;
  font-weight: 900;
  color: #000;
  font-family: 'Courier New', monospace;
}

.idle-settings {
  margin-bottom: 16px;
}

.idle-settings .form-label {
  font-weight: 700;
  margin-bottom: 8px;
  display: block;
}

.idle-settings .form-select {
  width: 100%;
}

.idle-settings small {
  display: block;
  margin-top: 8px;
}
`;

export default useIdleDetection;
