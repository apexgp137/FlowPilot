import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Users, Plus, Search, Shield, UserCheck, UserX, Mail, Lock } from 'lucide-react';

export const UserManagement = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'OFFICIAL',
    institution_id: '',
    designation: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Unable to fetch system user registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    async function loadInsts() {
      try {
        const res = await api.getInstitutions();
        if (res.success) {
          setInstitutions(res.data);
          if (res.data.length > 0) {
            setForm(prev => ({ ...prev, institution_id: res.data[0].id }));
          }
        }
      } catch (e) {}
    }
    loadInsts();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.createUser(form);
      if (res.success) {
        setSuccessMsg(`User ${form.email} created successfully.`);
        setIsAddOpen(false);
        setForm({
          name: '',
          email: '',
          password: '',
          role: 'OFFICIAL',
          institution_id: institutions[0]?.id || '',
          designation: '',
          phone: ''
        });
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.toggleUserStatus(user.id);
      if (res.success) {
        setSuccessMsg(res.message);
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>User Administration & Role Management</h2>
          <p>
            Manage regional scrutiny officers, committee members, and institutional principal accounts with granular authorization boundaries.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>Provision New Account</span>
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

      {/* Users Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer / User Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Affiliated Institution</th>
                <th>Designation / Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Loading user accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>ID: #{u.id}</div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: 500 }}>
                      {u.email}
                    </td>
                    <td>
                      <StatusBadge value={u.role} />
                    </td>
                    <td>
                      {u.institution_name ? (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{u.institution_name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{u.institution_code}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>AICTE Headquarters / Bureau</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{u.designation || 'N/A'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{u.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <StatusBadge value={u.is_active ? 'Active' : 'Inactive'} />
                    </td>
                    <td>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={u.is_active ? 'btn-danger btn-sm' : 'btn-success btn-sm'}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Provision New FlowPilot Account"
        maxWidth="600px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label>Full Legal Name *</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Dr. Ramesh Gupta"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Official Email Address *</label>
              <input
                type="email"
                className="input-control"
                placeholder="name@flowpilot.aicte.gov.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Temporary Password *</label>
              <input
                type="password"
                className="input-control"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Account Role *</label>
              <select
                className="select-control"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="OFFICIAL">OFFICIAL - Scrutiny Officer / EVC</option>
                <option value="ADMIN">ADMIN - Director & Superadmin</option>
                <option value="INSTITUTION">INSTITUTION - College Principal / Rep</option>
              </select>
            </div>

            {form.role === 'INSTITUTION' && (
              <div className="form-group">
                <label>Linked Institution *</label>
                <select
                  className="select-control"
                  value={form.institution_id}
                  onChange={(e) => setForm({ ...form, institution_id: e.target.value })}
                  required
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.institution_code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Designation Title</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Regional Scrutiny Officer"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="text"
                className="input-control"
                placeholder="+91 11 2958 1234"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
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
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Provision User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
