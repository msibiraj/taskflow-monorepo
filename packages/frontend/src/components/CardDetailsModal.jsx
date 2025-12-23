import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import RichTextEditor from './RichTextEditor';
import UnifiedTracking from './UnifiedTracking';

const CardDetailsModal = ({ card, listId, board, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [editedCard, setEditedCard] = useState(card);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeLogHours, setTimeLogHours] = useState('');
  const [timeLogDesc, setTimeLogDesc] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Update elapsed time if timer is running
    if (editedCard.timeTracking?.isTimerRunning && editedCard.timeTracking?.timerStartedAt) {
      const interval = setInterval(() => {
        const start = new Date(editedCard.timeTracking.timerStartedAt);
        const now = new Date();
        const elapsed = (now - start) / 1000 / 60 / 60; // hours
        setElapsedTime(elapsed);
      }, 1000);

      // Function to send current activity to analytics
      const sendAnalyticsUpdate = async () => {
        const start = new Date(editedCard.timeTracking.timerStartedAt);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        
        // Only send if at least 5 seconds have elapsed
        if (elapsedSeconds >= 5) {
          try {
            await api.post('/activities', {
              type: 'task',
              title: editedCard.title,
              description: `Working on: ${editedCard.title}`,
              taskId: editedCard._id,
              boardId: board._id,
              duration: elapsedSeconds,
              startTime: start.toISOString(),
              endTime: now.toISOString(),
              category: 'productive',
              isActive: true,
              metadata: {
                listId: listId,
                boardName: board.name,
                cardTitle: editedCard.title
              }
            });
            console.log('📊 Analytics update sent');
          } catch (error) {
            console.error('❌ Failed to send update:', error);
          }
        }
      };

      // 🆕 Send live updates every 30 seconds
      const analyticsInterval = setInterval(() => {
        sendAnalyticsUpdate();
      }, 30000);

      // 🆕 Send update when user leaves page or closes browser
      const handleBeforeUnload = (e) => {
        // Use sendBeacon for reliable delivery even when page is closing
        const start = new Date(editedCard.timeTracking.timerStartedAt);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        
        if (elapsedSeconds >= 5) {
          const data = JSON.stringify({
            type: 'task',
            title: editedCard.title,
            description: `Working on: ${editedCard.title}`,
            taskId: editedCard._id,
            boardId: board._id,
            duration: elapsedSeconds,
            startTime: start.toISOString(),
            endTime: now.toISOString(),
            category: 'productive',
            isActive: true,
            metadata: {
              listId: listId,
              boardName: board.name,
              cardTitle: editedCard.title
            }
          });
          
          // Use sendBeacon for guaranteed delivery
          const blob = new Blob([data], { type: 'application/json' });
          const token = localStorage.getItem('token');
          navigator.sendBeacon(
            `${import.meta.env.VITE_API_URL}/activities?token=${token}`,
            blob
          );
          console.log('📊 Final update sent via beacon');
        }
      };

      // 🆕 Send update when tab becomes hidden
      const handleVisibilityChange = () => {
        if (document.hidden) {
          sendAnalyticsUpdate();
          console.log('📊 Update sent on tab hidden');
        }
      };

      // 🆕 Send update when modal closes
      const handleModalClose = () => {
        sendAnalyticsUpdate();
        console.log('📊 Update sent on modal close');
      };

      // Add event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Store cleanup function
      const cleanup = () => {
        clearInterval(interval);
        clearInterval(analyticsInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        // Send final update on cleanup
        sendAnalyticsUpdate();
      };

      return cleanup;
    }
  }, [editedCard.timeTracking, board, listId]);

  const handleStartTimer = () => {
    const updatedCard = {
      ...editedCard,
      timeTracking: {
        ...editedCard.timeTracking,
        isTimerRunning: true,
        timerStartedAt: new Date(),
        timerStartedBy: user.id,
      },
    };
    setEditedCard(updatedCard);
    onUpdate(updatedCard, listId);
  };

  const handleStopTimer = async () => {
    if (editedCard.timeTracking?.timerStartedAt) {
      const start = new Date(editedCard.timeTracking.timerStartedAt);
      const end = new Date();
      const hoursWorked = (end - start) / 1000 / 60 / 60;
      
      const updatedCard = {
        ...editedCard,
        timeTracking: {
          ...editedCard.timeTracking,
          isTimerRunning: false,
          loggedHours: (editedCard.timeTracking?.loggedHours || 0) + hoursWorked,
          timerStartedAt: null,
          timerStartedBy: null,
          timeLogs: [
            ...(editedCard.timeTracking?.timeLogs || []),
            {
              user: user.id,
              hours: hoursWorked,
              description: 'Timer tracked',
              date: new Date(),
            },
          ],
        },
      };
      
      // Update card in database
      setEditedCard(updatedCard);
      onUpdate(updatedCard, listId);
      setElapsedTime(0);
      
      // 🆕 Send to analytics API for dashboard
      try {
        await api.post('/activities', {
          type: 'task',
          title: editedCard.title,
          description: `Worked on: ${editedCard.title}`,
          taskId: editedCard._id,
          boardId: board._id,
          duration: Math.round(hoursWorked * 3600), // Convert hours to seconds
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          category: 'productive',
          metadata: {
            listId: listId,
            boardName: board.name,
            cardTitle: editedCard.title,
            hoursWorked: hoursWorked.toFixed(2)
          }
        });
        console.log('✅ Task time logged to analytics');
      } catch (error) {
        console.error('❌ Failed to log to analytics:', error);
        // Don't block the UI if analytics fails
      }
    }
  };

  const handleLogTime = () => {
    if (!timeLogHours || parseFloat(timeLogHours) <= 0) return;

    const hours = parseFloat(timeLogHours);
    const updatedCard = {
      ...editedCard,
      timeTracking: {
        ...editedCard.timeTracking,
        loggedHours: (editedCard.timeTracking?.loggedHours || 0) + hours,
        timeLogs: [
          ...(editedCard.timeTracking?.timeLogs || []),
          {
            user: user.id,
            hours,
            description: timeLogDesc,
            date: new Date(),
          },
        ],
      },
    };
    
    setEditedCard(updatedCard);
    onUpdate(updatedCard, listId);
    setTimeLogHours('');
    setTimeLogDesc('');
    setIsEditingTime(false);
  };

  const handleAssignTo = (memberId) => {
    const updatedCard = {
      ...editedCard,
      assignedTo: memberId,
    };
    setEditedCard(updatedCard);
    onUpdate(updatedCard, listId);
  };

  const handleUpdateEstimate = (hours) => {
    const updatedCard = {
      ...editedCard,
      timeTracking: {
        ...editedCard.timeTracking,
        estimatedHours: parseFloat(hours) || 0,
      },
    };
    setEditedCard(updatedCard);
    onUpdate(updatedCard, listId);
  };

  const handleUpdateBasicInfo = (field, value) => {
    const updatedCard = {
      ...editedCard,
      [field]: value,
    };
    setEditedCard(updatedCard);
    onUpdate(updatedCard, listId);
  };

  const formatHours = (hours) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getAssignedUser = () => {
    if (!editedCard.assignedTo) return null;
    return board.members.find(m => m._id === editedCard.assignedTo);
  };

  const assignedUser = getAssignedUser();
  const timeTracking = editedCard.timeTracking || {};
  const totalHours = (timeTracking.loggedHours || 0) + elapsedTime;
  const estimatedHours = timeTracking.estimatedHours || 0;
  const progressPercent = estimatedHours > 0 ? Math.min((totalHours / estimatedHours) * 100, 100) : 0;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.9)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-card-text me-2"></i>
              Card Details
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Card Title */}
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control form-control-custom"
                value={editedCard.title}
                onChange={(e) => handleUpdateBasicInfo('title', e.target.value)}
              />
            </div>

            {/* Description with Rich Text Editor */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <RichTextEditor 
                value={editedCard.description || ''}
                onChange={(value) => handleUpdateBasicInfo('description', value)}
                placeholder="Add a detailed description... Supports Markdown!"
              />
            </div>

            {/* Priority & Due Date */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Priority</label>
                <select
                  className="form-control form-control-custom"
                  value={editedCard.priority}
                  onChange={(e) => handleUpdateBasicInfo('priority', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control form-control-custom"
                  value={editedCard.dueDate ? new Date(editedCard.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleUpdateBasicInfo('dueDate', e.target.value)}
                />
              </div>
            </div>

            <hr className="divider" />

            {/* Assignment Section */}
            <div className="mb-4">
              <h6 className="text-gradient mb-3">
                <i className="bi bi-person-check me-2"></i>
                Assignment
              </h6>
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${!editedCard.assignedTo ? 'btn-custom' : 'btn-outline-custom'}`}
                  onClick={() => handleAssignTo(null)}
                >
                  <i className="bi bi-person-x me-1"></i>
                  Unassigned
                </button>
                {board.members.map((member) => (
                  <button
                    key={member._id}
                    className={`btn btn-sm ${editedCard.assignedTo === member._id ? 'btn-custom' : 'btn-outline-custom'}`}
                    onClick={() => handleAssignTo(member._id)}
                  >
                    <i className="bi bi-person me-1"></i>
                    {member.name}
                  </button>
                ))}
              </div>
              {assignedUser && (
                <div className="mt-2">
                  <small className="text-muted">
                    Assigned to: <strong className="text-secondary">{assignedUser.name}</strong>
                  </small>
                </div>
              )}
            </div>

            <hr className="divider" />

            {/* Unified Tracking with Idle Detection */}
            <UnifiedTracking 
              task={editedCard}
              onTrackingChange={(isTracking) => {
                console.log('Tracking state changed:', isTracking);
              }}
            />

            <hr className="divider" />

            {/* Time Tracking Section */}
            <div className="mb-3">
              <h6 className="text-gradient mb-3">
                <i className="bi bi-clock-history me-2"></i>
                Time Tracking
              </h6>

              {/* Time Estimate */}
              <div className="mb-3">
                <label className="form-label">Estimated Time (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className="form-control form-control-custom"
                  value={estimatedHours}
                  onChange={(e) => handleUpdateEstimate(e.target.value)}
                  placeholder="0"
                />
              </div>

              {/* Progress Bar */}
              {estimatedHours > 0 && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <small>Progress: {formatHours(totalHours)} / {formatHours(estimatedHours)}</small>
                    <small>{Math.round(progressPercent)}%</small>
                  </div>
                  <div className="progress" style={{ height: '8px', background: 'var(--gray)' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${progressPercent}%`,
                        background: progressPercent > 100 ? 'var(--danger)' : 'var(--primary)',
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Timer Controls */}
              <div className="d-flex gap-2 mb-3">
                {!timeTracking.isTimerRunning ? (
                  <button className="btn btn-custom btn-sm" onClick={handleStartTimer}>
                    <i className="bi bi-play-fill me-2"></i>
                    Start Timer
                  </button>
                ) : (
                  <>
                    <button className="btn btn-danger btn-sm" onClick={handleStopTimer}>
                      <i className="bi bi-stop-fill me-2"></i>
                      Stop Timer
                    </button>
                    <span className="badge bg-success p-2">
                      <i className="bi bi-clock me-1"></i>
                      Running: {formatHours(elapsedTime)}
                    </span>
                  </>
                )}
                <button
                  className="btn btn-secondary-custom btn-sm"
                  onClick={() => setIsEditingTime(!isEditingTime)}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Log Time
                </button>
              </div>

              {/* Manual Time Log */}
              {isEditingTime && (
                <div className="card-custom p-3 mb-3">
                  <div className="mb-2">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      className="form-control form-control-custom"
                      placeholder="Hours (e.g., 2.5)"
                      value={timeLogHours}
                      onChange={(e) => setTimeLogHours(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      placeholder="What did you work on?"
                      value={timeLogDesc}
                      onChange={(e) => setTimeLogDesc(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-custom btn-sm" onClick={handleLogTime}>
                      Save
                    </button>
                    <button className="btn btn-outline-custom btn-sm" onClick={() => setIsEditingTime(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Time Logs */}
              {timeTracking.timeLogs && timeTracking.timeLogs.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block mb-2">Time Logs:</small>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {timeTracking.timeLogs.map((log, index) => (
                      <div key={index} className="card-custom p-2 mb-2">
                        <div className="d-flex justify-content-between">
                          <small>
                            <strong>{formatHours(log.hours)}</strong>
                            {log.description && ` - ${log.description}`}
                          </small>
                          <small className="text-muted">
                            {new Date(log.date).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Logged Time */}
              <div className="mt-3 p-3 card-custom">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-gradient"><strong>Total Logged Time:</strong></span>
                  <span className="badge bg-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    {formatHours(timeTracking.loggedHours || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-custom" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsModal;
