import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  CalendarCheck,
  Building,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileCheck
} from 'lucide-react';

export const Dashboard = () => {
  const { user, isInstitution, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      setIsLoading(false);
      try {
        const res = await api.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
        setError('Failed to load real-time statistics from server.');
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 0.8s linear infinite' }}></div>
        <p>Loading real-time workflow metrics...</p>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalApplications: 0,
    pendingApplications: 0,
    inProgressApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    highPriorityApplications: 0,
    totalCompliance: 0,
    pendingCompliance: 0,
    overdueCompliance: 0,
    upcomingVisits: 0,
    totalInstitutions: 0
  };

  const statusDist = stats?.charts?.statusDistribution || [];
  const stageDist = stats?.charts?.stageDistribution || [];
  const complianceDist = stats?.charts?.complianceDistribution || [];
  const recentApps = stats?.recentApplications || [];
  const overdueComp = stats?.overdueCompliance || [];
  const upcomingVisits = stats?.upcomingVisits || [];
  const recentActivity = stats?.recentActivities || [];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>
            {isInstitution ? `${user?.institution_name || 'Institution'} Dashboard` : 'FlowPilot Central Approval & Compliance Dashboard'}
          </h2>
          <p>
            {isInstitution
              ? 'Monitor your institution’s approval submissions, statutory compliance mandates, and scheduled committee visits.'
              : 'Real-time overview of active technical institution approvals, scrutiny workflows, committee inspections, and compliance tracking.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/applications')}
            className="btn-primary"
          >
            <PlusCircle size={16} />
            <span>{isInstitution ? 'Submit New Application' : 'Create Application'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => navigate('/applications')}>
          <div className="metric-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <FileText size={22} />
          </div>
          <div className="metric-info">
            <h4>Total Applications</h4>
            <div className="metric-number">{summary.totalApplications}</div>
            <div className="metric-subtext">Active filing records</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/applications?status=Pending')}>
          <div className="metric-icon-box" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div className="metric-info">
            <h4>Pending Review</h4>
            <div className="metric-number">{summary.pendingApplications}</div>
            <div className="metric-subtext">Awaiting next action</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/applications?status=In Progress')}>
          <div className="metric-icon-box" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
            <TrendingUp size={22} />
          </div>
          <div className="metric-info">
            <h4>In Progress</h4>
            <div className="metric-number">{summary.inProgressApplications}</div>
            <div className="metric-subtext">Scrutiny & EVC stage</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/applications?status=Approved')}>
          <div className="metric-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-info">
            <h4>Approved</h4>
            <div className="metric-number">{summary.approvedApplications}</div>
            <div className="metric-subtext">Approval granted</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/applications?status=Rejected')}>
          <div className="metric-icon-box" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <XCircle size={22} />
          </div>
          <div className="metric-info">
            <h4>Rejected</h4>
            <div className="metric-number">{summary.rejectedApplications}</div>
            <div className="metric-subtext">Disapproved filings</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/applications?priority=High')}>
          <div className="metric-icon-box" style={{ backgroundColor: '#fef2f2', color: '#e11d48' }}>
            <AlertOctagon size={22} />
          </div>
          <div className="metric-info">
            <h4>High Priority</h4>
            <div className="metric-number">{summary.highPriorityApplications}</div>
            <div className="metric-subtext">Requiring urgent focus</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/compliance')}>
          <div className="metric-icon-box" style={{ backgroundColor: '#eff6ff', color: '#4f46e5' }}>
            <FileCheck size={22} />
          </div>
          <div className="metric-info">
            <h4>Pending Compliance</h4>
            <div className="metric-number">{summary.pendingCompliance}</div>
            <div className="metric-subtext">Submissions due</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/compliance?overdue_only=true')}>
          <div className="metric-icon-box" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="metric-info">
            <h4>Overdue Tasks</h4>
            <div className="metric-number">{summary.overdueCompliance}</div>
            <div className="metric-subtext">Exceeded deadline</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => navigate('/evc')}>
          <div className="metric-icon-box" style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}>
            <CalendarCheck size={22} />
          </div>
          <div className="metric-info">
            <h4>Upcoming EVC Visits</h4>
            <div className="metric-number">{summary.upcomingVisits}</div>
            <div className="metric-subtext">Scheduled inspections</div>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Status Distribution Visualizer */}
        <div className="card">
          <div className="card-header">
            <h3>Application Status Distribution</h3>
          </div>
          <div className="card-body">
            {statusDist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No application status records found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {statusDist.map((item) => {
                  const pct = summary.totalApplications > 0 ? Math.round((item.count / summary.totalApplications) * 100) : 0;
                  const colorMap = {
                    Approved: '#10b981',
                    'In Progress': '#2563eb',
                    Pending: '#f59e0b',
                    Returned: '#8b5cf6',
                    Rejected: '#ef4444'
                  };
                  const barColor = colorMap[item.name] || '#64748b';
                  return (
                    <div key={item.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                        <span>{item.name}</span>
                        <span>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Workflow Stage Distribution */}
        <div className="card">
          <div className="card-header">
            <h3>Workflow Stage Breakdown</h3>
          </div>
          <div className="card-body">
            {stageDist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No workflow stages recorded.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stageDist.map((st) => {
                  const pct = summary.totalApplications > 0 ? Math.round((st.count / summary.totalApplications) * 100) : 0;
                  return (
                    <div key={st.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        <span>{st.name}</span>
                        <span>{st.count}</span>
                      </div>
                      <div style={{ height: '7px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#0d9488', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Compliance Distribution */}
        <div className="card">
          <div className="card-header">
            <h3>Compliance Status Metrics</h3>
          </div>
          <div className="card-body">
            {complianceDist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No compliance items recorded.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {complianceDist.map((comp) => {
                  const total = summary.totalCompliance || 1;
                  const pct = Math.round((comp.count / total) * 100);
                  const color = comp.name === 'Verified' ? '#10b981' :
                                comp.name === 'Overdue' ? '#ef4444' :
                                comp.name === 'Submitted' ? '#3b82f6' : '#f59e0b';
                  return (
                    <div key={comp.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                        <span>{comp.name}</span>
                        <span>{comp.count} items ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Applications & Overdue / Action Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Applications</h3>
            <button
              onClick={() => navigate('/applications')}
              style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref No.</th>
                  <th>Institution / Type</th>
                  <th>Current Stage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No recent applications found.</td>
                  </tr>
                ) : (
                  recentApps.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => navigate(`/applications?selected=${app.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="ref-cell">{app.reference_no}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.application_type}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{app.institution_name}</div>
                      </td>
                      <td>
                        <StatusBadge value={app.current_stage} />
                      </td>
                      <td>
                        <StatusBadge value={app.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overdue / Urgent Compliance Items */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#dc2626" />
              <h3 style={{ color: '#b91c1c' }}>Overdue & Critical Items</h3>
            </div>
            <button
              onClick={() => navigate('/compliance')}
              style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Institution</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {overdueComp.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#16a34a', padding: '24px' }}>
                      <CheckCircle2 size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                      No overdue compliance tasks recorded.
                    </td>
                  </tr>
                ) : (
                  overdueComp.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/compliance`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.requirement_title}</td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>{item.institution_name}</td>
                      <td style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>{item.due_date}</td>
                      <td>
                        <StatusBadge value="Overdue" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming EVC Visits & Recent Workflow Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        {/* Upcoming EVC Visits */}
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Expert Visit Committee (EVC) Visits</h3>
            <button
              onClick={() => navigate('/evc')}
              style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Schedule / View</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body">
            {upcomingVisits.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No upcoming EVC visits scheduled.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingVisits.map((visit) => (
                  <div
                    key={visit.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                        {visit.institution_name} ({visit.application_ref})
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Lead Expert: {visit.lead_expert_name || 'Panel in Formation'} &bull; Mode: {visit.visit_mode}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0d9488' }}>
                        {visit.proposed_visit_date}
                      </span>
                      <StatusBadge value={visit.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Workflow Timeline */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Workflow Transitions</h3>
            <button
              onClick={() => navigate('/workflow-history')}
              style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Full History</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body">
            {recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No recent workflow changes logged.</div>
            ) : (
              <div className="timeline-list">
                {recentActivity.map((act) => (
                  <div key={act.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span><strong>{act.reference_no}</strong> &bull; {act.institution_name}</span>
                        <span>{new Date(act.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
                        Stage changed to <strong>{act.new_stage}</strong> (Status: <em>{act.new_status}</em>)
                      </div>
                      {act.remarks && (
                        <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                          "{act.remarks}"
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        Changed by: {act.actor_name} ({act.actor_role})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
