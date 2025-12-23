import React, { useState } from 'react';

const AddMemberModal = ({ board, onClose, onAddMember, onRemoveMember }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onAddMember(email);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-people me-2"></i>
              Manage Team Members
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Add Member Form */}
            <form onSubmit={handleSubmit} className="mb-4">
              <label className="form-label">Add Member by Email</label>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control form-control-custom"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-custom"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
              {error && (
                <small className="text-danger mt-2 d-block">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {error}
                </small>
              )}
            </form>

            <hr className="divider" />

            {/* Current Members List */}
            <div>
              <label className="form-label">Current Members ({board.members.length})</label>
              <div className="list-group">
                {board.members.map((member) => {
                  const isOwner = board.owner._id === member._id;
                  return (
                    <div
                      key={member._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                      style={{
                        background: 'var(--gray)',
                        border: '2px solid var(--gray-light)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="member-avatar" style={{ width: '40px', height: '40px' }}>
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <div className="fw-bold text-light">{member.name}</div>
                          <small className="text-muted">{member.email}</small>
                        </div>
                      </div>
                      <div>
                        {isOwner ? (
                          <span className="badge bg-primary">Owner</span>
                        ) : (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onRemoveMember(member._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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

export default AddMemberModal;
