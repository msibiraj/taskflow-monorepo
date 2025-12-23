import React, { useState } from 'react';

const NewBoardModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ title, description });
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Create New Board</h5><button type="button" className="btn-close" onClick={onClose}></button></div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3"><label className="form-label">Board Title</label><input type="text" className="form-control form-control-custom" placeholder="My Awesome Project" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control form-control-custom" rows="3" placeholder="What's this board about?" value={description} onChange={(e) => setDescription(e.target.value)}></textarea></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-outline-custom" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-custom">Create Board</button></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBoardModal;
