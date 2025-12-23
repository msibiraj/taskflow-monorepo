import React from 'react';

const Card = ({ card, listId, onOpenDetails }) => {
  const getInitials = (name) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('card', JSON.stringify(card));
    e.dataTransfer.setData('fromListId', listId);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const formatHours = (hours) => {
    if (!hours) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const timeTracking = card.timeTracking || {};
  const hasTimeTracking = timeTracking.estimatedHours > 0 || timeTracking.loggedHours > 0;
  const progressPercent = timeTracking.estimatedHours > 0 
    ? Math.min((timeTracking.loggedHours / timeTracking.estimatedHours) * 100, 100) 
    : 0;

  return (
    <div
      className="card-item"
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onOpenDetails && onOpenDetails(card, listId)}
      style={{ cursor: 'pointer' }}
    >
      <div className={`card-priority ${card.priority}`}></div>
      <h4 className="card-title">{card.title}</h4>
      {card.description && <p className="card-description">{card.description}</p>}
      
      {hasTimeTracking && (
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.75rem' }}>
            <span className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {formatHours(timeTracking.loggedHours)} / {formatHours(timeTracking.estimatedHours)}
            </span>
            <span className="text-muted">{Math.round(progressPercent)}%</span>
          </div>
          <div className="progress" style={{ height: '4px', background: 'var(--darker)' }}>
            <div
              className="progress-bar"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent > 100 ? 'var(--danger)' : 'var(--success)',
              }}
            ></div>
          </div>
        </div>
      )}

      {timeTracking.isTimerRunning && (
        <div className="mb-2">
          <span className="badge" style={{ background: 'var(--success)', fontSize: '0.7rem' }}>
            <i className="bi bi-stopwatch me-1"></i>
            Timer Running
          </span>
        </div>
      )}

      <div className="card-meta">
        <span className={`priority-badge ${card.priority}`}>{card.priority}</span>
        {card.dueDate && <span className="card-badge"><i className="bi bi-calendar"></i>{new Date(card.dueDate).toLocaleDateString()}</span>}
        {card.comments?.length > 0 && <span className="card-badge"><i className="bi bi-chat"></i>{card.comments.length}</span>}
        {card.assignedTo && <div className="card-assignee" title={card.assignedTo.name}>{getInitials(card.assignedTo.name)}</div>}
      </div>
    </div>
  );
};

export default Card;
