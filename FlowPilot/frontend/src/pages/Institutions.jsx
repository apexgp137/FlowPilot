import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'Engineering & Technology',
  'Engineering & Management',
  'Pharmacy',
  'Architecture & Planning',
  'Applied Sciences & Tech',
  'Management Studies'
];

export const Institutions = () => {
  const { user, isAdmin, isOfficial, isInstitution } = useAuth();

  const [institutions, setInstitutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // New Institution Form
  const [form, setForm] = useState({
    institution_code: '',
    name: '',
    category: CATEGORIES[0],
    state: '',
    city: '',
    address: '',
    pincode: '',
    contact_email: '',
    contact_phone: '',
    established_year: 2020,
    status: 'Active'
  });

  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.getInstitutions(params);
      if (res.success) {
        setInstitutions(res.data);
      }
    } catch (err) {
      console.error('Failed to load institutions:', err);
      setError('Unable to fetch institutions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [search, categoryFilter, statusFilter]);

  const openDetails = async (id) => {
    setIsDetailLoading(true);
    try {
      const res = await api.getInstitutionById(id);
      if (res.success) {
        setSelectedInst(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch institution details.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.createInstitution(form);
      if (res.success) {
        setSuccessMsg(`Institution "${form.name}" registered successfully.`);
        setIsAddOpen(false);
        setForm({
          institution_code: '',
          name: '',
          category: CATEGORIES[0],
          state: '',
          city: '',
          address: '',
          pincode: '',
          contact_email: '',
          contact_phone: '',
          established_year: 2020,
          status: 'Active'
        });
        fetchInstitutions();
      }
    } catch (err) {
      setError(err.message || 'Failed to register institution.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Technical Institution Registry</h2>
          <p>
            {isInstitution
              ? 'Institutional directory profile and associated compliance and approval filings.'
              : 'Directory of AICTE-approved and applicant technical colleges, polytechnics, and universities.'}
          </p>
        </div>
        {!isInstitution && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Register Institution</span>
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
      {!isInstitution && (
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              className="input-control"
              placeholder="Search by Institution Name, Code, or City..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-control"
            style={{ width: 'auto', minWidth: '180px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="select-control"
            style={{ width: 'auto', minWidth: '140px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      )}

      {/* Institutions Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Institution Name</th>
                <th>Category</th>
                <th>State & City</th>
                <th>Contact Details</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Loading institutions...
                  </td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No institution records found.
                  </td>
                </tr>
              ) : (
                institutions.map((inst) => (
                  <tr key={inst.id}>
                    <td className="ref-cell">{inst.institution_code}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{inst.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Est. {inst.established_year || 'N/A'}</div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{inst.category}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <MapPin size={14} color="#64748b" />
                        <span>{inst.city}, {inst.state}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#334155' }}>{inst.contact_email}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{inst.contact_phone || 'N/A'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>
                        {inst.total_applications || 0}
                      </span>{' '}
                      <span style={{ fontSize: '11px', color: '#64748b' }}>filings</span>
                    </td>
                    <td>
                      <StatusBadge value={inst.status} />
                    </td>
                    <td>
                      <button
                        onClick={() => openDetails(inst.id)}
                        className="btn-secondary btn-sm"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Institution Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Technical Institution"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>AICTE Institution Permanent ID / Code *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. 1-70928192"
                value={form.institution_code}
                onChange={(e) => setForm({ ...form, institution_code: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Institutional Category</label>
              <select
                className="select-control"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Institution Full Legal Name *</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Cambridge Institute of Science & Technology"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Karnataka"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Bengaluru"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Campus Address</label>
            <input
              type="text"
              className="input-control"
              placeholder="Plot / Survey No, Institutional Area..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Official Contact Email *</label>
              <input
                type="email"
                className="input-control"
                placeholder="principal@institution.edu.in"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Official Contact Phone</label>
              <input
                type="text"
                className="input-control"
                placeholder="+91 80 1234 5678"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Established Year</label>
              <input
                type="number"
                className="input-control"
                value={form.established_year}
                onChange={(e) => setForm({ ...form, established_year: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                className="select-control"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Register Institution
            </button>
          </div>
        </form>
      </Modal>

      {/* Institution Dossier Modal */}
      {selectedInst && (
        <Modal
          isOpen={!!selectedInst}
          onClose={() => setSelectedInst(null)}
          title={`Institution Dossier: ${selectedInst.name}`}
          maxWidth="840px"
        >
          {isDetailLoading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Loading dossier...</div>
          ) : (
            <div>
              {/* Institution Header Details */}
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
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{selectedInst.name}</h3>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Code: <strong>{selectedInst.institution_code}</strong> &bull; Category: {selectedInst.category}
                  </div>
                </div>
                <StatusBadge value={selectedInst.status} />
              </div>

              {/* Summary Metrics */}
              {selectedInst.summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Total Filings</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{selectedInst.summary.totalApplications}</div>
                  </div>
                  <div style={{ background: '#fffbeb', padding: '10px', borderRadius: '6px', border: '1px solid #fde68a', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#d97706', textTransform: 'uppercase' }}>In Scrutiny</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#b45309' }}>{selectedInst.summary.pendingApplications}</div>
                  </div>
                  <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#059669', textTransform: 'uppercase' }}>Approved</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857' }}>{selectedInst.summary.approvedApplications}</div>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#2563eb', textTransform: 'uppercase' }}>Compliance Items</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1d4ed8' }}>{selectedInst.summary.totalCompliance}</div>
                  </div>
                </div>
              )}

              {/* Associated Applications */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a' }}>
                  Associated Approval Applications ({selectedInst.applications?.length || 0})
                </h4>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ref No.</th>
                        <th>Type</th>
                        <th>Stage</th>
                        <th>Status</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInst.applications?.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>No applications on record.</td>
                        </tr>
                      ) : (
                        selectedInst.applications?.map(a => (
                          <tr key={a.id}>
                            <td className="ref-cell">{a.reference_no}</td>
                            <td>{a.application_type}</td>
                            <td><StatusBadge value={a.current_stage} /></td>
                            <td><StatusBadge value={a.status} /></td>
                            <td style={{ fontSize: '12px' }}>{a.due_date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Associated Compliance Items */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a' }}>
                  Compliance & Statutory Requirements ({selectedInst.compliance?.length || 0})
                </h4>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Requirement</th>
                        <th>Type</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInst.compliance?.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>No compliance mandates recorded.</td>
                        </tr>
                      ) : (
                        selectedInst.compliance?.map(c => (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 600 }}>{c.requirement_title}</td>
                            <td style={{ fontSize: '12px' }}>{c.requirement_type}</td>
                            <td style={{ fontSize: '12px' }}>{c.due_date}</td>
                            <td><StatusBadge value={c.status} /></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
