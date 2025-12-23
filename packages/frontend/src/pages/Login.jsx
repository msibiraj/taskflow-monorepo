import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="text-center mb-4">
          <span className="text-gradient">Welcome Back</span>
        </h1>
        <p className="text-center text-muted mb-4">Login to your workspace</p>

        {error && (
          <div className="alert alert-danger alert-custom mb-4" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control form-control-custom"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control form-control-custom"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-custom w-100 mb-3"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center">
            <span className="text-muted">Don't have an account? </span>
            <button
              type="button"
              className="btn btn-link text-decoration-none"
              onClick={() => navigate('/register')}
              style={{ color: 'var(--primary)' }}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
