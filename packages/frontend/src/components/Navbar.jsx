import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ onBack }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        <a className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Task<span>Flow</span>
        </a>
        <div className="d-flex align-items-center gap-3">
          {onBack && (
            <button className="btn btn-outline-custom btn-sm" onClick={onBack}>
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
          )}
          {!onBack && location.pathname !== '/analytics' && location.pathname !== '/categories' && (
            <>
              <button className="btn btn-outline-custom btn-sm" onClick={() => navigate('/analytics')}>
                <i className="bi bi-graph-up me-2"></i>
                Analytics
              </button>
              <button className="btn btn-outline-custom btn-sm" onClick={() => navigate('/categories')}>
                <i className="bi bi-tags me-2"></i>
                Categories
              </button>
            </>
          )}
          {location.pathname === '/analytics' && (
            <>
              <button className="btn btn-outline-custom btn-sm" onClick={() => navigate('/dashboard')}>
                <i className="bi bi-kanban me-2"></i>
                Boards
              </button>
              <button className="btn btn-outline-custom btn-sm" onClick={() => navigate('/categories')}>
                <i className="bi bi-tags me-2"></i>
                Categories
              </button>
            </>
          )}
          {location.pathname === '/categories' && (
            <>
              <button className="btn btn-outline-custom btn-sm" onClick={() => navigate('/dashboard')}>
                <i className="bi bi-kanban me-2"></i>
                Boards
              </button>
              <button className="btn btn-outline-custom btn-sm" onClick={() => navigate('/analytics')}>
                <i className="bi bi-graph-up me-2"></i>
                Analytics
              </button>
            </>
          )}
          <span className="text-light d-none d-md-inline">
            Welcome, <strong>{user?.name}</strong>
          </span>
          <button className="btn btn-outline-custom btn-sm" onClick={logout}>
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
