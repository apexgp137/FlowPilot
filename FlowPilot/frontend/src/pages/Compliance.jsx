import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  FileCheck,
  Building,
  UploadCloud,
  ShieldCheck,
  Calendar
} from 'lucide-react';

const REQ_TYPES = [
  'Faculty Cadre Ratio',
  'Fire Safety NOC',
  'Building Stability Certificate',
  'Anti-Ragging Committee',
  'Grievance Redressal Portal',
  'Laboratory Equipment Compliance',
  'Land Title & Encumbrance'
];

export const Compliance = () => {
  const { user, isInstitution, isAdmin, isOfficial } = useAuth();
  const [searchParams] = useSearchParams();

  const [complianceItems, setComplianceItems] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(searchParams.get('overdue_only') === 'true');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    institution_id: isInstitution ? user.institution_id : '',
    requirement_title: '',
    requirement_type: REQ_TYPES[0],
    description: '',
    due_date: ''
  });

  const [evidenceForm, setEvidenceForm] = useState({
    evidence_note: '',
    document_reference: ''
  });

  const [verifyForm, setVerifyForm] = useState({
    status: 'Verified',
    remarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCompliance = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (overdueOnly) params.overdue_only = 'true';

      const res = await api.getCompliance(params);
      if (res.success) {
        setComplianceItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load compliance records:', err);
      setError('Unable to fetch compliance records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, [search, statusFilter, overdueOnly]);

  useEffect(() => {
    async function loadInsts() {
      if (!isInstitution) {
        try {
          const res = await api.getInstitutions();
          if (res.success && res.data.length > 0) {
            setInstitutions(res.data);
            if (!createForm.institution_id) {
              setCreateForm(prev => ({ ...prev, institution_id: res.data[0].id }));
            }
          }
        } catch (e) {}
      }
    }
    loadInsts();
  }, [isInstitution]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.createCompliance(createForm);
      if (res.success) {
        setSuccessMsg('Compliance requirement recorded successfully.');
        setIsCreateOpen(false);
        setCreateForm({
          institution_id: isInstitution ? user.institution_id : (institutions[0]?.id || ''),
          requirement_title: '',
          requirement_type: REQ_TYPES[0],
          description: '',
          due_date: ''
        });
        fetchCompliance();
      }
    } catch (err) {
      setError(err.message || 'Failed to create compliance item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.updateCompliance(selectedItem.id, {
        evidence_note: evidenceForm.evidence_note,
        document_reference: evidenceForm.document_reference,
        status: 'Submitted'
      });
      if (res.success) {
        setSuccessMsg('Compliance evidence submitted. Pending official review.');
        setIsEvidenceModalOpen(false);
        fetchCompliance();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.updateCompliance(selectedItem.id, {
        status: verifyForm.status
      });
      if (res.success) {
        setSuccessMsg(`Compliance item marked as ${verifyForm.status}.`);
        setIsVerifyModalOpen(false);
        fetchCompliance();
      }
    } catch (err) {
      setError(err.message || 'Failed to verify compliance item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEvidence = (item) => {
    setSelectedItem(item);
    setEvidenceForm({
      evidence_note: item.evidence_note || '',
      document_reference: item.document_reference || ''
    });
    setIsEvidenceModalOpen(true);
  };

  const openVerify = (item) => {
    setSelectedItem(item);
    setVerifyForm({
      status: 'Verified',
      remarks: ''
    });
    setIsVerifyModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Institutional Compliance Monitoring</h2>
          <p>
            Track mandatory statutory disclosures, safety clearances, faculty cadre norms, and anti-ragging affidavits.
          </p>
        </div>
        {!isInstitution && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Create Mandate</span>
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
            placeholder="Search by Requirement Title, Type, or Institution..."
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
          <option value="Pending">Pending</option>
          <option value="Submitted">Submitted</option>
          <option value="Verified">Verified</option>
          <option value="Overdue">Overdue</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
          />
          <span>Show Overdue Only</span>
        </label>

        {(search || statusFilter || overdueOnly) && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setOverdueOnly(false);
            }}
            className="btn-secondary btn-sm"
          >
            Reset
          </button>
        )}
      </div>

      {/* Compliance Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requirement Title</th>
                <th>Type</th>
                <th>Institution</th>
                <th>Due Date & Countdown</th>
                <th>Status</th>
                <th>Evidence Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Loading compliance records...
                  </td>
                </tr>
              ) : complianceItems.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No compliance records found.
                  </td>
                </tr>
              ) : (
                complianceItems.map((c) => {
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.requirement_title}</div>
                        {c.description && <div style={{ fontSize: '12px', color: '#64748b' }}>{c.description}</div>}
                      </td>
                      <td style={{ fontSize: '13px', fontWeight: 500 }}>{c.requirement_type}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.institution_name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{c.institution_code}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: c.isOverdue ? '#dc2626' : '#0f172a' }}>
                          {c.due_date}
                        </div>
                        {c.status !== 'Verified' && (
                          <div style={{ fontSize: '11px', fontWeight: 600, color: c.isOverdue ? '#dc2626' : c.isUrgent ? '#d97706' : '#64748b' }}>
                            {c.isOverdue ? `${Math.abs(c.diffDays)} days overdue` : `${c.diffDays} days left`}
                          </div>
                        )}
                      </td>
                      <td>
                        <StatusBadge value={c.isOverdue ? 'Overdue' : c.status} />
                      </td>
                      <td>
                        {c.document_reference ? (
                          <div>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                              {c.document_reference}
                            </span>
                            {c.evidence_note && (
                              <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.evidence_note}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No evidence filed</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {/* Institution users can submit evidence */}
                          {isInstitution && (
                            <button
                              onClick={() => openEvidence(c)}
                              className="btn-secondary btn-sm"
                            >
                              <UploadCloud size={14} />
                              <span>Submit Evidence</span>
                            </button>
                          )}

                          {/* Admin & Official can verify */}
                          {(isAdmin || isOfficial) && (
                            <>
                              <button
                                onClick={() => openVerify(c)}
                                className="btn-primary btn-sm"
                              >
                                <CheckCircle2 size={14} />
                                <span>Verify</span>
                              </button>
                              <button
                                onClick={() => openEvidence(c)}
                                className="btn-secondary btn-sm"
                              >
                                Edit / Evidence
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Compliance Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Issue Institutional Compliance Mandate"
        maxWidth="640px"
      >
        <form onSubmit={handleCreateSubmit}>
          {!isInstitution ? (
            <div className="form-group">
              <label>Target Institution *</label>
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
              <label>Institution</label>
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
              <label>Requirement Title *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Fire Safety NOC Renewal"
                value={createForm.requirement_title}
                onChange={(e) => setCreateForm({ ...createForm, requirement_title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Requirement Type *</label>
              <select
                className="select-control"
                value={createForm.requirement_type}
                onChange={(e) => setCreateForm({ ...createForm, requirement_type: e.target.value })}
              >
                {REQ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Submission Due Date *</label>
            <input
              type="date"
              className="input-control"
              value={createForm.due_date}
              onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Mandate Description & Specific Directives</label>
            <textarea
              className="textarea-control"
              rows="3"
              placeholder="State the statutory requirement clause, required certifications, or testing protocols..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
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
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Compliance Mandate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Evidence Modal */}
      {selectedItem && (
        <Modal
          isOpen={isEvidenceModalOpen}
          onClose={() => setIsEvidenceModalOpen(false)}
          title={`File Compliance Evidence: ${selectedItem.requirement_title}`}
          maxWidth="560px"
        >
          <form onSubmit={handleEvidenceSubmit}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '18px', fontSize: '13px' }}>
              <div><strong>Institution:</strong> {selectedItem.institution_name}</div>
              <div><strong>Due Date:</strong> {selectedItem.due_date}</div>
              <div><strong>Requirement:</strong> {selectedItem.requirement_type}</div>
            </div>

            <div className="form-group">
              <label>Official Document Reference / Dispatch Token *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. NOC/FIRE/2026/BLR-902 or REG-CERT-1102"
                value={evidenceForm.document_reference}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, document_reference: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Evidence Note & Supporting Description *</label>
              <textarea
                className="textarea-control"
                rows="4"
                placeholder="Detail the renewal date, issuing authority, certificate validity dates, and fulfillment remarks..."
                value={evidenceForm.evidence_note}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, evidence_note: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEvidenceModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Evidence for Review'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Verification Modal */}
      {selectedItem && (
        <Modal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          title={`Official Verification Sign-Off: ${selectedItem.requirement_title}`}
          maxWidth="560px"
        >
          <form onSubmit={handleVerifySubmit}>
            <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '18px', fontSize: '13px' }}>
              <div><strong>Institution:</strong> {selectedItem.institution_name}</div>
              <div><strong>Evidence Reference:</strong> {selectedItem.document_reference || 'Pending submission'}</div>
              {selectedItem.evidence_note && (
                <div style={{ marginTop: '6px', color: '#1e3a8a' }}>
                  <strong>Submitted Note:</strong> "{selectedItem.evidence_note}"
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Verification Decision *</label>
              <select
                className="select-control"
                value={verifyForm.status}
                onChange={(e) => setVerifyForm({ ...verifyForm, status: e.target.value })}
              >
                <option value="Verified">Verified - Satisfies Statutory Norms</option>
                <option value="Pending">Pending - Return for Clarification / Resubmission</option>
                <option value="Overdue">Overdue - Flag Non-Compliance</option>
              </select>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
              * Official note: Submitting verified status commits your digital credential to the auditable institutional log in compliance with AICTE guidelines.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsVerifyModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Committing...' : 'Commit Verification'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
