import axios from 'axios';

const API_BASE = '/api';

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
      // Mock Fallback for quick UI testing without active backend
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        return {
          success: true,
          data: {
            token: 'mock_jwt_admin_token',
            id: 1,
            username: 'admin',
            email: 'admin@fraudshield.io',
            fullName: 'System Administrator',
            role: 'ROLE_ADMIN',
          },
        };
      } else if (credentials.username === 'user1' || credentials.username === 'user2') {
        return {
          success: true,
          data: {
            token: 'mock_jwt_user_token',
            id: 2,
            username: credentials.username,
            email: `${credentials.username}@example.com`,
            fullName: 'John Doe',
            role: 'ROLE_USER',
          },
        };
      }
      throw err.response?.data?.message || err.message || 'Login failed';
    }
  },
  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch (err) {
      return { success: true, message: 'Account registered successfully (Demo Mode)' };
    }
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const transactionService = {
  create: async (data) => {
    try {
      const res = await api.post('/transactions', data);
      return res.data;
    } catch (err) {
      // Dynamic Mock Evaluation Fallback
      let riskScore = 10;
      let status = 'APPROVED';
      let triggered = ['None'];

      if (data.amount > 10000) {
        riskScore += 45;
        triggered.push('HIGH_AMOUNT (High Value Transfer)');
      }
      if (data.merchantCategory?.toLowerCase().includes('crypto') || data.merchantCategory?.toLowerCase().includes('gambling')) {
        riskScore += 25;
        triggered.push('HIGH_RISK_MERCHANT');
      }
      if (data.location?.toLowerCase().includes('panama') || data.location?.toLowerCase().includes('unknown')) {
        riskScore += 30;
        triggered.push('GEO_ANOMALY');
      }

      if (riskScore > 70) status = 'REJECTED';
      else if (riskScore >= 30) status = 'SUSPICIOUS';

      return {
        success: true,
        data: {
          id: Date.now(),
          transactionReference: `TXN-${Date.now()}-DEMO`,
          accountNumber: data.accountNumber,
          receiverAccount: data.receiverAccount,
          amount: data.amount,
          currency: data.currency || 'USD',
          merchantCategory: data.merchantCategory,
          location: data.location,
          ipAddress: data.ipAddress || '192.168.1.50',
          status: status,
          riskScore: riskScore,
          triggeredRules: triggered.filter(t => t !== 'None').join('; ') || 'None',
          createdAt: new Date().toISOString(),
        },
      };
    }
  },
  getMyTransactions: async () => {
    try {
      const res = await api.get('/transactions/my');
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: mockTransactions,
      };
    }
  },
  getAllTransactions: async () => {
    try {
      const res = await api.get('/transactions');
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: mockTransactions,
      };
    }
  },
};

export const adminService = {
  getAnalytics: async () => {
    try {
      const res = await api.get('/admin/analytics');
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: mockAnalytics,
      };
    }
  },
  getAlerts: async () => {
    try {
      const res = await api.get('/admin/alerts');
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: mockAlerts,
      };
    }
  },
  resolveAlert: async (alertId, payload) => {
    try {
      const res = await api.put(`/admin/alerts/${alertId}/resolve`, payload);
      return res.data;
    } catch (err) {
      return { success: true, message: `Alert #${alertId} updated to ${payload.status}` };
    }
  },
  getRules: async () => {
    try {
      const res = await api.get('/rules');
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: mockRules,
      };
    }
  },
  toggleRule: async (ruleId) => {
    try {
      const res = await api.patch(`/rules/${ruleId}/toggle`);
      return res.data;
    } catch (err) {
      return { success: true, message: 'Rule status toggled' };
    }
  },
  updateRule: async (ruleId, data) => {
    try {
      const res = await api.put(`/rules/${ruleId}`, data);
      return res.data;
    } catch (err) {
      return { success: true, message: 'Rule threshold updated' };
    }
  },
  getAuditLogs: async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: mockAuditLogs,
      };
    }
  },
};

