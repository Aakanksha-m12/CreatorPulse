import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    // 403 PREMIUM_REQUIRED is a billing state, not an auth failure — never log out for it.
    if (error.response?.status === 403 && error.response?.data?.code === 'PREMIUM_REQUIRED') {
      return Promise.reject(error);
    }
    // Access token expired? Try the refresh token once before logging out.
    if (error.response?.status === 401 && !original._retried && !original.url?.includes('/auth/')) {
      original._retried = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          localStorage.setItem('token', res.data.token);
          if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
          original.headers.Authorization = `Bearer ${res.data.token}`;
          return api(original);
        } catch {
          // refresh failed — fall through to logout
        }
      }
    }
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

const saveSession = (data) => {
  if (data.token) localStorage.setItem('token', data.token);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
};

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetOtp: (data) => api.post('/auth/verify-reset-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  save: (data) => api.post('/profile', data),
  saveGoals: (goals) => api.post('/profile/goals', { goals }),
  uploadPhoto: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/profile/photo', fd);
  },
};

export const socialAPI = {
  overview: () => api.get('/social/overview'),
  refresh: () => api.post('/social/refresh'),
  growth: (range = 'week') => api.get('/social/growth', { params: { range } }),
  manual: (data) => api.post('/social/manual', data),
  entries: (manualOnly = false) => api.get('/social/entries', { params: { manualOnly } }),
  updateEntry: (id, data) => api.put(`/social/entries/${id}`, data),
  deleteEntry: (id) => api.delete(`/social/entries/${id}`),
};

export const contentAPI = {
  list: () => api.get('/content'),
};

export const thumbnailAPI = {
  score: (files) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return api.post('/thumbnails/score', fd);
  },
  history: () => api.get('/thumbnails/history'),
};

export const optimizeAPI = {
  analyze: (data) => api.post('/optimize/analyze', data),
  history: () => api.get('/optimize/history'),
};

export const postingAPI = {
  personal: () => api.get('/posting-times/personal'),
  schedule: (platform, niche) => api.get('/posting-times/schedule', { params: { platform, niche } }),
};

export const plansAPI = {
  list: () => api.get('/plans'),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  remove: (id) => api.delete(`/plans/${id}`),
};

export const billingAPI = {
  status: () => api.get('/billing/status'),
  history: () => api.get('/billing/history'),
  order: (plan) => api.post('/billing/order', { plan }),
  verify: (data) => api.post('/billing/verify', data),
  cancel: () => api.post('/billing/cancel'),
};

export const historyAPI = {
  recent: (limit = 20) => api.get('/history/recent', { params: { limit } }),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
