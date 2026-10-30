import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  CalendarCheck,
  Search,
  Plus,
  Clock,
  UserCheck,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const EVC_STATUSES = ['Proposed', 'Confirmed', 'Completed', 'Rescheduled', 'Cancelled'];
const VISIT_MODES = ['Physical On-Site', 'Virtual / Online EVC'];

export const EVCScheduling = () => {
  const { user, isAdmin, isOfficial, isInstitution } = useAuth();

  const [visits, setVisits] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    application_id: '',
    proposed_visit_date: '',
    lead_expert_name: '',
    expert_panel: '',
    visit_mode: VISIT_MODES[0],
    status: 'Proposed',
    visit_notes: ''
  });

  const [updateForm, setUpdateForm] = useState({
    proposed_visit_date: '',
    status: 'Confirmed',
    visit_notes: '',
    report_summary: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (upcomingOnly) params.upcoming_only = 'true';

      const res = await api.getEvcVisits(params);
      if (res.success) {
        setVisits(res.data);
      }
    } catch (err) {
      console.error('Failed to load EVC visits:', err);
      setError('Unable to fetch EVC inspection schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [search, statusFilter, upcomingOnly]);

  useEffect(() => {
    async function loadApps() {
      if (!isInstitution) {
        try {
          const res = await api.getApplications();
          if (res.success && res.data.length > 0) {
            setApplications(res.data);
            if (!scheduleForm.application_id) {
              setScheduleForm(prev => ({ ...prev, application_id: res.data[0].id }));
            }
          }
        } catch (e) {}
      }
    }
    loadApps();
  }, [isInstitution]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.scheduleEvcVisit(scheduleForm);
      if (res.success) {
        setSuccessMsg('EVC inspection visit scheduled successfully.');
        setIsScheduleOpen(false);
        setScheduleForm({
          application_id: applications[0]?.id || '',
          proposed_visit_date: '',
          lead_expert_name: '',
          expert_panel: '',
          visit_mode: VISIT_MODES[0],
          status: 'Proposed',
          visit_notes: ''
        });
        fetchVisits();
      }
    } catch (err) {
      setError(err.message || 'Failed to schedule EVC visit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.updateEvcVisit(selectedVisit.id, updateForm);
      if (res.success) {
        setSuccessMsg(`EVC visit updated to ${updateForm.status}.`);
        setIsUpdateModalOpen(false);
        fetchVisits();
      }
    } catch (err) {
      setError(err.message || 'Failed to update EVC visit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUpdate = (visit) => {
    setSelectedVisit(visit);
    setUpdateForm({
      proposed_visit_date: visit.proposed_visit_date,
      status: visit.status,
      visit_notes: visit.visit_notes || '',
      report_summary: visit.report_summary || ''
    });
    setIsUpdateModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Expert Visit Committee (EVC) Scheduling</h2>
          <p>
            Coordinate and monitor peer-review expert panel inspections, lab infrastructure verifications, and compliance audits.
          </p>
        </div>
        {!isInstitution && (
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Schedule EVC Inspection</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}

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
            placeholder="Search by Institution, Application Ref, or Expert Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-control"
          style={{ width: 'auto', minWidth: '150px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Visit Statuses</option>
          {EVC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0d9488', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
          />
          <span>Upcoming Only</span>
        </label>

        {(search || statusFilter || upcomingOnly) && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setUpcomingOnly(false);
            }}
            className="btn-secondary btn-sm"
          >
            Reset
          </button>
        )}
      </div>

      {/* Visits Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Proposed Date</th>
                <th>Institution & Location</th>
                <th>Application Reference</th>
                <th>Inspection Mode</th>
                <th>Lead Expert / Panel</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Loading EVC inspection schedules...
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No EVC inspection visits found.
                  </td>
                </tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                        {v.proposed_visit_date}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(v.proposed_visit_date) >= new Date() ? 'Scheduled Ahead' : 'Passed Date'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.institution_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {v.institution_city}, {v.institution_state}
                      </div>
                    </td>
                    <td className="ref-cell">
                      <div>{v.application_ref}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{v.application_type}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                        {v.visit_mode}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e3a8a' }}>
                        {v.lead_expert_name || 'Panel Under Constitution'}
                      </div>
                      {v.expert_panel && (
                        <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Panel: {v.expert_panel}
                        </div>
                      )}
                    </td>
                    <td>
                      <StatusBadge value={v.status} />
                    </td>
                    <td>
                      {(isAdmin || isOfficial) ? (
                        <button
                          onClick={() => openUpdate(v)}
                          className="btn-secondary btn-sm"
                        >
                          Update Status / Report
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Official Managed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule EVC Visit Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Expert Visit Committee (EVC) Inspection"
        maxWidth="640px"
      >
        <form onSubmit={handleScheduleSubmit}>
          <div className="form-group">
            <label>Select Target Application *</label>
            <select
              className="select-control"
              value={scheduleForm.application_id}
              onChange={(e) => setScheduleForm({ ...scheduleForm, application_id: e.target.value })}
              required
            >
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.reference_no} - {app.institution_name} ({app.application_type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Proposed Visit Date *</label>
              <input
                type="date"
                className="input-control"
                value={scheduleForm.proposed_visit_date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, proposed_visit_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Inspection Mode</label>
              <select
                className="select-control"
                value={scheduleForm.visit_mode}
                onChange={(e) => setScheduleForm({ ...scheduleForm, visit_mode: e.target.value })}
              >
                {VISIT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Lead Expert Member (Chairperson)</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Prof. B. K. Murthy (IIT Madras)"
              value={scheduleForm.lead_expert_name}
              onChange={(e) => setScheduleForm({ ...scheduleForm, lead_expert_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Empanelled Committee Members</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Dr. Priya Mani (NIT Trichy), Prof. S. Joshi (VJTI)"
              value={scheduleForm.expert_panel}
              onChange={(e) => setScheduleForm({ ...scheduleForm, expert_panel: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Initial Status</label>
            <select
              className="select-control"
              value={scheduleForm.status}
              onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
            >
              <option value="Proposed">Proposed (Awaiting Expert Availability)</option>
              <option value="Confirmed">Confirmed (Panel & Institution Notified)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Inspection Directives & Focus Areas</label>
            <textarea
              className="textarea-control"
              rows="3"
              placeholder="List specific laboratory, library, computing facilities, and faculty interaction focus points..."
              value={scheduleForm.visit_notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, visit_notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsScheduleOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule EVC Visit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Visit Modal */}
      {selectedVisit && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Update EVC Visit: ${selectedVisit.application_ref}`}
          maxWidth="600px"
        >
          <form onSubmit={handleUpdateSubmit}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '18px', fontSize: '13px' }}>
              <div><strong>Institution:</strong> {selectedVisit.institution_name}</div>
              <div><strong>Application:</strong> {selectedVisit.application_ref}</div>
              <div><strong>Lead Expert:</strong> {selectedVisit.lead_expert_name || 'Pending'}</div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Visit Date</label>
                <input
                  type="date"
                  className="input-control"
                  value={updateForm.proposed_visit_date}
                  onChange={(e) => setUpdateForm({ ...updateForm, proposed_visit_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Visit Status</label>
                <select
                  className="select-control"
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                >
                  {EVC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Committee Report Summary & Recommendations</label>
              <textarea
                className="textarea-control"
                rows="4"
                placeholder="Record committee panel observations, recommendation for grant/rejection of approval, and condition clauses..."
                value={updateForm.report_summary}
                onChange={(e) => setUpdateForm({ ...updateForm, report_summary: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsUpdateModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Update EVC Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
