import React, { useState } from 'react';

const NewListModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(title);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Create New List</h5><button type="button" className="btn-close" onClick={onClose}></button></div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3"><label className="form-label">List Title</label><input type="text" className="form-control form-control-custom" placeholder="To Do, In Progress, Done..." value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-outline-custom" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-custom">Create List</button></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewListModal;
