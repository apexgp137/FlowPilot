import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Building,
  User,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
  ChevronRight
} from 'lucide-react';

const STAGES = [
  'Submitted',
  'Scrutiny',
  'EVC / Review',
  'SAC/SHC',
  'Final Decision',
  'Completed',
  'Returned for Deficiency'
];

const STATUSES = ['Pending', 'In Progress', 'Returned', 'Approved', 'Rejected'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const APP_TYPES = [
  'Extension of Approval (EoA)',
  'Introduction of New Course',
  'Increase in Intake',
  'Change of Site/Location',
  'Closure of Course',
  'New Technical Institute'
];

export const Applications = () => {
  const { user, isInstitution, isAdmin, isOfficial } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Form states for creation
  const [createForm, setCreateForm] = useState({
    institution_id: isInstitution ? user.institution_id : '',
    application_type: APP_TYPES[0],
    academic_year: '2026-2027',
    workflow_route: 'Standard Bureau Review',
    priority: 'Medium',
    due_date: '',
    program_level: 'Undergraduate',
    intake_requested: 60,
    notes: ''
  });

  // State update form inside details modal
  const [workflowUpdate, setWorkflowUpdate] = useState({
    current_stage: '',
    status: '',
    remarks: ''
  });
  const [isUpdatingWorkflow, setIsUpdatingWorkflow] = useState(false);

  // Load applications list
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (stageFilter) params.stage = stageFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await api.getApplications(params);
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Unable to load applications list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, stageFilter, priorityFilter]);

  // Load institutions list for dropdown
  useEffect(() => {
    async function loadInsts() {
      if (!isInstitution) {
        try {
          const res = await api.getInstitutions();
          if (res.success) {
            setInstitutions(res.data);
            if (res.data.length > 0 && !createForm.institution_id) {
              setCreateForm(prev => ({ ...prev, institution_id: res.data[0].id }));
            }
          }
        } catch (e) {}
      }
    }
    loadInsts();
  }, [isInstitution]);

  // Open details if URL has selected param
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      openAppDetails(selectedId);
    }
  }, [searchParams]);

  const openAppDetails = async (id) => {
    setIsDetailLoading(true);
    try {
      const res = await api.getApplicationById(id);
      if (res.success) {
        setSelectedApp(res.data);
        setWorkflowUpdate({
          current_stage: res.data.current_stage,
          status: res.data.status,
          remarks: ''
        });
      }
    } catch (err) {
      console.error('Error fetching application details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.createApplication(createForm);
      if (res.success) {
        setSuccessMsg(`Application ${res.reference_no} created successfully.`);
        setIsCreateOpen(false);
        fetchApplications();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    }
  };

  const handleWorkflowTransition = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdatingWorkflow(true);
    setError('');
    try {
      const res = await api.updateWorkflow(selectedApp.id, {
        current_stage: workflowUpdate.current_stage,
        status: workflowUpdate.status,
        remarks: workflowUpdate.remarks
      });

      if (res.success) {
        setSuccessMsg(`Workflow updated: ${workflowUpdate.current_stage} (${workflowUpdate.status})`);
        // Refresh details
        await openAppDetails(selectedApp.id);
        fetchApplications();
      }
    } catch (err) {
      setError(err.message || 'Failed to update workflow.');
    } finally {
      setIsUpdatingWorkflow(false);
    }
  };

  // Helper for stepper stages
  const stepperStages = ['Submitted', 'Scrutiny', 'EVC / Review', 'SAC/SHC', 'Final Decision', 'Completed'];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Application Workflow Management</h2>
          <p>
            Track technical institution filings across Scrutiny, Expert Visit Committees, Appellate review, and final decisions.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>Submit Application</span>
        </button>
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

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="input-control"
            placeholder="Search by Ref No, Institution, or Type..."
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
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="select-control"
          style={{ width: 'auto', minWidth: '160px' }}
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="select-control"
          style={{ width: 'auto', minWidth: '130px' }}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p} Priority</option>)}
        </select>

        {(search || statusFilter || stageFilter || priorityFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setStageFilter('');
              setPriorityFilter('');
            }}
            className="btn-secondary btn-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Applications Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference Number</th>
                <th>Institution Name</th>
                <th>Application Type</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <FileCheck size={40} />
                      <h4>No applications matching criteria</h4>
                      <p>Adjust your search criteria or submit a new approval application to begin.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td className="ref-cell">
                      <span
                        onClick={() => openAppDetails(app.id)}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {app.reference_no}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.institution_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{app.institution_state}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{app.application_type}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Intake: {app.intake_requested} seats</div>
                    </td>
                    <td>
                      <StatusBadge value={app.current_stage} />
                    </td>
                    <td>
                      <StatusBadge value={app.status} />
                    </td>
                    <td>
                      <StatusBadge value={app.priority} />
                    </td>
                    <td style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>
                      {app.due_date}
                    </td>
                    <td>
                      <button
                        onClick={() => openAppDetails(app.id)}
                        className="btn-secondary btn-sm"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Application Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Submit AICTE Approval Application"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit}>
          {!isInstitution ? (
            <div className="form-group">
              <label>Select Target Institution *</label>
              <select
                className="select-control"
                value={createForm.institution_id}
                onChange={(e) => setCreateForm({ ...createForm, institution_id: e.target.value })}
                required
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.institution_code}) - {inst.state}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Applying Institution</label>
              <input
                type="text"
                className="input-control"
                value={`${user?.institution_name || 'My Institution'} (${user?.institution_code || ''})`}
                disabled
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Application Type *</label>
              <select
                className="select-control"
                value={createForm.application_type}
                onChange={(e) => setCreateForm({ ...createForm, application_type: e.target.value })}
              >
                {APP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Academic Year</label>
              <input
                type="text"
                className="input-control"
                value={createForm.academic_year}
                onChange={(e) => setCreateForm({ ...createForm, academic_year: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Program Level</label>
              <select
                className="select-control"
                value={createForm.program_level}
                onChange={(e) => setCreateForm({ ...createForm, program_level: e.target.value })}
              >
                <option value="Undergraduate">Undergraduate (UG)</option>
                <option value="Postgraduate">Postgraduate (PG)</option>
                <option value="Diploma">Diploma / Polytechnic</option>
              </select>
            </div>

            <div className="form-group">
              <label>Intake Requested (Seats)</label>
              <input
                type="number"
                className="input-control"
                min="0"
                value={createForm.intake_requested}
                onChange={(e) => setCreateForm({ ...createForm, intake_requested: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                className="select-control"
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Decision Due Date</label>
              <input
                type="date"
                className="input-control"
                value={createForm.due_date}
                onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Application Synopsis / Remarks</label>
            <textarea
              className="textarea-control"
              rows="3"
              placeholder="Outline the justification, infrastructure readiness, and department details..."
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Filing
            </button>
          </div>
        </form>
      </Modal>

      {/* Application Details & Workflow State Transition Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Application Details: ${selectedApp.reference_no}`}
          maxWidth="840px"
        >
          {isDetailLoading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Loading application details...</div>
          ) : (
            <div>
              {/* Overview Ribbon */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                    {selectedApp.application_type}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    <strong>{selectedApp.institution_name}</strong> &bull; {selectedApp.institution_city}, {selectedApp.institution_state}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <StatusBadge value={selectedApp.current_stage} />
                  <StatusBadge value={selectedApp.status} />
                  <StatusBadge value={selectedApp.priority} />
                </div>
              </div>

              {/* Visual Workflow Stepper */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Workflow Stage Progress
                </div>
                <div className="stepper-container">
                  {stepperStages.map((st, idx) => {
                    const currentIndex = stepperStages.indexOf(selectedApp.current_stage);
                    const isCompleted = currentIndex > idx;
                    const isActive = selectedApp.current_stage === st;
                    return (
                      <div
                        key={st}
                        className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                      >
                        <div className="step-circle">
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div className="step-label">{st}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Administrative Workflow Action Panel (Admin & Official Only) */}
              {(isAdmin || isOfficial) && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '18px',
                    marginBottom: '24px'
                  }}
                >
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={18} />
                    <span>Official Workflow Transition & Decision Panel</span>
                  </h4>
                  <form onSubmit={handleWorkflowTransition}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Target Workflow Stage</label>
                        <select
                          className="select-control"
                          value={workflowUpdate.current_stage}
                          onChange={(e) => setWorkflowUpdate({ ...workflowUpdate, current_stage: e.target.value })}
                        >
                          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Application Status Decision</label>
                        <select
                          className="select-control"
                          value={workflowUpdate.status}
                          onChange={(e) => setWorkflowUpdate({ ...workflowUpdate, status: e.target.value })}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Audited Decision Remarks / Scrutiny Observation *</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Provide official remarks (will be committed to immutable audit trail)..."
                        value={workflowUpdate.remarks}
                        onChange={(e) => setWorkflowUpdate({ ...workflowUpdate, remarks: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        className="btn-primary btn-sm"
                        disabled={isUpdatingWorkflow}
                      >
                        {isUpdatingWorkflow ? 'Committing...' : 'Commit Workflow Transition'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Application Details Summary Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  fontSize: '13px'
                }}
              >
                <div>
                  <span style={{ color: '#64748b' }}>Academic Year:</span>
                  <div style={{ fontWeight: 600 }}>{selectedApp.academic_year}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Workflow Route:</span>
                  <div style={{ fontWeight: 600 }}>{selectedApp.workflow_route}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Submission Date:</span>
                  <div style={{ fontWeight: 600 }}>{selectedApp.submission_date}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Decision Due Date:</span>
                  <div style={{ fontWeight: 600, color: '#dc2626' }}>{selectedApp.due_date}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Requested Intake:</span>
                  <div style={{ fontWeight: 600 }}>{selectedApp.intake_requested} Seats</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Submitted By:</span>
                  <div style={{ fontWeight: 600 }}>{selectedApp.creator_name || 'System Admin'}</div>
                </div>
              </div>

              {/* Notes */}
              {selectedApp.notes && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Institutional Submission Notes:
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }}>
                    {selectedApp.notes}
                  </div>
                </div>
              )}

              {/* Workflow History Chronological Timeline */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={16} />
                  <span>Immutable Workflow History ({selectedApp.history?.length || 0} events)</span>
                </div>
                {selectedApp.history && selectedApp.history.length > 0 ? (
                  <div className="timeline-list">
                    {selectedApp.history.map((h) => (
                      <div key={h.id} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-meta">
                            <span>{new Date(h.created_at).toLocaleString()}</span>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>By: {h.changed_by_name} ({h.changed_by_role})</span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600, marginBottom: '4px' }}>
                            Stage: {h.previous_stage} &rarr; {h.new_stage} &bull; Status: {h.new_status}
                          </div>
                          {h.remarks && (
                            <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
                              "{h.remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>No workflow transitions logged yet.</div>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
