import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Send analytics update
  const sendAnalyticsUpdate = async (timer, isFinal = false) => {
    if (!timer) return;

    const start = new Date(timer.startTime);
    const now = new Date();
    const elapsedSeconds = Math.floor((now - start) / 1000);

    if (elapsedSeconds < 5) return; // Don't send if less than 5 seconds

    try {
      await api.post('/activities', {
        type: 'task',
        title: timer.cardTitle,
        description: `Working on: ${timer.cardTitle}`,
        taskId: timer.cardId,
        boardId: timer.boardId,
        duration: elapsedSeconds,
        startTime: start.toISOString(),
        endTime: now.toISOString(),
        category: 'productive',
        isActive: !isFinal,
        metadata: {
          listId: timer.listId,
          boardName: timer.boardName,
          cardTitle: timer.cardTitle
        }
      });
      console.log(`📊 Analytics ${isFinal ? 'final' : 'update'} sent (${elapsedSeconds}s)`);
    } catch (error) {
      console.error('❌ Failed to send analytics:', error);
    }
  };

  // Start timer
  const startTimer = (timerData) => {
    setActiveTimer({
      ...timerData,
      startTime: new Date()
    });
    console.log('⏱️ Timer started:', timerData.cardTitle);
  };

  // Stop timer
  const stopTimer = async () => {
    if (activeTimer) {
      await sendAnalyticsUpdate(activeTimer, true);
      console.log('⏹️ Timer stopped');
      setActiveTimer(null);
      setElapsedTime(0);
    }
  };

  // Update elapsed time every second
  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      const start = new Date(activeTimer.startTime);
      const now = new Date();
      const elapsed = (now - start) / 1000; // seconds
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  // Send updates every 30 seconds
  useEffect(() => {
    if (!activeTimer) return;

    const analyticsInterval = setInterval(() => {
      sendAnalyticsUpdate(activeTimer);
    }, 30000);

    return () => clearInterval(analyticsInterval);
  }, [activeTimer]);

  // Handle page unload/close
  useEffect(() => {
    if (!activeTimer) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery
      const start = new Date(activeTimer.startTime);
      const now = new Date();
      const elapsedSeconds = Math.floor((now - start) / 1000);

      if (elapsedSeconds >= 5) {
        const data = JSON.stringify({
          type: 'task',
          title: activeTimer.cardTitle,
          description: `Working on: ${activeTimer.cardTitle}`,
          taskId: activeTimer.cardId,
          boardId: activeTimer.boardId,
          duration: elapsedSeconds,
          startTime: start.toISOString(),
          endTime: now.toISOString(),
          category: 'productive',
          isActive: false,
          metadata: {
            listId: activeTimer.listId,
            boardName: activeTimer.boardName,
            cardTitle: activeTimer.cardTitle
          }
        });

        const blob = new Blob([data], { type: 'application/json' });
        const token = localStorage.getItem('token');
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL}/activities?token=${token}`,
          blob
        );
        console.log('📊 Final update sent via beacon on page close');
      }
    };

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendAnalyticsUpdate(activeTimer);
        console.log('📊 Update sent on tab hidden');
      }
    };

    // Add listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTimer]);

  const value = {
    activeTimer,
    elapsedTime,
    startTimer,
    stopTimer,
    isTimerRunning: !!activeTimer
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export default TimerContext;
