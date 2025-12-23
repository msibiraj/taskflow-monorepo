import React from 'react';

const BoardCard = ({ board, onClick }) => {
  const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="card-custom board-card" onClick={onClick}>
      <div className="card-body board-card-header">
        <h3>{board.title}</h3>
        <p>{board.description || 'No description'}</p>
      </div>
      <div className="card-body board-card-footer">
        <div className="board-members">
          {board.members.slice(0, 3).map((member) => (
            <div key={member._id} className="member-avatar" title={member.name}>
              {getInitials(member.name)}
            </div>
          ))}
          {board.members.length > 3 && <div className="member-avatar">+{board.members.length - 3}</div>}
        </div>
        <small className="text-muted"><i className="bi bi-list-task me-1"></i>{board.lists?.length || 0} lists</small>
      </div>
    </div>
  );
};

export default BoardCard;
