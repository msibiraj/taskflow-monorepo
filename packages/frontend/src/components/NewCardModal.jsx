import React, { useState } from 'react';

const NewCardModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Create New Card</h5><button type="button" className="btn-close" onClick={onClose}></button></div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3"><label className="form-label">Card Title</label><input type="text" className="form-control form-control-custom" placeholder="Task name" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
              <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control form-control-custom" rows="3" placeholder="Add more details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea></div>
              <div className="mb-3"><label className="form-label">Priority</label><select className="form-control form-control-custom" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-outline-custom" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-custom">Create Card</button></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCardModal;
