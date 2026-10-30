import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  ExternalLink,
  CheckCheck,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  'Application Deadline',
  'Application Overdue',
  'Compliance Deadline',
  'Compliance Overdue',
  'Upcoming EVC',
  'Workflow Action Pending',
  'General Notice'
];

export const Alerts = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isReadFilter, setIsReadFilter] = useState('');

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (isReadFilter !== '') params.is_read = isReadFilter;

      const res = await api.getAlerts(params);
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Unable to fetch alerts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [categoryFilter, priorityFilter, isReadFilter]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markAlertRead(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: 1 } : a));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      setAlerts(alerts.map(a => ({ ...a, is_read: 1 })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const navigateToRelated = (alert) => {
    if (alert.application_id) {
      navigate(`/applications?selected=${alert.application_id}`);
    } else if (alert.compliance_id) {
      navigate(`/compliance`);
    } else if (alert.evc_id) {
      navigate(`/evc`);
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Centralized Alerts & Deadline Management</h2>
          <p>
            Real-time notifications for statutory deadline lapses, approaching compliance dates, committee inspections, and appellate actions.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary"
          >
            <CheckCheck size={16} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          className="select-control"
          style={{ width: 'auto', minWidth: '200px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Alert Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="select-control"
          style={{ width: 'auto', minWidth: '150px' }}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          className="select-control"
          style={{ width: 'auto', minWidth: '140px' }}
          value={isReadFilter}
          onChange={(e) => setIsReadFilter(e.target.value)}
        >
          <option value="">Read & Unread</option>
          <option value="false">Unread Only</option>
          <option value="true">Read Only</option>
        </select>

        {(categoryFilter || priorityFilter || isReadFilter !== '') && (
          <button
            onClick={() => {
              setCategoryFilter('');
              setPriorityFilter('');
              setIsReadFilter('');
            }}
            className="btn-secondary btn-sm"
          >
            Reset
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="card">
        <div className="card-body" style={{ padding: '12px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
              Loading alert notifications...
            </div>
          ) : alerts.length === 0 ? (
            <div className="empty-state">
              <Bell size={40} />
              <h4>No alerts matching filters</h4>
              <p>All approval deadlines and statutory milestones are currently in regular order.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.map((al) => {
                const isOverdue = al.category.includes('Overdue') || al.priority === 'Critical';
                return (
                  <div
                    key={al.id}
                    style={{
                      border: `1px solid ${!al.is_read ? (isOverdue ? '#fca5a5' : '#bfdbfe') : '#e2e8f0'}`,
                      backgroundColor: !al.is_read ? (isOverdue ? '#fff5f5' : '#f8faff') : '#ffffff',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          backgroundColor: isOverdue ? '#fee2e2' : '#eff6ff',
                          color: isOverdue ? '#dc2626' : '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isOverdue ? <AlertTriangle size={20} /> : <Clock size={20} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                            {al.title}
                          </span>
                          <StatusBadge value={al.priority} />
                          <span
                            style={{
                              fontSize: '11px',
                              backgroundColor: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              color: '#475569',
                              fontWeight: 500
                            }}
                          >
                            {al.category}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          {al.institution_name && <span><strong>Institution:</strong> {al.institution_name}</span>}
                          {al.application_ref && <span><strong>App:</strong> {al.application_ref}</span>}
                          {al.due_date && <span><strong>Target Date:</strong> {al.due_date}</span>}
                          <span>&bull; {new Date(al.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {(al.application_id || al.compliance_id || al.evc_id) && (
                        <button
                          onClick={() => navigateToRelated(al)}
                          className="btn-secondary btn-sm"
                          title="Open associated application or compliance record"
                        >
                          <ExternalLink size={14} />
                          <span>Inspect Item</span>
                        </button>
                      )}

                      {!al.is_read ? (
                        <button
                          onClick={() => handleMarkAsRead(al.id)}
                          className="btn-secondary btn-sm"
                          style={{ color: '#059669' }}
                          title="Acknowledge alert"
                        >
                          <CheckCircle size={14} />
                          <span>Acknowledge</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCheck size={14} />
                          <span>Read</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
