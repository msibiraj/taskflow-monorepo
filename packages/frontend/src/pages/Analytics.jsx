import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
      loadCategories();
      
      // 🆕 Auto-refresh analytics every 30 seconds for live updates
      const refreshInterval = setInterval(() => {
        loadAnalytics();
      }, 30000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      let startDate, endDate;
      
      switch(dateRange) {
        case 'today':
          startDate = endDate = today;
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          endDate = today;
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          startDate = monthAgo.toISOString().split('T')[0];
          endDate = today;
          break;
        default:
          startDate = endDate = today;
      }

      // Get summary
      const summaryRes = await api.get(`/analytics/summary?date=${today}`);
      setSummary(summaryRes.data);

      // Get activities
      const activitiesRes = await api.get(`/activities?startDate=${startDate}&endDate=${endDate}`);
      setActivities(activitiesRes.data);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getTopWebsites = () => {
    const websiteMap = {};
    activities
      .filter(a => a.type === 'website')
      .forEach(activity => {
        if (!websiteMap[activity.domain]) {
          websiteMap[activity.domain] = 0;
        }
        websiteMap[activity.domain] += activity.duration || 0;
      });

    return Object.entries(websiteMap)
      .map(([domain, time]) => ({ domain, time }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);
  };

  const getTopApps = () => {
    const appMap = {};
    activities
      .filter(a => a.type === 'application')
      .forEach(activity => {
        if (!appMap[activity.application]) {
          appMap[activity.application] = 0;
        }
        appMap[activity.application] += activity.duration || 0;
      });

    return Object.entries(appMap)
      .map(([app, time]) => ({ app, time }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);
  };

  const getTotalTime = () => {
    return activities.reduce((sum, a) => sum + (a.duration || 0), 0);
  };

  const getCategoryBreakdown = () => {
    const breakdown = {
      productive: 0,
      neutral: 0,
      distracting: 0
    };

    activities.forEach(activity => {
      if (activity.category) {
        // Handle both string categories ('productive', 'neutral', 'distracting') 
        // and ObjectId references to Category model
        if (typeof activity.category === 'string') {
          // Direct string category (e.g., from task timer)
          if (breakdown[activity.category] !== undefined) {
            breakdown[activity.category] += activity.duration || 0;
          } else {
            breakdown.neutral += activity.duration || 0;
          }
        } else {
          // ObjectId reference (e.g., from browser/desktop tracking)
          const cat = categories.find(c => c._id === activity.category);
          if (cat) {
            breakdown[cat.type] += activity.duration || 0;
          } else {
            breakdown.neutral += activity.duration || 0;
          }
        }
      } else {
        breakdown.neutral += activity.duration || 0;
      }
    });

    return breakdown;
  };

  if (loading && !summary) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading Analytics...</h2>
      </div>
    );
  }

  const totalTime = getTotalTime();
  const topWebsites = getTopWebsites();
  const topApps = getTopApps();
  const categoryBreakdown = getCategoryBreakdown();
  const productivityScore = totalTime > 0 
    ? Math.round((categoryBreakdown.productive / totalTime) * 100) 
    : 0;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
      <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '900',
            background: 'linear-gradient(135deg, #FF006E, #00F0FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            📊 Analytics Dashboard
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 15px',
            background: '#1a1a1a',
            border: '2px solid #06FFA5',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#06FFA5'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#06FFA5',
              animation: 'pulse 2s infinite'
            }}></span>
            LIVE
          </div>
        </div>
        
        <select 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            border: '2px solid #3a3a3a',
            background: '#1a1a1a',
            color: '#f8f8f8',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#1a1a1a',
          border: '2px solid #3a3a3a',
          borderRadius: '8px',
          padding: '25px'
        }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Time
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#00F0FF' }}>
            {formatTime(totalTime)}
          </div>
        </div>

        <div style={{
          background: '#1a1a1a',
          border: '2px solid #3a3a3a',
          borderRadius: '8px',
          padding: '25px'
        }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Productivity Score
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#06FFA5' }}>
            {productivityScore}%
          </div>
        </div>

        <div style={{
          background: '#1a1a1a',
          border: '2px solid #3a3a3a',
          borderRadius: '8px',
          padding: '25px'
        }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Websites Tracked
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#FF006E' }}>
            {topWebsites.length}
          </div>
        </div>

        <div style={{
          background: '#1a1a1a',
          border: '2px solid #3a3a3a',
          borderRadius: '8px',
          padding: '25px'
        }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Apps Tracked
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#FFBE0B' }}>
            {topApps.length}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '20px' }}>
          Time by Category
        </h2>
        <div style={{ 
          background: '#1a1a1a',
          border: '2px solid #3a3a3a',
          borderRadius: '8px',
          padding: '25px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#06FFA5' }}>🟢 Productive</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatTime(categoryBreakdown.productive)}</span>
            </div>
            <div style={{ 
              height: '8px', 
              background: '#2a2a2a', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                background: '#06FFA5',
                width: totalTime > 0 ? `${(categoryBreakdown.productive / totalTime) * 100}%` : '0%'
              }}></div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#FFBE0B' }}>🟡 Neutral</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatTime(categoryBreakdown.neutral)}</span>
            </div>
            <div style={{ 
              height: '8px', 
              background: '#2a2a2a', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                background: '#FFBE0B',
                width: totalTime > 0 ? `${(categoryBreakdown.neutral / totalTime) * 100}%` : '0%'
              }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#FF006E' }}>🔴 Distracting</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatTime(categoryBreakdown.distracting)}</span>
            </div>
            <div style={{ 
              height: '8px', 
              background: '#2a2a2a', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                background: '#FF006E',
                width: totalTime > 0 ? `${(categoryBreakdown.distracting / totalTime) * 100}%` : '0%'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Top Websites */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '20px' }}>
            🌐 Top Websites
          </h2>
          <div style={{ 
            background: '#1a1a1a',
            border: '2px solid #3a3a3a',
            borderRadius: '8px',
            padding: '25px'
          }}>
            {topWebsites.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                No website data yet. Install the browser extension to start tracking!
              </p>
            ) : (
              topWebsites.map((site, index) => (
                <div key={site.domain} style={{ 
                  padding: '15px 0',
                  borderBottom: index < topWebsites.length - 1 ? '1px solid #2a2a2a' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {site.domain}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        #{index + 1}
                      </div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#00F0FF' }}>
                      {formatTime(site.time)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Applications */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '20px' }}>
            💻 Top Applications
          </h2>
          <div style={{ 
            background: '#1a1a1a',
            border: '2px solid #3a3a3a',
            borderRadius: '8px',
            padding: '25px'
          }}>
            {topApps.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                No application data yet. Install the desktop agent to start tracking!
              </p>
            ) : (
              topApps.map((app, index) => (
                <div key={app.app} style={{ 
                  padding: '15px 0',
                  borderBottom: index < topApps.length - 1 ? '1px solid #2a2a2a' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {app.app}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        #{index + 1}
                      </div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#FF006E' }}>
                      {formatTime(app.time)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Analytics;
