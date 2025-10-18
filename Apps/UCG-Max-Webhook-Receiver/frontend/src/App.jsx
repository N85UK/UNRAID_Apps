import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    fetchAlerts();
    fetchMetrics();
    const interval = setInterval(() => {
      fetchAlerts();
      fetchMetrics();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams(Object.entries(filters).filter(([_, v]) => v));
      const response = await axios.get(`/api/alerts?${params}`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleExport = () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([_, v]) => v));
    window.open(`/api/alerts/export?${params}`, '_blank');
  };

  const getSeverityClass = (severity) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'severity-critical';
    if (s === 'major') return 'severity-major';
    if (s === 'warning') return 'severity-warning';
    return 'severity-info';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app">
      <header className="nav">
        <div className="brand">
          <svg className="logo-mark" viewBox="0 0 1024 1024" aria-hidden="true">
            <defs>
              <linearGradient id="g" x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stopColor="#C052E2"/>
                <stop offset="35%" stopColor="#7B61FF"/>
                <stop offset="70%" stopColor="#3BA3F5"/>
                <stop offset="100%" stopColor="#06B6D4"/>
              </linearGradient>
            </defs>
            <g stroke="url(#g)" strokeWidth="36" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="512,128 806,288 806,736 512,896 218,736 218,288"/>
            </g>
            <g fill="url(#g)">
              <circle cx="512" cy="128" r="28"/>
              <circle cx="806" cy="288" r="28"/>
              <circle cx="806" cy="736" r="28"/>
              <circle cx="512" cy="896" r="28"/>
              <circle cx="218" cy="736" r="28"/>
              <circle cx="218" cy="288" r="28"/>
            </g>
            <polygon points="512,220 761,654 263,654" fill="none" stroke="url(#g)" strokeWidth="120" strokeLinejoin="round"/>
            <polygon points="512,360 645,590 379,590" fill="url(#g)"/>
          </svg>
          <span className="brand-name">Webhook Receiver</span>
        </div>
        <button className="btn" onClick={handleExport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <h1>Alert Dashboard</h1>
            <p>Real-time webhook monitoring and alert management</p>
          </div>
        </section>

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{metrics.total_alerts || 0}</div>
            <div className="metric-label">Total Alerts</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.last_24h_count || 0}</div>
            <div className="metric-label">Last 24 Hours</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.severity_counts?.critical || 0}</div>
            <div className="metric-label severity-critical">Critical</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.severity_counts?.major || 0}</div>
            <div className="metric-label severity-major">Major</div>
          </div>
        </section>

        <section className="filters">
          <input
            type="text"
            className="filter-input"
            placeholder="Search alerts..."
            onChange={(e) => handleFilterChange('q', e.target.value)}
          />
          <select
            className="filter-select"
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            value={filters.severity || ''}
          >
            <option value="">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="major">Major</option>
            <option value="critical">Critical</option>
          </select>
          <input
            type="text"
            className="filter-input"
            placeholder="Device"
            onChange={(e) => handleFilterChange('device', e.target.value)}
          />
          <input
            type="text"
            className="filter-input"
            placeholder="Type"
            onChange={(e) => handleFilterChange('alert_type', e.target.value)}
          />
        </section>

        <section className="alerts-section">
          <div className="alerts-table">
            <div className="table-header">
              <div className="th">Time</div>
              <div className="th">Source</div>
              <div className="th">Severity</div>
              <div className="th">Device</div>
              <div className="th">Type</div>
              <div className="th">Summary</div>
            </div>
            <div className="table-body">
              {alerts.length === 0 ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p>No alerts found</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="tr" onClick={() => setSelectedAlert(alert)}>
                    <div className="td">{formatTime(alert.timestamp)}</div>
                    <div className="td">
                      <span className="pill">{alert.webhook_source || 'unknown'}</span>
                    </div>
                    <div className="td">
                      <span className={`badge ${getSeverityClass(alert.severity)}`}>
                        {alert.severity || 'info'}
                      </span>
                    </div>
                    <div className="td">{alert.device || 'N/A'}</div>
                    <div className="td">{alert.alert_type || 'N/A'}</div>
                    <div className="td summary">{alert.summary || 'No summary'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Alert Details</h2>
              <button className="btn-close" onClick={() => setSelectedAlert(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <pre className="json-view">{JSON.stringify(selectedAlert, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;