import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Calendar,
  Building
} from 'lucide-react';

export const DocumentCheck = () => {
  const [applications, setApplications] = useState([]);
  const [historyChecks, setHistoryChecks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const [form, setForm] = useState({
    application_id: '',
    document_name: 'apex_institute_faculty_cadre_2026.pdf',
    document_type: 'Faculty Cadre Ratio',
    cadre_ratio: '1:2:6',
    faculty_count: 24,
    prof_count: 3,
    land_acres: 3.5,
    land_unencumbered: true,
    fire_noc_valid: true,
    fire_noc_expiry: '2027-06-30'
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [appRes, checkRes] = await Promise.all([
          api.getApplications(),
          api.getDocumentChecks()
        ]);
        if (appRes.success && appRes.data.length > 0) {
          setApplications(appRes.data);
          setForm(prev => ({ ...prev, application_id: appRes.data[0].id }));
        }
        if (checkRes.success) {
          setHistoryChecks(checkRes.data);
        }
      } catch (e) {
        console.error('Error loading document check context:', e);
      }
    }
    loadData();
  }, []);

  const handleRunCheck = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessResult(null);

    try {
      const res = await api.runDocumentCheck(form);
      if (res.success) {
        setSuccessResult(res.data);
        // Refresh checks history
        const updated = await api.getDocumentChecks();
        if (updated.success) setHistoryChecks(updated.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to execute document analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Rule-Based Document Scrutiny Assistant</h2>
          <p>
            Automated compliance checklist validator to assist scrutiny officers in verifying statutory ratios, land title deeds, and safety clearances.
          </p>
        </div>
      </div>

      {/* Transparency & AI Non-Statutory Notice */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}
      >
        <Info size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: 1.5 }}>
          <strong>Assisted Scrutiny Notice:</strong> This module performs rule-based evaluation against configured AICTE Approval Process Handbook (APH) thresholds. Automated checks assist human reviewers by highlighting potential discrepancies and never replace authorized statutory decisions.
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Input Parameters Card */}
        <div className="card">
          <div className="card-header">
            <h3>Document Parameters & Extracted Metadata</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleRunCheck}>
              <div className="form-group">
                <label>Target Application Reference</label>
                <select
                  className="select-control"
                  value={form.application_id}
                  onChange={(e) => setForm({ ...form, application_id: e.target.value })}
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
                  <label>Document Name</label>
                  <input
                    type="text"
                    className="input-control"
                    value={form.document_name}
                    onChange={(e) => setForm({ ...form, document_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Statutory Document Type</label>
                  <select
                    className="select-control"
                    value={form.document_type}
                    onChange={(e) => setForm({ ...form, document_type: e.target.value })}
                  >
                    <option value="Faculty Cadre Ratio">Faculty Cadre Ratio</option>
                    <option value="Land Title & Encumbrance">Land Title & Encumbrance</option>
                    <option value="Fire Safety NOC">Fire Safety NOC</option>
                  </select>
                </div>
              </div>

              {/* Conditional Fields based on Document Type */}
              {form.document_type === 'Faculty Cadre Ratio' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                    Faculty Ratio Scrutiny Parameters (APH Table 7.1)
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Total Departmental Faculty</label>
                      <input
                        type="number"
                        className="input-control"
                        value={form.faculty_count}
                        onChange={(e) => setForm({ ...form, faculty_count: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Cadre: Professors Count</label>
                      <input
                        type="number"
                        className="input-control"
                        value={form.prof_count}
                        onChange={(e) => setForm({ ...form, prof_count: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.document_type === 'Land Title & Encumbrance' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                    Land Norm Parameters (Urban &ge; 2.5 Acres, Rural &ge; 7.5 Acres)
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contiguous Parcel (Acres)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-control"
                        value={form.land_acres}
                        onChange={(e) => setForm({ ...form, land_acres: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Unencumbered Ownership</label>
                      <select
                        className="select-control"
                        value={String(form.land_unencumbered)}
                        onChange={(e) => setForm({ ...form, land_unencumbered: e.target.value === 'true' })}
                      >
                        <option value="true">Yes - Clear Revenue Title</option>
                        <option value="false">No - Mortgage / Encumbrance Noted</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {form.document_type === 'Fire Safety NOC' && (
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                    State Fire Services Verification
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Clearance Certificate Valid</label>
                      <select
                        className="select-control"
                        value={String(form.fire_noc_valid)}
                        onChange={(e) => setForm({ ...form, fire_noc_valid: e.target.value === 'true' })}
                      >
                        <option value="true">Valid - Official Department Seal</option>
                        <option value="false">Invalid / Pending Clearance</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Expiration Date</label>
                      <input
                        type="date"
                        className="input-control"
                        value={form.fire_noc_expiry}
                        onChange={(e) => setForm({ ...form, fire_noc_expiry: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={isLoading}
              >
                <FileSearch size={16} />
                <span>{isLoading ? 'Running Rule Checks...' : 'Execute Automated Document Scrutiny'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Validation Results & Transparency Output */}
        <div className="card">
          <div className="card-header">
            <h3>Scrutiny Checklist & Rule Results</h3>
          </div>
          <div className="card-body">
            {!successResult ? (
              <div className="empty-state">
                <FileCheck size={40} />
                <h4>Awaiting Evaluation</h4>
                <p>Select an application and document type on the left to run rule-based compliance checks.</p>
              </div>
            ) : (
              <div>
                {/* Result Summary Banner */}
                <div
                  style={{
                    backgroundColor: successResult.verification_status === 'Verified Match' ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${successResult.verification_status === 'Verified Match' ? '#a7f3d0' : '#fecaca'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: successResult.verification_status === 'Verified Match' ? '#047857' : '#b91c1c' }}>
                      Status: {successResult.verification_status}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                      Passed {successResult.passed_checks} of {successResult.total_checks} automated checks
                    </div>
                  </div>
                  <StatusBadge value={successResult.verification_status} />
                </div>

                {/* Finding Notes */}
                <div style={{ fontSize: '13px', color: '#334155', marginBottom: '18px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong>Scrutiny Finding:</strong> {successResult.findings}
                </div>

                {/* Individual Rule Checklist Items */}
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                  Individual Rule Checks:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {successResult.checks.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px',
                        backgroundColor: c.status === 'PASS' ? '#ffffff' : '#fff5f5'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{c.rule}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{c.detail}</div>
                      </div>
                      <StatusBadge value={c.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Scrutiny Audit Records */}
      <div className="card">
        <div className="card-header">
          <h3>Historical Document Check Dossiers ({historyChecks.length})</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Application Reference</th>
                <th>Document Name</th>
                <th>Document Type</th>
                <th>Check Score</th>
                <th>Outcome Status</th>
                <th>Evaluator / Officer</th>
              </tr>
            </thead>
            <tbody>
              {historyChecks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No prior document checks recorded.
                  </td>
                </tr>
              ) : (
                historyChecks.map((hc) => (
                  <tr key={hc.id}>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(hc.created_at).toLocaleDateString()}
                    </td>
                    <td className="ref-cell">{hc.application_ref || 'General'}</td>
                    <td style={{ fontWeight: 600 }}>{hc.document_name}</td>
                    <td>{hc.document_type}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: hc.passed_checks === hc.total_checks ? '#059669' : '#dc2626' }}>
                        {hc.passed_checks} / {hc.total_checks} passed
                      </span>
                    </td>
                    <td>
                      <StatusBadge value={hc.verification_status} />
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {hc.reviewer_name || 'System Scrutiny'}
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
