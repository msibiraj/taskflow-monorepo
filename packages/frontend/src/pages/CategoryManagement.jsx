import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (type) => {
    switch(type) {
      case 'productive': return '🟢';
      case 'neutral': return '🟡';
      case 'distracting': return '🔴';
      default: return '⚪';
    }
  };

  const getCategoryClass = (type) => {
    switch(type) {
      case 'productive': return 'productive';
      case 'neutral': return 'neutral';
      case 'distracting': return 'distracting';
      default: return '';
    }
  };

  const filteredCategories = activeTab === 'all' 
    ? categories 
    : categories.filter(c => c.type === activeTab);

  const productiveCategories = categories.filter(c => c.type === 'productive');
  const neutralCategories = categories.filter(c => c.type === 'neutral');
  const distractingCategories = categories.filter(c => c.type === 'distracting');

  if (loading) {
    return (
      <div className="category-management">
        <h2>Loading categories...</h2>
      </div>
    );
  }

  return (
    <div className="category-management">
      <div className="category-header">
        <div>
          <h1>📊 Category Management</h1>
          <p className="subtitle">Manage how activities are categorized for productivity tracking</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="category-summary">
        <div className="summary-card productive">
          <div className="summary-icon">🟢</div>
          <div className="summary-content">
            <h3>{productiveCategories.length}</h3>
            <p>Productive</p>
            <small>Increases productivity score</small>
          </div>
        </div>

        <div className="summary-card neutral">
          <div className="summary-icon">🟡</div>
          <div className="summary-content">
            <h3>{neutralCategories.length}</h3>
            <p>Neutral</p>
            <small>No effect on score</small>
          </div>
        </div>

        <div className="summary-card distracting">
          <div className="summary-icon">🔴</div>
          <div className="summary-content">
            <h3>{distractingCategories.length}</h3>
            <p>Distracting</p>
            <small>Decreases productivity score</small>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="category-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({categories.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'productive' ? 'active' : ''}`}
          onClick={() => setActiveTab('productive')}
        >
          🟢 Productive ({productiveCategories.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'neutral' ? 'active' : ''}`}
          onClick={() => setActiveTab('neutral')}
        >
          🟡 Neutral ({neutralCategories.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'distracting' ? 'active' : ''}`}
          onClick={() => setActiveTab('distracting')}
        >
          🔴 Distracting ({distractingCategories.length})
        </button>
      </div>

      {/* Category Grid */}
      <div className="category-grid">
        {filteredCategories.map(category => (
          <div key={category._id} className={`category-card ${getCategoryClass(category.type)}`}>
            <div className="category-card-header">
              <div className="category-title">
                <span className="category-icon">{getCategoryIcon(category.type)}</span>
                <h3>{category.name}</h3>
              </div>
              <span className="category-badge">{category.type}</span>
            </div>

            <div className="category-card-content">
              {/* Domains */}
              {category.domains && category.domains.length > 0 && (
                <div className="category-section">
                  <h4>🌐 Websites ({category.domains.length})</h4>
                  <div className="category-items">
                    {category.domains.slice(0, 5).map((domain, idx) => (
                      <div key={idx} className="category-item">
                        {domain}
                      </div>
                    ))}
                    {category.domains.length > 5 && (
                      <div className="category-item more">
                        +{category.domains.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Applications */}
              {category.applications && category.applications.length > 0 && (
                <div className="category-section">
                  <h4>💻 Applications ({category.applications.length})</h4>
                  <div className="category-items">
                    {category.applications.slice(0, 5).map((app, idx) => (
                      <div key={idx} className="category-item">
                        {app}
                      </div>
                    ))}
                    {category.applications.length > 5 && (
                      <div className="category-item more">
                        +{category.applications.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {category.domains.length === 0 && category.applications.length === 0 && (
                <div className="category-empty">
                  <small>No domains or applications defined</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="empty-state">
          <h3>No categories found</h3>
          <p>Run the seed script to create default categories:</p>
          <pre>cd packages/backend && node seed-categories.js</pre>
        </div>
      )}

      {/* Information Panel */}
      <div className="info-panel">
        <h3>💡 How Categories Work</h3>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon productive">🟢</div>
            <div className="info-content">
              <h4>Productive</h4>
              <p>Activities that contribute to your work and goals. These increase your productivity score.</p>
              <small className="examples">Examples: GitHub, VS Code, Documentation, Learning platforms</small>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon neutral">🟡</div>
            <div className="info-content">
              <h4>Neutral</h4>
              <p>Activities that are neither productive nor distracting. No effect on productivity score.</p>
              <small className="examples">Examples: Email, Calendar, File managers, Communication tools</small>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon distracting">🔴</div>
            <div className="info-content">
              <h4>Distracting</h4>
              <p>Activities that take you away from work. These decrease your productivity score.</p>
              <small className="examples">Examples: Social media, YouTube, News sites, Shopping, Gaming</small>
            </div>
          </div>
        </div>

        <div className="info-note">
          <strong>Note:</strong> Activities without a matching category are automatically marked as "neutral". 
          Task timers are always marked as "productive" regardless of categories.
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
