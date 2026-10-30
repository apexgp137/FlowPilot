import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ShieldCheck, Search, Filter, Calendar, Terminal } from 'lucide-react';

const ACTION_TYPES = [
  'LOGIN',
  'CREATE_APPLICATION',
  'UPDATE_WORKFLOW',
  'CREATE_COMPLIANCE',
  'VERIFY_COMPLIANCE',
  'SCHEDULE_EVC',
  'UPDATE_EVC',
  'CREATE_INSTITUTION',
  'CREATE_USER'
];

export const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (actionFilter) params.action_type = actionFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.getAuditLogs(params);
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError('Unable to fetch system audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [search, actionFilter, startDate, endDate]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>System Security & Regulatory Audit Trail</h2>
          <p>
            Immutable compliance log of administrative authentications, workflow decisions, committee appointments, and data modifications.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="input-control"
            placeholder="Search by User Email, Entity Ref, or Action Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-control"
          style={{ width: 'auto', minWidth: '180px' }}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="">All Action Types</option>
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <input
          type="date"
          className="input-control"
          style={{ width: 'auto' }}
          title="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="input-control"
          style={{ width: 'auto' }}
          title="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        {(search || actionFilter || startDate || endDate) && (
          <button
            onClick={() => {
              setSearch('');
              setActionFilter('');
              setStartDate('');
              setEndDate('');
            }}
            className="btn-secondary btn-sm"
          >
            Reset
          </button>
        )}
      </div>

      {/* Audit Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Type</th>
                <th>User / Authority</th>
                <th>Role</th>
                <th>Target Entity</th>
                <th>Audit Description</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Loading audit trail records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap', color: '#64748b' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 7px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          color: '#1e293b',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        {log.action_type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.user_name || log.user_email}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{log.user_email}</div>
                    </td>
                    <td>
                      <StatusBadge value={log.user_role} />
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb' }}>
                        {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#334155', maxWidth: '320px' }}>
                      {log.description}
                    </td>
                    <td style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
