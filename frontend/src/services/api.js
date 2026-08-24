import axios from 'axios';

const formatBaseUrl = (url) => {
  if (!url || url === '/api') return '/api';
  let cleaned = url.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  if (!cleaned.endsWith('/api')) {
    cleaned = cleaned.replace(/\/+$/, '') + '/api';
  }
  return cleaned;
};

export const API_BASE = formatBaseUrl(import.meta.env.VITE_API_BASE_URL || '/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fraudshield_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || err.message || 'Login failed';
    }
  },
  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || err.message || 'Registration failed';
    }
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },
};

export const transactionService = {
  create: async (data) => {
    const res = await api.post('/transactions', data);
    return res.data;
  },
  dispute: async (id, data) => {
    const res = await api.post(`/transactions/${id}/dispute`, data);
    return res.data;
  },
  getMyTransactions: async () => {
    const res = await api.get('/transactions/my');
    return res.data;
  },
  getAllTransactions: async () => {
    const res = await api.get('/transactions');
    return res.data;
  },
};

export const adminService = {
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data;
  },
  getAlerts: async () => {
    const res = await api.get('/admin/alerts');
    return res.data;
  },
  resolveAlert: async (alertId, payload) => {
    const res = await api.put(`/admin/alerts/${alertId}/resolve`, payload);
    return res.data;
  },
  getRules: async () => {
    const res = await api.get('/rules');
    return res.data;
  },
  toggleRule: async (ruleId) => {
    const res = await api.patch(`/rules/${ruleId}/toggle`);
    return res.data;
  },
  updateRule: async (ruleId, data) => {
    const res = await api.put(`/rules/${ruleId}`, data);
    return res.data;
  },
  simulateRule: async (data) => {
    const res = await api.post('/rules/simulate', data);
    return res.data;
  },
  createRule: async (data) => {
    const res = await api.post('/rules', data);
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },
};

export const blacklistService = {
  getAll: async () => {
    const res = await api.get('/blacklist');
    return res.data;
  },
  add: async (data) => {
    const res = await api.post('/blacklist', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/blacklist/${id}`, data);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/blacklist/${id}`);
    return res.data;
  },
};

export default api;