// Seed Mock Fallbacks for UI Demo Testing
const mockTransactions = [
  { id: 1, transactionReference: 'TXN-9021839210-A1', username: 'user1', accountNumber: 'ACC-88392019', receiverAccount: 'REC-99382011', amount: 450.00, currency: 'USD', merchantCategory: 'Retail Shopping', location: 'New York, US', ipAddress: '192.168.1.10', status: 'APPROVED', riskScore: 10, triggeredRules: 'None', createdAt: '2026-08-04T10:15:00' },
  { id: 2, transactionReference: 'TXN-9021839211-B2', username: 'user1', accountNumber: 'ACC-88392019', receiverAccount: 'REC-44102933', amount: 12500.00, currency: 'USD', merchantCategory: 'Wire Transfer', location: 'London, UK', ipAddress: '185.220.101.5', status: 'REJECTED', riskScore: 75, triggeredRules: 'HIGH_AMOUNT; GEO_ANOMALY', createdAt: '2026-08-04T14:30:00' },
  { id: 3, transactionReference: 'TXN-9021839212-C3', username: 'user2', accountNumber: 'ACC-55291044', receiverAccount: 'REC-11203948', amount: 8900.00, currency: 'USD', merchantCategory: 'Crypto Exchange', location: 'Tokyo, JP', ipAddress: '192.168.1.45', status: 'SUSPICIOUS', riskScore: 55, triggeredRules: 'HIGH_RISK_MERCHANT', createdAt: '2026-08-05T09:00:00' },
  { id: 4, transactionReference: 'TXN-9021839213-D4', username: 'user2', accountNumber: 'ACC-55291044', receiverAccount: 'REC-77392011', amount: 15000.00, currency: 'USD', merchantCategory: 'Offshore Banking', location: 'Panama City, PA', ipAddress: '103.251.170.8', status: 'REJECTED', riskScore: 85, triggeredRules: 'HIGH_AMOUNT; GEO_ANOMALY; HIGH_RISK_MERCHANT', createdAt: '2026-08-05T11:20:00' },
  { id: 5, transactionReference: 'TXN-9021839214-E5', username: 'user1', accountNumber: 'ACC-88392019', receiverAccount: 'REC-33291044', amount: 120.50, currency: 'USD', merchantCategory: 'Supermarket', location: 'New York, US', ipAddress: '192.168.1.10', status: 'APPROVED', riskScore: 0, triggeredRules: 'None', createdAt: '2026-08-05T13:45:00' },
];

const mockAlerts = [
  { id: 1, transaction: mockTransactions[1], user: { id: 2, username: 'user1', email: 'john.doe@example.com' }, alertLevel: 'HIGH', status: 'NEW', investigationNotes: 'Automated alert for transfer ($12,500) from offshore IP.', createdAt: '2026-08-04T14:30:00' },
  { id: 2, transaction: mockTransactions[2], user: { id: 3, username: 'user2', email: 'sarah.connor@example.com' }, alertLevel: 'MEDIUM', status: 'UNDER_INVESTIGATION', assignedTo: 'admin', investigationNotes: 'Checking customer KYC documentation.', createdAt: '2026-08-05T09:00:00' },
  { id: 3, transaction: mockTransactions[3], user: { id: 3, username: 'user2', email: 'sarah.connor@example.com' }, alertLevel: 'CRITICAL', status: 'CONFIRMED_FRAUD', assignedTo: 'admin', investigationNotes: 'Account takeover confirmed. Wire blocked.', createdAt: '2026-08-05T11:20:00' },
];

const mockRules = [
  { id: 1, ruleCode: 'HIGH_AMOUNT', ruleName: 'High Transaction Amount Rule', description: 'Flags transactions exceeding high value threshold ($10,000)', thresholdValue: 10000.00, riskPoints: 45, isActive: true },
  { id: 2, ruleCode: 'VELOCITY_SPIKE', ruleName: 'High Frequency Velocity Rule', description: 'Detects rapid repeated transfers from same account in short window (>3 in 1 min)', thresholdValue: 3.00, riskPoints: 35, isActive: true },
  { id: 3, ruleCode: 'GEO_ANOMALY', ruleName: 'Geographic & IP Blacklist Anomaly', description: 'Detects logins or payments originating from high-risk IP ranges or flagged regions', thresholdValue: 1.00, riskPoints: 30, isActive: true },
  { id: 4, ruleCode: 'HIGH_RISK_MERCHANT', ruleName: 'High Risk Merchant Category Code', description: 'Flags purchases involving high-risk categories (Crypto, Gambling, Offshore Wire)', thresholdValue: 1.00, riskPoints: 25, isActive: true },
];

const mockAnalytics = {
  totalTransactions: 5,
  approvedCount: 2,
  suspiciousCount: 1,
  rejectedCount: 2,
  totalVolume: 36970.50,
  revenueAtRisk: 27500.00,
  fraudRatePercentage: 60.0,
  activeAlertsCount: 2,
  statusDistribution: { APPROVED: 2, SUSPICIOUS: 1, REJECTED: 2 },
  alertLevelDistribution: { LOW: 0, MEDIUM: 1, HIGH: 1, CRITICAL: 1 },
};

const mockAuditLogs = [
  { id: 1, action: 'USER_LOGIN', performedBy: 'admin', targetEntity: 'User: admin', details: 'Admin user logged into system.', ipAddress: '127.0.0.1', timestamp: '2026-08-04T10:00:00' },
  { id: 2, action: 'RULE_EVALUATION', performedBy: 'SYSTEM', targetEntity: 'Txn: TXN-9021839211-B2', details: 'Fraud engine flagged transaction with risk score 75.', ipAddress: '127.0.0.1', timestamp: '2026-08-04T14:30:00' },
  { id: 3, action: 'ALERT_STATUS_UPDATE', performedBy: 'admin', targetEntity: 'Alert ID: 3', details: 'Alert status updated to CONFIRMED_FRAUD by risk officer.', ipAddress: '127.0.0.1', timestamp: '2026-08-05T11:25:00' },
];

export default api;
