import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { History, Search, ArrowRight, UserCheck, Calendar } from 'lucide-react';

export const WorkflowHistory = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchWorkflowHistory = async () => {
    setIsLoading(true);
    try {
      // Load recent activities from dashboard endpoint which aggregates workflow history
      const res = await api.getDashboardStats();
      if (res.success && res.data.recentActivities) {
        setActivities(res.data.recentActivities);
      }
    } catch (err) {
      console.error('Failed to load workflow history:', err);
      setError('Unable to fetch workflow audit history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowHistory();
  }, []);

  const filtered = activities.filter(a => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (a.reference_no && a.reference_no.toLowerCase().includes(term)) ||
      (a.institution_name && a.institution_name.toLowerCase().includes(term)) ||
      (a.actor_name && a.actor_name.toLowerCase().includes(term)) ||
      (a.new_stage && a.new_stage.toLowerCase().includes(term)) ||
      (a.remarks && a.remarks.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>System Workflow History & Movement Log</h2>
          <p>
            Chronological audit log tracking application movement from initial submission through Scrutiny, EVC inspection, and final council decisions.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="input-control"
            placeholder="Search by Application Ref, Institution, Officer, or Remarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="btn-secondary btn-sm">
            Clear
          </button>
        )}
      </div>

      {/* Timeline Card */}
      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
              Loading workflow chronological entries...
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <History size={40} />
              <h4>No workflow history logged</h4>
              <p>Workflow events will appear here as applications advance across approval processing stages.</p>
            </div>
          ) : (
            <div className="timeline-list">
              {filtered.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-meta">
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {item.reference_no} &bull; {item.institution_name}
                      </span>
                      <span style={{ color: '#64748b' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '8px 0' }}>
                      <span style={{ fontSize: '13px', color: '#475569' }}>Stage Transition:</span>
                      <StatusBadge value={item.previous_stage || 'Submitted'} />
                      <span>&rarr;</span>
                      <StatusBadge value={item.new_stage} />
                      <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
                      <span style={{ fontSize: '13px', color: '#475569' }}>Status:</span>
                      <StatusBadge value={item.new_status} />
                    </div>

                    {item.remarks && (
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#334155',
                          marginTop: '8px'
                        }}
                      >
                        <strong>Recorded Remarks:</strong> "{item.remarks}"
                      </div>
                    )}

                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={14} color="#2563eb" />
                      <span>Action Authorized By: <strong>{item.actor_name}</strong> ({item.actor_role})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
