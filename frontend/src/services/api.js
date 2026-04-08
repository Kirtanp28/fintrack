import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintrack-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fintrack-token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  signup: async (data) => (await api.post('/auth/signup', data)).data,
  login: async (data) => (await api.post('/auth/login', data)).data,
  getMe: async () => (await api.get('/auth/me')).data,
  updateProfile: async (data) => (await api.put('/auth/profile', data)).data,
};

// ── Expenses ──────────────────────────────────────────────────────────────────
export const expenseService = {
  add: async (data) => (await api.post('/expenses', data)).data,
  getAll: async (params) => (await api.get('/expenses', { params })).data,
  update: async (id, data) => (await api.put(`/expenses/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/expenses/${id}`)).data,
  getAnalytics: async (params) => (await api.get('/expenses/analytics', { params })).data,
};

// ── Income ────────────────────────────────────────────────────────────────────
export const incomeService = {
  add: async (data) => (await api.post('/income', data)).data,
  getAll: async (params) => (await api.get('/income', { params })).data,
  delete: async (id) => (await api.delete(`/income/${id}`)).data,
  getAnalytics: async (params) => (await api.get('/income/analytics', { params })).data,
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiService = {
  analyze: async () => (await api.post('/ai/analyze')).data,
};

// ── Budget ────────────────────────────────────────────────────────────────────
export const budgetService = {
  get: async (params) => (await api.get('/budget', { params })).data,
  update: async (data) => (await api.put('/budget', data)).data,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const exportToCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(r => Object.values(r).map(v =>
    typeof v === 'string' && v.includes(',') ? `"${v}"` : v
  ).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
};

export default api;
