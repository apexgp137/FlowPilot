const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('flowpilot_token') || localStorage.getItem('flowguard_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // If 401 Unauthorized and token expired, clear token and notify
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('flowpilot_token');
      localStorage.removeItem('flowguard_token');
      localStorage.removeItem('flowpilot_user');
      localStorage.removeItem('flowguard_user');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      err.message = 'Unable to connect to FlowPilot backend service. Please ensure the backend is running.';
    }
    throw err;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),

  // Dashboard
  getDashboardStats: () => api.get('/dashboard'),

  // Applications
  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/applications${query ? `?${query}` : ''}`);
  },
  getApplicationById: (id) => api.get(`/applications/${id}`),
  createApplication: (data) => api.post('/applications', data),
  updateWorkflow: (id, data) => api.patch(`/applications/${id}`, data),
  getApplicationHistory: (id) => api.get(`/applications/${id}/history`),

  // Institutions
  getInstitutions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/institutions${query ? `?${query}` : ''}`);
  },
  getInstitutionById: (id) => api.get(`/institutions/${id}`),
  createInstitution: (data) => api.post('/institutions', data),
  updateInstitution: (id, data) => api.patch(`/institutions/${id}`, data),

  // Compliance
  getCompliance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/compliance${query ? `?${query}` : ''}`);
  },
  getComplianceById: (id) => api.get(`/compliance/${id}`),
  createCompliance: (data) => api.post('/compliance', data),
  updateCompliance: (id, data) => api.patch(`/compliance/${id}`, data),

  // EVC
  getEvcVisits: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/evc${query ? `?${query}` : ''}`);
  },
  scheduleEvcVisit: (data) => api.post('/evc', data),
  updateEvcVisit: (id, data) => api.patch(`/evc/${id}`, data),

  // Alerts
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/alerts${query ? `?${query}` : ''}`);
  },
  getUnreadAlertCount: () => api.get('/alerts/unread-count'),
  markAlertRead: (id) => api.patch(`/alerts/${id}/read`),
  markAllAlertsRead: () => api.post('/alerts/mark-all-read'),

  // Audit
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/audit${query ? `?${query}` : ''}`);
  },

  // Users
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),

  // Document Checking
  runDocumentCheck: (data) => api.post('/document-check/check', data),
  getDocumentChecks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/document-check${query ? `?${query}` : ''}`);
  }
};
